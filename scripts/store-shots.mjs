// Chrome Web Store listing screenshots (1280x800) from the built site: node scripts/store-shots.mjs
import { chromium } from 'playwright'
const BASE = process.env.AUDIT_BASE || 'http://localhost:4175'
const shots = [
  ['extension/store-assets/screenshot-1-cleaner.png', `${BASE}/print?url=${encodeURIComponent('https://en.wikipedia.org/wiki/Portable_Document_Format')}`, '.pxp-page, .ed-paper, main canvas, main article', 25000],
  ['extension/store-assets/screenshot-2-tools.png', `${BASE}/tools`, 'main h1', 10000],
  ['extension/store-assets/screenshot-3-extension-page.png', `${BASE}/extensions/chrome`, 'main h1', 10000],
]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' })
for (const [file, url, waitFor, timeout] of shots) {
  await page.goto(url, { waitUntil: 'load' })
  try { await page.locator(waitFor).first().waitFor({ timeout }) } catch { console.log('wait timed out for', url) }
  await page.waitForTimeout(1500)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: file })
  console.log('saved', file)
}
await browser.close()
