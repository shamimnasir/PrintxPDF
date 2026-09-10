// End-to-end audit of every tool page: loads the built site in headless Chromium, feeds each
// tool a real fixture, runs it, checks that a result or a download appears, and saves a
// screenshot of the workbench that the tool page's "How to" section shows.
//
//   node scripts/audit-tools.mjs               (site at http://localhost:4175, e.g. `npx serve dist -l 4175`)
//   AUDIT_ONLY=merge-pdf,sign-pdf node scripts/audit-tools.mjs
//   AUDIT_SERVER=1 node scripts/audit-tools.mjs  (also runs the five server conversions; each costs free quota)
import { chromium } from 'playwright'
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const BASE = process.env.AUDIT_BASE || 'http://localhost:4175'
const FIX = path.join(ROOT, 'audit/fixtures')
const OUT = path.join(ROOT, 'audit/out')
const SHOTS = path.join(ROOT, 'public/screens/tools')
const ONLY = process.env.AUDIT_ONLY ? new Set(process.env.AUDIT_ONLY.split(',')) : null
const SERVER = process.env.AUDIT_SERVER === '1'
const fx = (...names) => names.map((n) => path.join(FIX, n))

// Server conversions that get exercised for real (free tier: 5 a month per address). The
// other three load a file and are screenshotted ready to run; their engines are covered by
// worker/container/test_server.py.
const SERVER_RUN = new Set(SERVER ? ['ppt-to-pdf', 'epub-to-pdf', 'protect-pdf', 'unlock-pdf', 'pdf-to-pdfa'] : [])

const RUN = 'main button.btn-acid.btn-lg'
const clickRun = (page, label) => page.locator(label ? `main button:has-text("${label}")` : RUN).first().click()

