// Static integrity audit of the built site: every prerendered page is parsed and checked for
// the things a crawler and a reader both need. Runs on dist/ with no browser.
//   npm run build && node scripts/audit-site.mjs
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://printxpdf.com'

const issues = []
const add = (page, kind, detail) => issues.push({ page, kind, detail })

async function htmlFiles(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) await htmlFiles(p, out)
    else if (e.name.endsWith('.html')) out.push(p)
  }
  return out
}

const routeOf = (file) => {
  const rel = path.relative(DIST, file)
  if (rel === 'index.html') return '/'
  if (!rel.endsWith('/index.html')) return '/' + rel.replace(/\.html$/, '')
  return '/' + rel.slice(0, -'/index.html'.length)
}

const attr = (tag, name) => new RegExp(`${name}="([^"]*)"`).exec(tag)?.[1] ?? null
const tagsOf = (html, name) => html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || []

const files = (await htmlFiles(DIST)).filter((f) => !/\/(app|404)\.html$/.test(f))
const pages = new Map()
for (const f of files) pages.set(routeOf(f), { file: f, html: await readFile(f, 'utf8') })

// routes that exist as files, plus the ones the SPA serves from the shell
const SHELL_ROUTES = [/^\/account(\/|$)/, /^\/admin(\/|$)/]
const known = new Set(pages.keys())
const isKnown = (r) => known.has(r) || SHELL_ROUTES.some((re) => re.test(r))

const titles = new Map()
const descriptions = new Map()

for (const [route, { html }] of pages) {
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1]?.trim()
  const desc = attr(tagsOf(html, 'meta').find((t) => /name="description"/.test(t)) || '', 'content')
  const canonical = attr(tagsOf(html, 'link').find((t) => /rel="canonical"/.test(t)) || '', 'href')
  const robots = attr(tagsOf(html, 'meta').find((t) => /name="robots"/.test(t)) || '', 'content')
  const noindex = /noindex/.test(robots || '')

  // ---------- head ----------
  if (!title) add(route, 'no-title', '')
  else {
    if (title.length > 65) add(route, 'title-too-long', `${title.length} chars: ${title.slice(0, 70)}`)
    if (!noindex) titles.set(title, [...(titles.get(title) || []), route])
  }
  if (!desc) add(route, 'no-description', '')
  else {
    if (desc.length < 100 || desc.length > 165) add(route, 'description-length', `${desc.length} chars`)
    if (!noindex) descriptions.set(desc, [...(descriptions.get(desc) || []), route])
  }
  if (!noindex) {
    if (!canonical) add(route, 'no-canonical', '')
    else if (canonical !== `${SITE}${route === '/' ? '/' : route}`) add(route, 'canonical-mismatch', canonical)
  }

  // ---------- body ----------
  const body = /<div id="root">([\s\S]*)<\/div>\s*<script/.exec(html)?.[1] ?? html
  const h1s = body.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || []
  // a noindex, sign-in-only route (/account) legitimately renders nothing until the browser takes over
  if (h1s.length === 0 && !noindex) add(route, 'no-h1', '')
  else if (h1s.length > 1) add(route, 'multiple-h1', `${h1s.length}`)

  for (const img of tagsOf(body, 'img')) {
    if (attr(img, 'alt') === null) add(route, 'img-without-alt', img.slice(0, 90))
  }

  // ---------- structured data ----------
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1])
      if (!data['@type']) add(route, 'schema-without-type', m[1].slice(0, 60))
    } catch (e) {
      add(route, 'schema-invalid-json', e.message.slice(0, 80))
    }
  }

  // ---------- internal links ----------
  for (const a of tagsOf(body, 'a')) {
    const href = attr(a, 'href')
    if (!href || /^(https?:|mailto:|tel:|javascript:|#|data:)/.test(href)) continue
    const target = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/'
    if (/\.(pdf|zip|xml|txt|jpg|png|svg|webmanifest)$/.test(target)) continue
    if (!isKnown(target)) add(route, 'dead-internal-link', href)
  }
}

for (const [title, routes] of titles) if (routes.length > 1) add(routes.join(', '), 'duplicate-title', title.slice(0, 60))
for (const [desc, routes] of descriptions) if (routes.length > 1) add(routes.join(', '), 'duplicate-description', desc.slice(0, 60))

// ---------- sitemap ----------
const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8')
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '') || '/')
for (const u of sitemapUrls) {
  const r = u.replace(/\/$/, '') || '/'
  if (!known.has(r)) add(r, 'sitemap-url-has-no-page', u)
}
const indexable = [...pages].filter(([, p]) => !/noindex/.test(p.html)).map(([r]) => r)
for (const r of indexable) {
  if (!sitemapUrls.some((u) => (u.replace(/\/$/, '') || '/') === r)) add(r, 'indexable-page-missing-from-sitemap', '')
}

// ---------- assets referenced by pages ----------
const assetRefs = new Set()
for (const [, { html }] of pages) {
  for (const m of html.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|jpg|png|svg|webp|zip|json))"/g)) assetRefs.add(m[1])
}
for (const a of assetRefs) {
  try {
    await stat(path.join(DIST, a))
  } catch {
    add('(assets)', 'missing-asset', a)
  }
}

// ---------- report ----------
const byKind = new Map()
for (const i of issues) byKind.set(i.kind, [...(byKind.get(i.kind) || []), i])
console.log(`Checked ${pages.size} pages, ${sitemapUrls.length} sitemap URLs, ${assetRefs.size} referenced assets\n`)
if (!issues.length) console.log('No issues found.')
for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${kind} (${list.length})`)
  for (const i of list.slice(0, 8)) console.log(`   ${i.page}${i.detail ? '  ' + i.detail : ''}`)
  if (list.length > 8) console.log(`   ... and ${list.length - 8} more`)
  console.log()
}
process.exit(issues.length ? 1 : 0)
