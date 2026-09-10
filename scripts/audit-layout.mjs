// Runtime and layout audit: opens every route in a real browser at desktop and phone widths and
// reports what a visitor would actually hit. Static checks live in audit-site.mjs; this one only
// catches things that need a rendering engine.
//
//   npx serve dist -l 4175 && node scripts/audit-layout.mjs
//   AUDIT_BASE=https://printxpdf.com node scripts/audit-layout.mjs
//   AUDIT_ONLY=/pricing,/support node scripts/audit-layout.mjs
import { chromium } from 'playwright'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BASE = (process.env.AUDIT_BASE || 'http://localhost:4175').replace(/\/$/, '')
const ONLY = process.env.AUDIT_ONLY ? new Set(process.env.AUDIT_ONLY.split(',')) : null

const sitemap = await readFile(path.join(ROOT, 'dist/sitemap.xml'), 'utf8')
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace('https://printxpdf.com', '') || '/')
  .filter((r) => !ONLY || ONLY.has(r))

const VIEWS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
]

const issues = []
const add = (route, view, kind, detail) => issues.push({ route, view, kind, detail })

// What the page looks like once it has settled, measured inside the page.
const inspect = () => {
  const out = { overflow: null, brokenImages: [], invisibleText: [], tinyTargets: [], emDash: [] }
  const vw = document.documentElement.clientWidth

  // horizontal overflow: find the widest offender rather than just reporting the symptom
  if (document.documentElement.scrollWidth > vw + 1) {
    let worst = null
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const over = Math.round(r.right - vw)
      if (over > 1 && (!worst || over > worst.over)) {
        const cs = getComputedStyle(el)
        if (cs.position === 'fixed') continue
        worst = {
          over,
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).slice(0, 60)) || '',
          text: (el.textContent || '').trim().slice(0, 50),
        }
      }
    }
    out.overflow = { scrollWidth: document.documentElement.scrollWidth, vw, worst }
  }

  // A lazy image that has not been scrolled to is not broken, so only trust an actual error:
  // either the browser recorded one, or the image finished loading with no pixels.
  for (const img of document.images) {
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) out.brokenImages.push(img.getAttribute('src') || '(no src)')
  }

  // text the same colour as what sits behind it would be invisible to a reader
  for (const el of document.querySelectorAll('h1,h2,h3,p,li,a,button,span')) {
    const t = (el.textContent || '').trim()
    if (!t || el.children.length) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue
    if (cs.color === cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      out.invisibleText.push(t.slice(0, 40))
    }
  }

  // an em dash anywhere on the site is a house-style violation (escaped so this file passes it too)
  const EM_DASH = String.fromCharCode(0x2014)
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.nodeValue.includes(EM_DASH)) out.emDash.push(n.nodeValue.trim().slice(0, 70))
  }

  return out
}

const browser = await chromium.launch()
let checked = 0

for (const view of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    colorScheme: 'light',
    ...(view.name === 'phone' ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
  })
  const page = await ctx.newPage()

  for (const route of routes) {
    const errors = []
    const failed = []
    const onError = (e) => errors.push(e.message)
    const onConsole = (m) => m.type() === 'error' && errors.push(m.text())
    const onResponse = (r) => {
      if (r.status() >= 400 && new URL(r.url()).origin === new URL(BASE).origin) {
        failed.push(`${r.status()} ${r.url().replace(BASE, '')}`)
      }
    }
    page.on('pageerror', onError)
    page.on('console', onConsole)
    page.on('response', onResponse)
    const imgFailures = []
    const onRequestFailed = (r) => r.resourceType() === 'image' && imgFailures.push(r.url().replace(BASE, ''))
    page.on('requestfailed', onRequestFailed)

    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 })
      await page.waitForTimeout(400)
      const r = await page.evaluate(inspect)

      if (r.overflow) {
        const w = r.overflow.worst
        add(route, view.name, 'horizontal-overflow', w ? `${w.over}px past the edge: <${w.tag} class="${w.cls}"> ${w.text}` : `${r.overflow.scrollWidth} > ${r.overflow.vw}`)
      }
      for (const src of [...new Set([...r.brokenImages, ...imgFailures])]) add(route, view.name, 'broken-image', src)
      for (const t of r.invisibleText.slice(0, 3)) add(route, view.name, 'invisible-text', t)
      for (const t of [...new Set(r.emDash)].slice(0, 3)) add(route, view.name, 'em-dash', t)
    } catch (e) {
      add(route, view.name, 'load-failed', e.message.split('\n')[0].slice(0, 140))
    }

    for (const e of [...new Set(errors)].slice(0, 3)) {
      if (/ResizeObserver|Failed to load resource/.test(e)) continue
      add(route, view.name, 'js-error', e.slice(0, 160))
    }
    for (const f of [...new Set(failed)].slice(0, 3)) add(route, view.name, 'request-failed', f)

    page.off('pageerror', onError)
    page.off('console', onConsole)
    page.off('response', onResponse)
    page.off('requestfailed', onRequestFailed)
    checked++
    if (checked % 25 === 0) console.log(`  ...${checked}/${routes.length * VIEWS.length}`)
  }
  await ctx.close()
}

await browser.close()

const byKind = new Map()
for (const i of issues) byKind.set(i.kind, [...(byKind.get(i.kind) || []), i])
console.log(`\nChecked ${routes.length} routes at ${VIEWS.map((v) => v.width + 'px').join(' and ')}\n`)
if (!issues.length) console.log('No issues found.')
for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${kind} (${list.length})`)
  for (const i of list.slice(0, 10)) console.log(`   ${i.view.padEnd(8)} ${i.route}  ${i.detail}`)
  if (list.length > 10) console.log(`   ... and ${list.length - 10} more`)
  console.log()
}
await writeFile(path.join(ROOT, 'audit/out/layout.json'), JSON.stringify(issues, null, 2))
process.exit(issues.length ? 1 : 0)
