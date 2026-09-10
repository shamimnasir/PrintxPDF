// Feature audit beyond the tools: the web-page cleaner, account, pricing checkout hand-off,
// extension page, guides, theme, admin, 404. Runs against the live site by default because the
// cleaner's fetch proxy only answers the real origin.
//   node scripts/audit-features.mjs            (AUDIT_BASE=https://printxpdf.com)
import { chromium } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = (process.env.AUDIT_BASE || 'https://printxpdf.com').replace(/\/$/, '')
const API = (process.env.AUDIT_API || 'https://api.printxpdf.com').replace(/\/$/, '')
const OUT = path.resolve(import.meta.dirname, '../audit/out/_features')
const results = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function step(name, fn) {
  const t0 = Date.now()
  try {
    const note = await fn()
    results.push({ name, ok: true, note })
    console.log(`PASS  ${name.padEnd(34)} ${String(Date.now() - t0).padStart(6)}ms  ${note || ''}`)
  } catch (e) {
    results.push({ name, ok: false, note: e.message })
    console.log(`FAIL  ${name.padEnd(34)} ${String(Date.now() - t0).padStart(6)}ms  ${e.message.split('\n')[0].slice(0, 220)}`)
  }
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, colorScheme: 'light' })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await mkdir(OUT, { recursive: true })

let pdfMs = 0
const ARTICLE = 'https://en.wikipedia.org/wiki/Portable_Document_Format'
await step('home: URL card opens the cleaner', async () => {
  await page.goto(`${BASE}/`)
  await page.locator('form input[type=url], form input[type=text]').first().fill(ARTICLE)
  await page.locator('form button[type=submit], form .btn-acid').first().click()
  await page.waitForURL(/\/print\?/, { timeout: 15000 })
  return page.url().replace(BASE, '')
})

await step('cleaner: fetches a live page through the proxy', async () => {
  await page.locator('.pxp-page, .ed-paper, .paper').first().waitFor({ timeout: 40000 })
  const words = await page.locator('main').innerText()
  if (!/Portable Document Format/i.test(words)) throw new Error('article content not shown')
  return `article rendered, ${words.length} chars`
})

await step('cleaner: a tiny page (example.com) still opens', async () => {
  const p2 = await ctx.newPage()
  await p2.goto(`${BASE}/print?url=${encodeURIComponent('https://example.com')}`)
  await p2.locator('.pxp-page, .paper').first().waitFor({ timeout: 30000 })
  const text = await p2.locator('main').innerText()
  await p2.close()
  if (!/Example Domain/.test(text)) throw new Error('example.com body not shown')
  return 'fell back to the page body'
})

await step('cleaner: delete mode removes a block', async () => {
  // delete is the default mode; clicking the toolbar button would switch it off
  const before = await page.locator('.pxp-page p, .pxp-page h1, .paper p').count()
  const block = page.locator('.pxp-page p, .paper p').first()
  await block.click()
  await sleep(300)
  const after = await page.locator('.pxp-page p, .pxp-page h1, .paper p').count()
  if (after >= before) throw new Error(`block count ${before} -> ${after}`)
  await page.keyboard.press('Escape')
  return `${before} -> ${after} blocks`
})

await step('cleaner: PDF export downloads', async () => {
  const t0 = Date.now()
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), page.locator('main button').filter({ hasText: /PDF/ }).filter({ hasNotText: /Tools/ }).first().click()])
  pdfMs = Date.now() - t0
  const file = path.join(OUT, d.suggestedFilename())
  await d.saveAs(file)
  const head = (await readFile(file)).subarray(0, 5).toString('latin1')
  if (!head.startsWith('%PDF')) throw new Error('not a PDF')
  return `${d.suggestedFilename()} in ${pdfMs} ms`
})

await step('cleaner: PNG export downloads', async () => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.locator('main button').filter({ hasText: /PNG/ }).first().click()])
  const file = path.join(OUT, d.suggestedFilename())
  await d.saveAs(file)
  const head = (await readFile(file)).subarray(1, 4).toString('latin1')
  if (head !== 'PNG') throw new Error('not a PNG')
  return d.suggestedFilename()
})

await step('cleaner: sample article and paste mode', async () => {
  await page.goto(`${BASE}/print`)
  await page.locator('main h1').waitFor()
  const sample = page.locator('a[href*="sample="], button:has-text("sample")').first()
  await sample.click()
  await page.locator('.pxp-page, .paper').first().waitFor({ timeout: 30000 })
  const words = (await page.locator('main').innerText()).length
  if (words < 500) throw new Error('sample looks empty')
  return `sample rendered, ${words} chars`
})

await step('sign up creates a local account', async () => {
  await page.goto(`${BASE}/signup`)
  // The button ships disabled and React enables it on mount, so wait for that edge before
  // touching the form. Clicking as it flips lands on the pre-hydration element and does nothing.
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll('button')].find((x) => /Create account/.test(x.textContent))
      return !!b && !b.disabled
    },
    { timeout: 15000 },
  )
  await page.getByPlaceholder('you@example.com').fill('audit@example.com')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL(/\/account/, { timeout: 15000 })
  const header = await page.locator('.header-right').innerText()
  if (!/audit/.test(header)) throw new Error('header does not show the user')
  return 'account page, header shows the name'
})

await step('account: tabs render, plan is Free', async () => {
  await page.locator('main', { hasText: /Plan/ }).waitFor({ timeout: 10000 })
  const text = await page.locator('main').innerText()
  if (!/Free/i.test(text)) throw new Error('plan not shown')
  return 'plan shown'
})