/** @type {Record<string, { files?: string[]; input?: number; steps?: (page) => Promise<void>; run?: string | null; success?: 'download' | 'results' | 'ocr' | 'reader' | 'none'; timeout?: number; uiOnly?: boolean }>} */
const TOOLS = {
  'merge-pdf': { files: fx('a.pdf', 'b.pdf'), success: 'results' },
  'split-pdf': { files: fx('a.pdf'), success: 'results' },
  'organize-pdf': {
    files: fx('a.pdf'),
    steps: async (page) => {
      await page.getByRole('button', { name: 'Rotate page 2 right' }).click()
      await page.getByRole('button', { name: 'Move page 3 left' }).click()
    },
    run: 'Apply & download',
    success: 'download',
  },
  'rotate-pdf': { files: fx('a.pdf'), success: 'results' },
  'delete-pages': { files: fx('a.pdf'), steps: (page) => page.locator('#pages').fill('2'), success: 'results' },
  'extract-pages': { files: fx('a.pdf'), steps: (page) => page.locator('#pages').fill('1, 3'), success: 'results' },
  'compress-pdf': { files: fx('a.pdf'), success: 'results' },
  'repair-pdf': { files: fx('a.pdf'), success: 'results' },
  'ocr-pdf': { files: fx('a.pdf'), success: 'ocr', timeout: 240000 },
  'pdf-reader': { files: fx('a.pdf'), run: null, success: 'reader' },
  'pdf-to-jpg': { files: fx('a.pdf'), success: 'results' },
  'jpg-to-pdf': { files: fx('photo.jpg', 'photo.png'), success: 'results' },
  'word-to-pdf': { files: fx('brief.docx'), success: 'results' },
  'excel-to-pdf': { files: fx('sheet.xlsx'), success: 'results' },
  'html-to-pdf': { files: fx('page.html'), success: 'results' },
  'pdf-to-text': { files: fx('a.pdf'), success: 'results' },
  'pdf-to-word': { files: fx('a.pdf'), success: 'results' },
  'pdf-to-excel': { files: fx('a.pdf'), success: 'results' },
  'pdf-to-ppt': { files: fx('a.pdf'), success: 'results', uiOnly: !SERVER_RUN.has('pdf-to-ppt') },
  'ppt-to-pdf': { files: fx('deck.pptx'), success: 'results', timeout: 180000, uiOnly: !SERVER_RUN.has('ppt-to-pdf') },
  'epub-to-pdf': { files: fx('book.epub'), success: 'results', timeout: 180000, uiOnly: !SERVER_RUN.has('epub-to-pdf') },
  'mobi-to-pdf': { files: [], success: 'none', uiOnly: true },
  'sign-pdf': {
    files: fx('a.pdf'),
    steps: async (page) => {
      await page.locator('main canvas').first().waitFor()
      await page.getByRole('button', { name: 'Type' }).click()
      await page.getByPlaceholder('Your name').fill('Nasir Uddin Shamim')
      await page.getByRole('button', { name: "Insert today's date" }).click()
    },
    success: 'download',
  },
  'add-watermark': { files: fx('a.pdf'), success: 'results' },
  'page-numbers': { files: fx('a.pdf'), success: 'results' },
  'edit-metadata': { files: fx('a.pdf'), steps: (page) => page.locator('#title').fill('Quarterly report 2026'), success: 'results' },
  'flatten-pdf': { files: fx('form.pdf'), success: 'results' },
  'remove-metadata': { files: fx('a.pdf'), success: 'results' },
  'qr-code': { steps: (page) => page.getByPlaceholder('https://example.com').fill('https://printxpdf.com'), run: 'Download PNG', success: 'download' },
  'edit-pdf': {
    files: fx('a.pdf'),
    steps: async (page) => {
      const stage = page.locator('main .edit-stage canvas').first()
      // the stage ignores clicks until the page has rendered
      await page.waitForFunction(() => (document.querySelector('main .edit-stage canvas')?.width || 0) > 50, null, { timeout: 30000 })
      // text mode is the default: one click drops a text item on the page (locator.click scrolls the stage into view)
      await page.getByRole('button', { name: 'Add text' }).click()
      const box = await stage.boundingBox()
      await stage.click({ position: { x: box.width * 0.5, y: box.height * 0.3 } })
      await page.locator('main button.btn-acid.btn-lg:not([disabled])').waitFor({ timeout: 10000 })
    },
    success: 'download',
  },
  'crop-pdf': { files: fx('a.pdf'), success: 'results' },
  'pdf-forms': {
    files: fx('form.pdf'),
    steps: async (page) => {
      await page.locator('main .input:not([type=file])').first().waitFor()
      await page.locator('main .input:not([type=file])').first().fill('Nasir Uddin Shamim')
      await page.locator('main input[type=checkbox]').first().check()
    },
    success: 'download',
  },
  'redact-pdf': { files: fx('a.pdf'), steps: (page) => page.getByRole('button', { name: 'Redact whole page' }).click(), success: 'download' },
  'compare-pdf': { files: fx('a.pdf', 'b.pdf'), steps: (page) => page.locator('main canvas').first().waitFor(), success: 'download', timeout: 120000 },
  'scan-to-pdf': { files: fx('photo.jpg'), success: 'download' },
  'pdf-to-markdown': { files: fx('a.pdf'), success: 'results' },
  'protect-pdf': {
    files: fx('a.pdf'),
    steps: async (page) => {
      await page.locator('#password').fill('audit-1234')
      await page.locator('#confirm').fill('audit-1234')
    },
    success: 'results',
    timeout: 180000,
    uiOnly: !SERVER_RUN.has('protect-pdf'),
  },
  'unlock-pdf': {
    // uses the file protect-pdf produced (see the run order below)
    files: [path.join(OUT, 'protect-pdf', 'a-protected.pdf')],
    steps: (page) => page.locator('#password').fill('audit-1234'),
    success: 'results',
    timeout: 180000,
    uiOnly: !SERVER_RUN.has('unlock-pdf'),
  },
  'pdf-to-pdfa': { files: fx('a.pdf'), success: 'results', timeout: 180000, uiOnly: !SERVER_RUN.has('pdf-to-pdfa') },
  'image-converter': { files: fx('photo.png'), success: 'results' },
  'compress-image': { files: fx('photo.jpg'), success: 'results' },
  'create-zip': { files: fx('a.pdf', 'notes.txt', 'photo.png'), success: 'download' },
  'extract-zip': { files: fx('bundle.zip'), steps: (page) => page.getByRole('button', { name: 'Download' }).first().waitFor(), run: 'Download all', success: 'download' },
  'ebook-converter': { files: fx('book.epub'), success: 'results', uiOnly: true },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function auditTool(context, slug, t) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon|net::ERR|404/.test(m.text())) errors.push(`console: ${m.text().slice(0, 200)}`)
  })
  const t0 = Date.now()
  const result = { slug, ok: false, mode: t.uiOnly ? 'ui-only' : 'run', ms: 0, note: '', errors, outputs: [] }
  try {
    await page.goto(`${BASE}/tools/${slug}`, { waitUntil: 'load' })
    await page.locator('main h1').waitFor()
    // the workbench mounts after hydration
    await page.locator('main .dropzone, main input[type=file], main .tabs').first().waitFor({ timeout: 30000 })
    if (t.files?.length) {
      const input = page.locator('main input[type=file]').nth(t.input || 0)
      await input.setInputFiles(t.files)
      await sleep(600)
    }
    if (t.steps) await t.steps(page)
    await sleep(300)
    if (t.uiOnly) {
      result.ok = true
      result.note = 'loaded and ready; engine not run (server quota) or no fixture'
    } else if (t.run !== null) {
      const timeout = t.timeout || 90000
      const downloadDir = path.join(OUT, slug)
      await mkdir(downloadDir, { recursive: true })
      const downloads = []
      page.on('download', (d) => downloads.push(d))
      const waitDownload = page.waitForEvent('download', { timeout }).then(() => 'download')
      const waitResults = page.locator('main .result-row').first().waitFor({ timeout }).then(() => 'results')
      const waitOcr = t.success === 'ocr' ? page.waitForFunction(() => (document.querySelector('main textarea')?.value || '').length > 20, null, { timeout }).then(() => 'ocr') : new Promise(() => {})
      const waitError = page.locator('main .card-alarm, main [role=alert]').first().waitFor({ timeout }).then(() => 'error')
      await clickRun(page, t.run)
      const what = await Promise.race([waitDownload, waitResults, waitOcr, waitError])
      if (what === 'error') throw new Error(`tool showed an error: ${(await page.locator('main .card-alarm, main [role=alert]').first().innerText()).slice(0, 200)}`)
      // give a results list a moment, then pull every produced file so it can be checked
      await sleep(800)
      if (what === 'results') {
        const rows = page.locator('main .result-row button:has-text("Download")')
        const n = await rows.count()
        for (let i = 0; i < n; i++) {
          // the download listener above collects it
          await Promise.all([page.waitForEvent('download', { timeout: 20000 }), rows.nth(i).click()])
        }
      }
      for (const d of downloads) {
        const name = d.suggestedFilename()
        const dest = path.join(downloadDir, name)
        await d.saveAs(dest)
        const size = (await stat(dest)).size
        const head = (await readFile(dest)).subarray(0, 5).toString('latin1')
        result.outputs.push({ name, size, pdf: head.startsWith('%PDF') })
        if (size === 0) throw new Error(`${name} is empty`)
        if (/\.pdf$/i.test(name) && !head.startsWith('%PDF')) throw new Error(`${name} is not a PDF`)
      }
      result.ok = true
      result.note = what
    } else {
      if (t.success === 'reader') await page.locator('main .reader').waitFor({ timeout: 60000 })
      result.ok = true
      result.note = 'viewer opened'
    }
    // screenshot of the workbench: from the tool heading down to the editorial sections
    await page.evaluate(() => window.scrollTo(0, 0))
    await sleep(400)
    // the workbench sits between the heading block and the editorial sections
    const bench = await page.locator('main .tool-head + *').boundingBox()
    const content = await page.locator('main .tool-content, main .section-tight').first().boundingBox()
    const top = Math.max(0, bench.y - 12)
    const height = Math.min(960, Math.max(400, (content ? content.y : bench.y + 900) - top - 12))
    await mkdir(SHOTS, { recursive: true })
    await page.screenshot({ path: path.join(SHOTS, `${slug}.jpg`), type: 'jpeg', quality: 80, fullPage: true, clip: { x: 0, y: top, width: 1280, height } })
    result.shot = { w: 1280, h: Math.round(height) }
  } catch (e) {
    result.ok = false
    result.note = (e.message || String(e)).split('\n')[0].slice(0, 300)
    try {
      await mkdir(path.join(OUT, '_failures'), { recursive: true })
      await page.screenshot({ path: path.join(OUT, '_failures', `${slug}.png`), fullPage: true })
    } catch {
      /* page gone */
    }
  }
  result.ms = Date.now() - t0
  await page.close()
  return result
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, colorScheme: 'light', deviceScaleFactor: 1 })
  // protect before unlock: unlock's fixture is protect's output
  const order = Object.keys(TOOLS).filter((s) => !ONLY || ONLY.has(s))
  const results = []
  for (const slug of order) {
    const r = await auditTool(context, slug, TOOLS[slug])
    results.push(r)
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${slug.padEnd(18)} ${String(r.ms).padStart(6)}ms  ${r.mode.padEnd(7)} ${r.note}${r.outputs.length ? '  [' + r.outputs.map((o) => `${o.name} ${o.size}B`).join(', ') + ']' : ''}${r.errors.length ? '  errors: ' + r.errors.join(' | ') : ''}`)
  }
  await browser.close()
  await writeFile(path.join(OUT, 'report.json'), JSON.stringify(results, null, 2))
  // manifest for src/components/ui/ToolShot.tsx (kept for tools that were not part of this run)
  const manifestPath = path.join(ROOT, 'src/content/tools/screens.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8').catch(() => '{}'))
  for (const r of results) if (r.shot) manifest[r.slug] = r.shot
  await writeFile(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n')
  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? ', failed: ' + failed.map((f) => f.slug).join(', ') : ''}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
