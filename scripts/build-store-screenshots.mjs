// Chrome Web Store screenshots (1280x800), captured from real pages, never mocked.
//   node scripts/build-store-screenshots.mjs
// Shot 1 is the before/after the store cares about most: a real article as the browser
// renders it, beside the same article after the extension hands it to the cleaner.
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve(import.meta.dirname, '../extension/store-assets')
const SITE = process.env.AUDIT_BASE || 'https://printxpdf.com'
const ARTICLE = 'https://en.wikipedia.org/wiki/Portable_Document_Format'
const ACCENT = '#2b5bff'
const INK = '#0f172a'

const browser = await chromium.launch()
const shot = async (url, file, wait) => {
  const p = await browser.newPage({ viewport: { width: 1000, height: 1250 }, colorScheme: 'light' })
  await p.goto(url, { waitUntil: 'domcontentloaded' })
  if (wait) await p.locator(wait).first().waitFor({ timeout: 45000 })
  await p.waitForTimeout(2500)
  await p.evaluate(() => window.scrollTo(0, 0))
  await p.screenshot({ path: file })
  await p.close()
}

// the two halves, captured separately from the real pages
await shot(ARTICLE, path.join(OUT, '.before.png'))
await shot(`${SITE}/print?url=${encodeURIComponent(ARTICLE)}`, path.join(OUT, '.after.png'), '.pxp-page, .paper')

const dataUri = async (f) => `data:image/png;base64,${(await readFile(path.join(OUT, f))).toString('base64')}`
const before = await dataUri('.before.png')
const after = await dataUri('.after.png')

const composite = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1280px;height:800px;overflow:hidden;font-family:'Inter',system-ui,sans-serif}
  body{background:${INK};position:relative;padding:52px 52px 0}
  body::before{content:'';position:absolute;inset:0;
    background:radial-gradient(110% 80% at 100% 0%, ${ACCENT}44 0%, transparent 60%)}
  .head{position:relative;text-align:center;margin-bottom:28px}
  h1{font-size:36px;font-weight:800;color:#fff;letter-spacing:-0.025em}
  h1 .hl{color:${ACCENT}}
  p{font-size:18px;color:#ffffffb0;margin-top:10px;font-weight:400}
  .row{position:relative;display:flex;gap:38px;align-items:flex-start;justify-content:center}
  .col{width:520px}
  .tag{display:inline-block;font-size:15px;font-weight:600;letter-spacing:.02em;
    padding:6px 14px;border-radius:999px;margin-bottom:14px}
  .tag.b{background:#ffffff1a;color:#ffffffcc}
  .tag.a{background:${ACCENT};color:#fff}
  .frame{height:560px;border-radius:12px;overflow:hidden;background:#fff;
    box-shadow:0 26px 60px -20px #000a}
  .frame img{width:100%;display:block}
  .arrow{align-self:center;margin-top:220px;font-size:34px;color:${ACCENT};font-weight:800}
</style></head><body>
  <div class="head">
    <h1>One click. The article, <span class="hl">nothing else.</span></h1>
    <p>Ads, menus, sidebars and comment walls removed, ready to print or save as a PDF.</p>
  </div>
  <div class="row">
    <div class="col"><span class="tag b">The page as it loads</span>
      <div class="frame"><img src="${before}"></div></div>
    <div class="arrow">&rsaquo;</div>
    <div class="col"><span class="tag a">After PrintxPDF</span>
      <div class="frame"><img src="${after}"></div></div>
  </div>
</body></html>`

const p = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 })
await p.setContent(composite, { waitUntil: 'load' })
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(500)
await p.screenshot({ path: path.join(OUT, 'screenshot-1-before-after.png') })
console.log('screenshot-1-before-after.png  1280x800')
await p.close()
await browser.close()
