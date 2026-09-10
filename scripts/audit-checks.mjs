// Output checks for scripts/audit-tools.mjs: each tool's downloaded files are opened and
// compared with what the tool page promises (page counts, rotation, text, metadata, sizes).
import { readFile, stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { PDFDocument } = require('pdf-lib')
const exec = promisify(execFile)

const must = (cond, msg) => {
  if (!cond) throw new Error(msg)
}
const pick = (outs, re) => {
  const o = outs.find((x) => re.test(x.name))
  must(o, `no output matching ${re}`)
  return o
}

async function pdf(file) {
  return PDFDocument.load(await readFile(file), { updateMetadata: false })
}
async function isEncrypted(file) {
  const bytes = await readFile(file)
  try {
    await PDFDocument.load(bytes)
    return false
  } catch (e) {
    return /encrypted/i.test(String(e.message))
  }
}
/** Text of every page (pdf.js), pages joined with form feeds. */
async function pageTexts(file) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await readFile(file)), useSystemFonts: true, disableFontFace: true }).promise
  const out = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const tc = await page.getTextContent()
    out.push(tc.items.map((it) => it.str).join(' '))
  }
  return out
}
async function imageDims(file) {
  const { stdout } = await exec('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file])
  return { w: +/pixelWidth: (\d+)/.exec(stdout)[1], h: +/pixelHeight: (\d+)/.exec(stdout)[1] }
}
async function zipList(file) {
  const { stdout } = await exec('unzip', ['-Z1', file])
  return stdout.trim().split('\n').filter(Boolean)
}
async function zipRead(file, entry) {
  const { stdout } = await exec('unzip', ['-p', file, entry], { maxBuffer: 50 * 1024 * 1024 })
  return stdout
}
const size = async (file) => (await stat(file)).size
const hasImage = (page) => {
  const { PDFName } = require('pdf-lib')
  const xo = page.node.Resources()?.lookup?.(PDFName.of('XObject'))
  if (!xo) return false
  return xo.entries().some(([, ref]) => {
    const obj = page.doc.context.lookup(ref)
    const dict = obj?.dict ?? obj // streams keep their dictionary in .dict
    return String(dict?.get?.(PDFName.of('Subtype'))) === '/Image'
  })
}

const A_TEXT = 'Quarterly report'

/** @type {Record<string, (outs: {name: string, file: string}[], ctx: {fixtures: string}) => Promise<string>>} returns a short evidence string */
export const CHECKS = {
  'merge-pdf': async (outs) => {
    const o = pick(outs, /merged\.pdf$/)
    const d = await pdf(o.file)
    must(d.getPageCount() === 5, `expected 5 pages, got ${d.getPageCount()}`)
    const t = await pageTexts(o.file)
    must(/Fixture A/.test(t[0]) && /Fixture B/.test(t[3]), 'pages are not in the chosen order')
    return '5 pages, A then B'
  },
  'split-pdf': async (outs) => {
    const a = await pdf(pick(outs, /p1-2\.pdf$/).file)
    const b = await pdf(pick(outs, /p3\.pdf$/).file)
    must(a.getPageCount() === 2 && b.getPageCount() === 1, `ranges 1-2 / 3- gave ${a.getPageCount()} and ${b.getPageCount()} pages`)
    return '2 + 1 pages'
  },
  'organize-pdf': async (outs) => {
    const o = pick(outs, /organized\.pdf$/)
    const d = await pdf(o.file)
    const t = await pageTexts(o.file)
    must(d.getPageCount() === 3, 'page count changed')
    must(/Page 3 of 3/.test(t[1]), 'page 3 was not moved to second place')
    must(d.getPage(2).getRotation().angle === 90, 'page 2 was not rotated 90°')
    return 'order 1,3,2 and page 2 rotated'
  },
  'rotate-pdf': async (outs) => {
    const d = await pdf(pick(outs, /rotated\.pdf$/).file)
    must(d.getPages().every((p) => p.getRotation().angle === 90), 'not every page is rotated 90°')
    return 'all pages 90°'
  },
  'delete-pages': async (outs) => {
    const o = pick(outs, /trimmed\.pdf$/)
    const t = await pageTexts(o.file)
    must(t.length === 2 && /Page 1 of/.test(t[0]) && /Page 3 of/.test(t[1]), 'page 2 was not the one removed')
    return 'page 2 removed'
  },
  'extract-pages': async (outs) => {
    const o = pick(outs, /extract\.pdf$/)
    const t = await pageTexts(o.file)
    must(t.length === 2 && /Page 1 of/.test(t[0]) && /Page 3 of/.test(t[1]), 'pages 1 and 3 were not kept')
    return 'pages 1 and 3 kept'
  },
  'compress-pdf': async (outs, { fixtures }) => {
    const o = pick(outs, /compressed\.pdf$/)
    const before = await size(path.join(fixtures, 'big.pdf'))
    const after = await size(o.file)
    const d = await pdf(o.file)
    must(d.getPageCount() === 4, 'page count changed')
    must(after < before, `medium did not shrink the file: ${before} -> ${after} bytes`)
    return `${before} -> ${after} bytes`
  },
  'repair-pdf': async (outs) => {
    const d = await pdf(pick(outs, /repaired\.pdf$/).file)
    must(d.getPageCount() === 3, 'page count changed')
    return 'opens, 3 pages'
  },
  'ocr-pdf': async (outs) => {
    const txt = await readFile(pick(outs, /\.txt$/).file, 'utf8')
    must(/Quarterly/i.test(txt) && /brown fox/i.test(txt), 'recognised text does not contain the page text')
    const s = pick(outs, /\.pdf$/)
    const t = await pageTexts(s.file)
    must(/Quarterly/i.test(t[0]), 'searchable PDF has no text layer on page 1')
    return 'text recognised, searchable PDF has a text layer'
  },
  'pdf-to-jpg': async (outs) => {
    const jpgs = outs.filter((o) => /\.jpg$/.test(o.name))
    must(jpgs.length === 3, `expected 3 images, got ${jpgs.length}`)
    const { w, h } = await imageDims(jpgs[0].file)
    must(w > 1100 && w < 1300 && h > w, `unexpected size ${w}x${h} for 144 dpi`)
    return `3 images, ${w}x${h}`
  },
  'jpg-to-pdf': async (outs) => {
    const d = await pdf(pick(outs, /\.pdf$/).file)
    must(d.getPageCount() === 2, `expected 2 pages, got ${d.getPageCount()}`)
    must(hasImage(d.getPage(0)) && hasImage(d.getPage(1)), 'a page has no image')
    return '2 pages with images'
  },
  'word-to-pdf': async (outs) => {
    const o = pick(outs, /\.pdf$/)
    const d = await pdf(o.file)
    must(d.getPageCount() >= 1 && (await size(o.file)) > 10000, 'output looks empty')
    return `${d.getPageCount()} page(s)`
  },
  'excel-to-pdf': async (outs) => {
    const d = await pdf(pick(outs, /\.pdf$/).file)
    must(d.getPageCount() >= 1, 'no pages')
    return `${d.getPageCount()} page(s)`
  },
  'html-to-pdf': async (outs) => {
    const d = await pdf(pick(outs, /\.pdf$/).file)
    must(d.getPageCount() >= 1, 'no pages')
    return `${d.getPageCount()} page(s)`
  },
  'pdf-to-text': async (outs) => {
    const txt = await readFile(pick(outs, /\.txt$/).file, 'utf8')
    must(txt.includes(A_TEXT) && /Page 3 of 3/.test(txt), 'text is incomplete')
    return `${txt.length} chars, all pages`
  },
  'pdf-to-word': async (outs) => {
    const o = pick(outs, /\.docx$/)
    const xml = await zipRead(o.file, 'word/document.xml')
    must(xml.includes(A_TEXT), 'document text missing from the .docx')
    return 'docx carries the text'
  },
  'pdf-to-excel': async (outs) => {
    const o = pick(outs, /\.xlsx$/)
    const XLSX = require('xlsx')
    const wb = XLSX.readFile(o.file)
    must(wb.SheetNames.length === 3, `expected 3 sheets (one per page), got ${wb.SheetNames.length}`)
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]])
    must(csv.includes('Quarterly'), 'sheet 1 has no page text')
    return '3 sheets with text'
  },
  'sign-pdf': async (outs, { fixtures }) => {
    const o = pick(outs, /signed\.pdf$/)
    const d = await pdf(o.file)
    must(d.getPageCount() === 3, 'page count changed')
    must(hasImage(d.getPage(0)), 'page 1 has no stamped image')
    must((await size(o.file)) > (await size(path.join(fixtures, 'a.pdf'))), 'file did not grow')
    return 'date stamp drawn on page 1'
  },
  'add-watermark': async (outs) => {
    const t = await pageTexts(pick(outs, /watermarked\.pdf$/).file)
    must(t.every((p) => /CONFIDENTIAL/.test(p)), 'watermark missing on a page')
    return 'CONFIDENTIAL on all 3 pages'
  },
  'page-numbers': async (outs) => {
    const t = await pageTexts(pick(outs, /numbered\.pdf$/).file)
    must(/\b101\b/.test(t[0]) && /\b102\b/.test(t[1]) && /\b103\b/.test(t[2]), 'numbers 101..103 not found on the pages')
    return 'numbered 101, 102, 103'
  },
  'edit-metadata': async (outs) => {
    const d = await pdf(pick(outs, /meta\.pdf$/).file)
    must(d.getTitle() === 'Quarterly report 2026', `title is ${JSON.stringify(d.getTitle())}`)
    return 'title updated'
  },
  'flatten-pdf': async (outs) => {
    const d = await pdf(pick(outs, /flat\.pdf$/).file)
    let fields = 0
    try {
      fields = d.getForm().getFields().length
    } catch {
      fields = 0
    }
    must(fields === 0, `${fields} form field(s) still live`)
    return 'no live fields left'
  },
  'remove-metadata': async (outs) => {
    const d = await pdf(pick(outs, /clean\.pdf$/).file)
    must(!d.getAuthor() && !d.getSubject() && !d.getTitle(), `details remain: ${d.getTitle()} / ${d.getAuthor()}`)
    return 'title, author, subject cleared'
  },
  'qr-code': async (outs) => {
    const o = pick(outs, /\.png$/)
    const { w, h } = await imageDims(o.file)
    must(w === h && w >= 128, `odd size ${w}x${h}`)
    const { stdout } = await exec('zbarimg', ['-q', '--raw', o.file]).catch(() => ({ stdout: '' }))
    return stdout.trim() ? `decodes to ${stdout.trim()}` : `${w}x${w} PNG (no decoder installed)`
  },
  'edit-pdf': async (outs) => {
    const t = await pageTexts(pick(outs, /edited\.pdf$/).file)
    must(/New text/.test(t[0]), 'added text not found on page 1')
    return 'text item written into page 1'
  },
  'crop-pdf': async (outs) => {
    const d = await pdf(pick(outs, /cropped\.pdf$/).file)
    const p = d.getPage(0)
    const mb = p.getMediaBox()
    const cb = p.getCropBox()
    must(cb.height < mb.height - 20 || cb.width < mb.width - 20, `crop box ${JSON.stringify(cb)} is not smaller than the page`)
    return `crop ${Math.round(cb.width)}x${Math.round(cb.height)} of ${Math.round(mb.width)}x${Math.round(mb.height)}`
  },
  'pdf-forms': async (outs) => {
    const d = await pdf(pick(outs, /filled\.pdf$/).file)
    const f = d.getForm()
    must(f.getTextField('name').getText() === 'Nasir Uddin Shamim', 'text field value not saved')
    must(f.getCheckBox('agree').isChecked(), 'checkbox not saved')
    return 'field values saved'
  },
  'redact-pdf': async (outs) => {
    const t = await pageTexts(pick(outs, /redacted\.pdf$/).file)
    must(t[0].trim() === '', 'page 1 still contains extractable text')
    must(/Quarterly/.test(t[1]), 'untouched page 2 lost its text')
    return 'page 1 has no text, other pages intact'
  },
  'compare-pdf': async (outs) => {
    const d = await pdf(pick(outs, /diff\.pdf$/).file)
    must(d.getPageCount() === 3, `expected 3 diff pages, got ${d.getPageCount()}`)
    return '3 diff pages'
  },
  'scan-to-pdf': async (outs) => {
    const d = await pdf(pick(outs, /scan\.pdf$/).file)
    must(d.getPageCount() === 1 && hasImage(d.getPage(0)), 'no image page')
    return '1 scanned page'
  },
  'pdf-to-markdown': async (outs) => {
    const md = await readFile(pick(outs, /\.md$/).file, 'utf8')
    must(/^#+ .*Fixture A/m.test(md), 'title not written as a heading')
    must(md.includes(A_TEXT), 'body text missing')
    return 'heading and body present'
  },
  'protect-pdf': async (outs) => {
    must(await isEncrypted(pick(outs, /protected\.pdf$/).file), 'output is not encrypted')
    return 'encrypted'
  },
  'unlock-pdf': async (outs) => {
    const o = pick(outs, /unlocked\.pdf$/)
    must(!(await isEncrypted(o.file)), 'output is still encrypted')
    return 'opens without a password'
  },
  'pdf-to-pdfa': async (outs) => {
    const bytes = await readFile(pick(outs, /pdfa\.pdf$/).file)
    must(bytes.includes('/OutputIntent') && bytes.includes('pdfaid'), 'no PDF/A markers')
    return 'OutputIntent and PDF/A id present'
  },
  'ppt-to-pdf': async (outs) => {
    const d = await pdf(pick(outs, /\.pdf$/).file)
    must(d.getPageCount() >= 1, 'no pages')
    return `${d.getPageCount()} page(s)`
  },
  'epub-to-pdf': async (outs) => {
    const t = await pageTexts(pick(outs, /\.pdf$/).file)
    must(t.some((p) => /Chapter 1/.test(p)), 'chapter text missing')
    return `${t.length} page(s) with the chapter text`
  },
  'image-converter': async (outs) => {
    const o = pick(outs, /\.jpg$/)
    const { w, h } = await imageDims(o.file)
    must(w === 512 && h === 512, `size changed to ${w}x${h}`)
    return 'PNG -> JPG, 512x512'
  },
  'compress-image': async (outs, { fixtures }) => {
    const o = pick(outs, /\.jpg$/)
    const before = await size(path.join(fixtures, 'photo.jpg'))
    const after = await size(o.file)
    must(after < before, `not smaller: ${before} -> ${after}`)
    return `${before} -> ${after} bytes`
  },
  'create-zip': async (outs) => {
    const names = await zipList(pick(outs, /\.zip$/).file)
    must(names.length === 3 && names.some((n) => /a\.pdf$/.test(n)) && names.some((n) => /notes\.txt$/.test(n)), `entries: ${names.join(', ')}`)
    return '3 entries'
  },
  'extract-zip': async (outs) => {
    const names = await zipList(pick(outs, /\.zip$/).file)
    must(names.length === 3, `re-packed archive has ${names.length} entries`)
    return '3 files extracted'
  },
}