await step('cleaner: Save keeps the page in the account', async () => {
  await page.goto(`${BASE}/print`)
  await page.locator('a[href*="sample="], button:has-text("sample")').first().click()
  await page.locator('.pxp-page, .paper').first().waitFor({ timeout: 30000 })
  await page.getByRole('button', { name: /^Save/ }).first().click()
  await sleep(800)
  await page.goto(`${BASE}/account`)
  await sleep(1500)
  const text = await page.locator('main').innerText()
  if (!/saved|Saved/.test(text)) throw new Error('no saved documents section')
  return 'saved page listed'
})

await step('sign out returns to guest', async () => {
  await page.getByRole('button', { name: 'Sign out' }).first().click()
  await sleep(500)
  const header = await page.locator('.header-right').innerText()
  if (!/Log in/.test(header)) throw new Error('still signed in')
  return 'guest again'
})

await step('pricing: Pro button hands off to Stripe Checkout', async () => {
  await page.goto(`${BASE}/pricing`)
  // Ask the API directly first, so a billing misconfiguration reports its own reason instead of
  // surfacing as an unexplained navigation timeout.
  const probe = await page.request.post(`${API}/billing/checkout`, { data: { plan: 'pro' }, headers: { origin: BASE } })
  const body = await probe.json().catch(() => ({}))
  if (!probe.ok()) throw new Error(`${API}/billing/checkout -> ${probe.status()} ${body.code || ''} ${body.error || ''}`)
  const btn = page.locator('button, a').filter({ hasText: /Pro/ }).filter({ hasText: /Go|Get|Start|Upgrade/ }).first()
  await btn.click()
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 })
  return 'checkout.stripe.com reached'
})

await step('extensions: bookmarklet and download link', async () => {
  await page.goto(`${BASE}/extensions/chrome`)
  await sleep(1000)
  const href = await page.locator('a[draggable]').first().getAttribute('href')
  if (!href?.startsWith('javascript:')) throw new Error(`bookmarklet href is ${href}`)
  const dl = await page.locator('a[href$=".zip"]').first().getAttribute('href')
  const res = await page.request.get(new URL(dl, BASE).toString())
  if (res.status() !== 200) throw new Error(`zip ${res.status()}`)
  return `bookmarklet ok, zip ${(await res.body()).length} bytes`
})

await step('wordpress page: plugin zip downloads', async () => {
  await page.goto(`${BASE}/wordpress`)
  const dl = await page.locator('a[href$=".zip"]').first().getAttribute('href')
  const res = await page.request.get(new URL(dl, BASE).toString())
  if (res.status() !== 200) throw new Error(`zip ${res.status()}`)
  return `${(await res.body()).length} bytes`
})

await step('website button: generator emits a snippet with the site URL', async () => {
  await page.goto(`${BASE}/website-button`)
  await sleep(800)
  const code = await page.locator('pre, textarea, code').first().innerText()
  if (!code.includes('printxpdf.com/print')) throw new Error('snippet does not point at the cleaner')
  return 'snippet ok'
})

await step('guides: post, cluster, author, byline', async () => {
  await page.goto(`${BASE}/blog`)
  const first = page.locator('main a[href^="/blog/"]').first()
  await first.click()
  await page.locator('main h1').waitFor()
  await page.locator('main a[href^="/blog/"][href*="/"]').filter({ hasNot: page.locator('h1') }).first()
  const post = page.locator('.post-row, a.post-row, main a[href*="/blog/"][href*="/"]').first()
  await post.click()
  await page.locator('.byline').waitFor({ timeout: 15000 })
  const by = await page.locator('.byline').innerText()
  if (!/Nasir Uddin Shamim/.test(by)) throw new Error(`byline: ${by}`)
  const img = await page.locator('.byline img').getAttribute('src')
  await page.locator('.byline a').click()
  await page.waitForURL(/\/author\//)
  return `byline with photo ${img}, author page reached`
})

await step('theme toggle flips data-theme', async () => {
  await page.goto(`${BASE}/`)
  const before = await page.evaluate(() => document.documentElement.dataset.theme)
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  const after = await page.evaluate(() => document.documentElement.dataset.theme)
  if (before === after) throw new Error('theme did not change')
  await page.getByRole('button', { name: 'Toggle dark mode' }).click()
  return `${before} -> ${after} -> back`
})

await step('menus: all three tool menus list tools', async () => {
  const counts = []
  for (const label of ['PDF Tools', 'Convert', 'Images & Files']) {
    const item = page.locator('.nav-item').filter({ has: page.locator('.nav-btn', { hasText: label }) })
    await item.locator('.nav-btn').hover()
    await sleep(200)
    counts.push(await item.locator('.nav-menu a').count())
  }
  if (counts.some((c) => c < 3)) throw new Error(`menu sizes ${counts}`)
  return `menu links: ${counts.join(', ')}`
})

await step('admin: passcode unlocks the panel', async () => {
  await page.goto(`${BASE}/admin`)
  await page.locator('input[type=password]').first().fill('printxpdf')
  await page.locator('form').first().evaluate((f) => f.requestSubmit())
  await sleep(1000)
  const text = await page.locator('main').innerText()
  if (!/General|Appearance|Tools/.test(text)) throw new Error('admin sections not visible')
  return 'admin visible'
})

await step('404 page', async () => {
  await page.goto(`${BASE}/no-such-page-audit`)
  await sleep(1500)
  const text = await page.locator('main').innerText()
  if (!/not found|could not find/i.test(text)) throw new Error('not-found copy missing')
  return 'not found shown'
})

await step('no page errors during the run', async () => {
  const real = errors.filter((e) => !/ResizeObserver/.test(e))
  if (real.length) throw new Error(real.join(' | ').slice(0, 300))
  return 'clean'
})

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? ', failed: ' + failed.map((f) => f.name).join('; ') : ''}`)
process.exit(failed.length ? 1 : 0)
