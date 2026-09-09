// Every operation here runs in the browser and uploads nothing. The four server-backed
// conversions (PowerPoint and ebook formats) live in src/lib/api.ts instead.
import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib'
import { loadPdf, renderPageToCanvas, canvasToBlob, extractText } from '../../lib/pdfjs'
import { readAsDataURL, stripExt } from '../../lib/download'

const readAsArrayBuffer = (f: File) => f.arrayBuffer()

export type { Output } from '../../components/ui/ResultList'
import type { Output } from '../../components/ui/ResultList'
export type Progress = (fraction: number, msg?: string) => void

const pdfBlob = (bytes: Uint8Array) => new Blob([bytes as BlobPart], { type: 'application/pdf' })

/** "1-3, 5, 8-" → zero-based page indexes (clamped, deduped, ordered as written) */
export function parseRanges(spec: string, total: number): number[] {
  const out: number[] = []
  for (const part of spec.split(/[,\s]+/).filter(Boolean)) {
    const m = part.match(/^(\d*)-(\d*)$/)
    if (m) {
      const a = m[1] ? Math.max(1, +m[1]) : 1
      const b = m[2] ? Math.min(total, +m[2]) : total
      for (let i = a; i <= b; i++) out.push(i - 1)
    } else if (/^\d+$/.test(part)) {
      const n = +part
      if (n >= 1 && n <= total) out.push(n - 1)
    }
  }
  return [...new Set(out)]
}

async function open(file: File) {
  return PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true, updateMetadata: false })
}

// ---------- organize ----------
export async function merge(files: File[], onProgress?: Progress): Promise<Output[]> {
  const out = await PDFDocument.create()
  for (let i = 0; i < files.length; i++) {
    const src = await open(files[i])
    const pages = await out.copyPages(src, src.getPageIndices())
    pages.forEach((p) => out.addPage(p))
    onProgress?.((i + 1) / files.length, `Merged ${files[i].name}`)
  }
  out.setProducer('PrintxPDF')
  return [{ name: 'merged.pdf', blob: pdfBlob(await out.save()) }]
}

export async function split(file: File, opts: { mode: 'ranges' | 'every' | 'single'; ranges?: string; every?: number }, onProgress?: Progress): Promise<Output[]> {
  const src = await open(file)
  const total = src.getPageCount()
  const groups: number[][] = []
  if (opts.mode === 'single') for (let i = 0; i < total; i++) groups.push([i])
  else if (opts.mode === 'every') {
    const n = Math.max(1, opts.every || 1)
    for (let i = 0; i < total; i += n) groups.push(Array.from({ length: Math.min(n, total - i) }, (_, k) => i + k))
  } else {
    for (const r of (opts.ranges || '').split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      const idx = parseRanges(r, total)
      if (idx.length) groups.push(idx)
    }
    if (!groups.length) throw new Error('Enter at least one page range, e.g. 1-3, 4-6')
  }
  const outs: Output[] = []
  for (let g = 0; g < groups.length; g++) {
    const doc = await PDFDocument.create()
    const pages = await doc.copyPages(src, groups[g])
    pages.forEach((p) => doc.addPage(p))
    const label = groups[g].length === 1 ? `p${groups[g][0] + 1}` : `p${groups[g][0] + 1}-${groups[g][groups[g].length - 1] + 1}`
    outs.push({ name: `${stripExt(file.name)}-${label}.pdf`, blob: pdfBlob(await doc.save()) })
    onProgress?.((g + 1) / groups.length)
  }
  return outs
}

export async function rotate(file: File, angle: 90 | 180 | 270, pagesSpec = ''): Promise<Output[]> {
  const doc = await open(file)
  const idx = pagesSpec.trim() ? parseRanges(pagesSpec, doc.getPageCount()) : doc.getPageIndices()
  idx.forEach((i) => {
    const p = doc.getPage(i)
    p.setRotation(degrees((p.getRotation().angle + angle) % 360))
  })
  return [{ name: `${stripExt(file.name)}-rotated.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function deletePages(file: File, spec: string): Promise<Output[]> {
  const doc = await open(file)
  const total = doc.getPageCount()
  const del = new Set(parseRanges(spec, total))
  if (!del.size) throw new Error('Enter the pages to delete, e.g. 2, 5-7')
  if (del.size >= total) throw new Error('You cannot delete every page')
  const out = await PDFDocument.create()
  const keep = doc.getPageIndices().filter((i) => !del.has(i))
  ;(await out.copyPages(doc, keep)).forEach((p) => out.addPage(p))
  return [{ name: `${stripExt(file.name)}-trimmed.pdf`, blob: pdfBlob(await out.save()), note: `Removed ${del.size} page(s), ${keep.length} left.` }]
}

export async function extractPages(file: File, spec: string): Promise<Output[]> {
  const doc = await open(file)
  const idx = parseRanges(spec, doc.getPageCount())
  if (!idx.length) throw new Error('Enter the pages to extract, e.g. 1, 3-4')
  const out = await PDFDocument.create()
  ;(await out.copyPages(doc, idx)).forEach((p) => out.addPage(p))
  return [{ name: `${stripExt(file.name)}-extract.pdf`, blob: pdfBlob(await out.save()) }]
}

/** Rebuild with an explicit page order + per-page rotation + deletions (from the Organize UI). */
export async function reorganize(file: File, pages: { index: number; rotation: number }[]): Promise<Output[]> {
  const doc = await open(file)
  const out = await PDFDocument.create()
  const copied = await out.copyPages(doc, pages.map((p) => p.index))
  copied.forEach((p, i) => {
    p.setRotation(degrees((p.getRotation().angle + pages[i].rotation) % 360))
    out.addPage(p)
  })
  return [{ name: `${stripExt(file.name)}-organized.pdf`, blob: pdfBlob(await out.save()) }]
}

// ---------- optimize ----------
export async function compress(file: File, opts: { level: 'light' | 'medium' | 'strong' }, onProgress?: Progress): Promise<Output[]> {
  const before = file.size
  if (opts.level === 'light') {
    // structural only: object streams + drop metadata. Lossless.
    const doc = await open(file)
    doc.setProducer('PrintxPDF')
    doc.setCreator('')
    doc.setKeywords([])
    const bytes = await doc.save({ useObjectStreams: true })
    return [{ name: `${stripExt(file.name)}-compressed.pdf`, blob: pdfBlob(bytes), note: sizeNote(before, bytes.length) }]
  }
  // lossy: rasterise each page and re-embed as JPEG. Text becomes an image.
  const scale = opts.level === 'medium' ? 1.4 : 1.0
  const quality = opts.level === 'medium' ? 0.72 : 0.55
  const pdf = await loadPdf(await readAsArrayBuffer(file))
  const out = await PDFDocument.create()
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPageToCanvas(pdf, i, scale)
    const jpg = await canvasToBlob(canvas, 'image/jpeg', quality)
    const img = await out.embedJpg(await jpg.arrayBuffer())
    const page = await pdf.getPage(i)
    const vp = page.getViewport({ scale: 1 })
    const p = out.addPage([vp.width, vp.height])
    p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height })
    onProgress?.(i / pdf.numPages, `Page ${i}/${pdf.numPages}`)
  }
  const bytes = await out.save({ useObjectStreams: true })
  return [{ name: `${stripExt(file.name)}-compressed.pdf`, blob: pdfBlob(bytes), note: sizeNote(before, bytes.length) + ' Text is now an image; use Light for a lossless pass.' }]
}
const sizeNote = (a: number, b: number) => `${(a / 1024).toFixed(0)} KB → ${(b / 1024).toFixed(0)} KB (${b < a ? '-' : '+'}${Math.abs(100 - (b / a) * 100).toFixed(0)}%).`

export async function repair(file: File): Promise<Output[]> {
  try {
    const doc = await PDFDocument.load(await readAsArrayBuffer(file), { ignoreEncryption: true, throwOnInvalidObject: false })
    const bytes = await doc.save({ useObjectStreams: false })
    return [{ name: `${stripExt(file.name)}-repaired.pdf`, blob: pdfBlob(bytes), note: `Rebuilt ${doc.getPageCount()} page(s) with a fresh cross-reference table.` }]
  } catch (e) {
    throw new Error(`Could not parse this file well enough to rebuild it: ${(e as Error).message}`)
  }
}

// ---------- convert ----------
export async function pdfToImages(file: File, opts: { format: 'jpg' | 'png'; scale: number; pages?: string }, onProgress?: Progress): Promise<Output[]> {
  const pdf = await loadPdf(await readAsArrayBuffer(file))
  const idx = opts.pages?.trim() ? parseRanges(opts.pages, pdf.numPages) : Array.from({ length: pdf.numPages }, (_, i) => i)
  const outs: Output[] = []
  for (let k = 0; k < idx.length; k++) {
    const canvas = await renderPageToCanvas(pdf, idx[k] + 1, opts.scale)
    const blob = await canvasToBlob(canvas, opts.format === 'png' ? 'image/png' : 'image/jpeg', 0.9)
    outs.push({ name: `${stripExt(file.name)}-page-${idx[k] + 1}.${opts.format}`, blob })
    onProgress?.((k + 1) / idx.length)
  }
  return outs
}

export async function imagesToPdf(files: File[], opts: { fit: 'fit' | 'fill' | 'original'; pageSize: 'A4' | 'Letter' | 'auto'; margin: number }, onProgress?: Progress): Promise<Output[]> {
  const doc = await PDFDocument.create()
  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    let bytes = await readAsArrayBuffer(f)
    let isPng = /png$/i.test(f.type) || /\.png$/i.test(f.name)
    if (/webp|gif|bmp/i.test(f.type) || /\.(webp|gif|bmp)$/i.test(f.name)) {
      // re-encode unsupported formats through a canvas
      bytes = await transcodeToPng(f)
      isPng = true
    }
    const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
    const m = opts.margin
    let pw: number, ph: number
    if (opts.pageSize === 'auto') {
      pw = img.width + m * 2
      ph = img.height + m * 2
    } else {
      ;[pw, ph] = opts.pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter
      if (img.width > img.height) [pw, ph] = [ph, pw]
    }
    const page = doc.addPage([pw, ph])
    const boxW = pw - m * 2
    const boxH = ph - m * 2
    let w = img.width
    let h = img.height
    if (opts.fit !== 'original' || w > boxW || h > boxH) {
      const r = opts.fit === 'fill' ? Math.max(boxW / w, boxH / h) : Math.min(boxW / w, boxH / h)
      w *= r
      h *= r
    }
    page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
    onProgress?.((i + 1) / files.length)
  }
  return [{ name: 'images.pdf', blob: pdfBlob(await doc.save()) }]
}

/** Decode any browser-supported image file onto a canvas. */
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = await readAsDataURL(file)
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error(`Could not decode ${file.name}`))
    i.src = url
  })
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  c.getContext('2d')!.drawImage(img, 0, 0)
  return c
}

async function transcodeToPng(file: File): Promise<ArrayBuffer> {
  return (await canvasToBlob(await fileToCanvas(file), 'image/png')).arrayBuffer()
}

export async function pdfToText(file: File, onProgress?: Progress): Promise<Output[]> {
  const text = await extractText(await readAsArrayBuffer(file), (p) => onProgress?.(p))
  return [{ name: `${stripExt(file.name)}.txt`, blob: new Blob([text], { type: 'text/plain' }) }]
}

/** Render an HTML string to a PDF via a hidden iframe + html2canvas/jsPDF, reusing the web-clip exporter. */
export async function htmlToPdf(html: string, name: string, pageSize: 'A4' | 'Letter' = 'A4'): Promise<Output[]> {
  const { exportPdfToBlob } = await import('./htmlRender')
  const blob = await exportPdfToBlob(html, pageSize)
  return [{ name: `${stripExt(name)}.pdf`, blob }]
}

export async function wordToPdf(file: File, onProgress?: Progress): Promise<Output[]> {
  const mammoth = await import('mammoth')
  onProgress?.(0.2, 'Reading document…')
  const { value } = await mammoth.convertToHtml({ arrayBuffer: await readAsArrayBuffer(file) })
  onProgress?.(0.6, 'Laying out pages…')
  return htmlToPdf(`<h1 style="font-size:1.6em">${stripExt(file.name)}</h1>${value}`, file.name)
}

export async function excelToPdf(file: File, onProgress?: Progress): Promise<Output[]> {
  const XLSX = await import('xlsx')
  onProgress?.(0.2, 'Reading workbook…')
  const wb = XLSX.read(await readAsArrayBuffer(file), { type: 'array' })
  const html = wb.SheetNames.map((n) => `<h2>${n}</h2>${XLSX.utils.sheet_to_html(wb.Sheets[n])}`).join('<div class="pxp-pagebreak"></div>')
  onProgress?.(0.6, 'Laying out pages…')
  return htmlToPdf(html, file.name)
}

/** Text-only .docx: every extracted line becomes a paragraph. Honest about being layout-free. */
export async function pdfToWord(file: File, onProgress?: Progress): Promise<Output[]> {
  const text = await extractText(await readAsArrayBuffer(file), (p) => onProgress?.(p * 0.8))
  const { buildDocx } = await import('./docx')
  const blob = await buildDocx(text.split('\n'))
  onProgress?.(1)
  return [{ name: `${stripExt(file.name)}.docx`, blob, note: 'Text-only conversion. Layout, images and tables need a server-side converter.' }]
}

export async function pdfToExcel(file: File, onProgress?: Progress): Promise<Output[]> {
  const XLSX = await import('xlsx')
  const text = await extractText(await readAsArrayBuffer(file), (p) => onProgress?.(p * 0.8))
  const wb = XLSX.utils.book_new()
  const pages = text.split(/--- Page \d+ ---\n?/).filter((p) => p.trim())
  pages.forEach((p, i) => {
    const rows = p.split('\n').map((line) => line.split(/\s{2,}|\t/).map((c) => c.trim()))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), `Page ${i + 1}`)
  })
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  return [{ name: `${stripExt(file.name)}.xlsx`, blob: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), note: 'Lines split on wide gaps into cells. Real table detection needs a server.' }]
}


// ---------- PDF → Markdown ----------
/** One run of text as pdf.js hands it over, already flattened into the reading frame. */
export type MdItem = { str: string; x: number; y: number; width: number; height: number }
type MdLine = { text: string; height: number; y: number }

/** Bullet markers people actually use, plus the ASCII stand-ins. */
const MD_BULLET = /^(?:[•·▪◦‣∙*+]|[-–—])[ \t]+/
// letters only with a bracket: "a) step" is a list, "e.g. a thing" is a sentence
const MD_ORDERED = /^(?:\d{1,3}[.)]|[A-Za-z]\))[ \t]+/

/**
 * The text height most of the document is set in, weighted by how many characters use it, so a
 * cover page full of huge type cannot outvote the body. Everything else is measured against this.
 */
export function modalHeight(items: MdItem[]): number {
  const tally = new Map<number, number>()
  for (const it of items) {
    const chars = it.str.trim().length
    if (!chars || !(it.height > 0)) continue
    const bucket = Math.round(it.height * 2) / 2 // half-point buckets
    tally.set(bucket, (tally.get(bucket) || 0) + chars)
  }
  let best = 0
  let bestChars = 0
  for (const [h, chars] of tally) {
    if (chars > bestChars || (chars === bestChars && h < best)) {
      best = h
      bestChars = chars
    }
  }
  return best || 12
}

/** 0 = body text. Thresholds are ratios to the body height, not absolute sizes. */
export function headingLevel(height: number, body: number): 0 | 1 | 2 | 3 {
  if (!(body > 0) || !(height > 0)) return 0
  const r = height / body
  if (r >= 1.6) return 1
  if (r >= 1.35) return 2
  if (r >= 1.15) return 3
  return 0
}

/** Markdown-significant characters inside body text, so a PDF that says *not* stays *not*. */
export const escapeMd = (s: string) => s.replace(/([*_`|])/g, '\\$1').replace(/^#/, '\\#')

/** Soft wrap: a line ending in a hyphen was a broken word, anything else was a space. */
function softJoin(a: string, b: string): string {
  if (/[A-Za-z\u00c0-\u024f]-$/.test(a) && /^[A-Za-z\u00c0-\u024f]/.test(b)) return a.slice(0, -1) + b
  return `${a} ${b}`
}

/** Items sharing a baseline become one line; inside a line, gaps wider than a fraction of the type size become spaces. */
function groupLines(items: MdItem[]): MdLine[] {
  const sorted = items.filter((it) => it.str.length).sort((a, b) => b.y - a.y || a.x - b.x)
  const lines: MdLine[] = []
  let bucket: MdItem[] = []
  const flush = () => {
    if (!bucket.length) return
    const byX = [...bucket].sort((a, b) => a.x - b.x)
    let text = ''
    let end: number | null = null
    for (const it of byX) {
      const gap = end === null ? 0 : it.x - end
      if (end !== null && !/\s$/.test(text) && !/^\s/.test(it.str) && gap > Math.max(0.6, (it.height || 6) * 0.16)) text += ' '
      text += it.str
      end = it.x + (it.width || 0)
    }
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean) lines.push({ text: clean, height: bucket.reduce((m, it) => Math.max(m, it.height || 0), 0), y: bucket[0].y })
    bucket = []
  }
  for (const it of sorted) {
    if (bucket.length && Math.abs(bucket[0].y - it.y) > Math.max(1, (bucket[0].height || it.height || 1) * 0.4)) flush()
    bucket.push(it)
  }
  flush()
  return lines
}

/**
 * Geometry → Markdown for one page. Pure, so it is testable without a canvas: line grouping, block
 * breaks on vertical gaps, heading level from relative type size, list markers, and soft-wrap joining.
 */
export function itemsToMarkdown(items: MdItem[], body: number, headings: boolean): string {
  const lines = groupLines(items)
  const blocks: string[] = []
  let open: { prefix: string; text: string } | null = null
  const close = () => {
    if (open) blocks.push(open.prefix + open.text)
    open = null
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = lines[i - 1]
    // a vertical gap much bigger than the leading means a new paragraph, not a wrapped line
    const broke = !prev || prev.y - line.y > Math.max(prev.height, line.height, 1) * 1.6

    const level = headings ? headingLevel(line.height, body) : 0
    if (level) {
      close()
      blocks.push(`${'#'.repeat(level)} ${escapeMd(line.text)}`)
      continue
    }
    const ordered = MD_ORDERED.exec(line.text)
    const bullet = ordered || MD_BULLET.exec(line.text)
    if (bullet) {
      close()
      open = { prefix: ordered ? '1. ' : '- ', text: escapeMd(line.text.slice(bullet[0].length)) }
      continue
    }
    if (!open || broke) {
      close()
      open = { prefix: '', text: escapeMd(line.text) }
      continue
    }
    open.text = softJoin(open.text, escapeMd(line.text))
  }
  close()
  // consecutive items of the same kind belong to one tight list, not a run of stray paragraphs
  const listKind = (s: string) => (s.startsWith('- ') ? '-' : /^\d+\. /.test(s) ? '1' : '')
  const merged: string[] = []
  for (const b of blocks.filter(Boolean)) {
    const last = merged.length ? merged[merged.length - 1] : ''
    if (last && listKind(last) && listKind(last) === listKind(b)) merged[merged.length - 1] = `${last}\n${b}`
    else merged.push(b)
  }
  return merged.join('\n\n')
}

/** /Rotate turns the page for the reader but not the text matrices. Translation is irrelevant here, only the axes. */
function readingFrame(x: number, y: number, rot: number): { x: number; y: number } {
  if (rot === 90) return { x: y, y: -x }
  if (rot === 180) return { x: -x, y: -y }
  if (rot === 270) return { x: -y, y: x }
  return { x, y }
}

export async function pdfToMarkdown(file: File, opts: { headings: boolean; pageBreaks: boolean }, onProgress?: Progress): Promise<Output[]> {
  const pdf = await loadPdf(await readAsArrayBuffer(file))
  const pages: MdItem[][] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const rot = normalizeRotation(page.rotate || 0)
    const tc = await page.getTextContent()
    const items: MdItem[] = []
    for (const it of tc.items) {
      if (!('str' in it) || !it.str.length) continue
      const t = it.transform as number[]
      const p = readingFrame(t[4], t[5], rot)
      items.push({ str: it.str, x: p.x, y: p.y, width: it.width || 0, height: it.height || Math.hypot(t[2], t[3]) })
    }
    pages.push(items)
    onProgress?.((i / pdf.numPages) * 0.9, `Page ${i} of ${pdf.numPages}`)
  }
  const body = modalHeight(pages.flat())
  const parts = pages.map((p) => itemsToMarkdown(p, body, opts.headings)).filter((s) => s.trim())
  // a blank line either side of the rule, so it cannot be read as a setext heading for the line above
  const text = parts.join(opts.pageBreaks ? '\n\n---\n\n' : '\n\n')
  onProgress?.(1)
  return [
    {
      name: `${stripExt(file.name)}.md`,
      blob: new Blob([text ? `${text}\n` : ''], { type: 'text/markdown' }),
      note: text ? undefined : 'No text layer found, so this PDF is a scan or pure images. Run OCR PDF on it first, then convert the searchable copy.',
    },
  ]
}

/**
 * Pages can carry a /Rotate entry. Everything the user sees (pdf.js previews, "bottom-right of the
 * page") is in the rotated, visual frame, while pdf-lib draws in the unrotated user space. This maps a
 * visual rectangle (top-left origin fractions) to unrotated draw params, including the counter-rotation
 * the content needs so it appears upright.
 */
function visualRect(page: import('pdf-lib').PDFPage, fx: number, fy: number, fw: number, fh: number) {
  const rot = ((page.getRotation().angle % 360) + 360) % 360
  const { width: W, height: H } = page.getSize()
  const [VW, VH] = rot % 180 ? [H, W] : [W, H]
  const left = fx * VW
  const top = fy * VH
  const vw = fw * VW
  const vh = fh * VH
  // the content's own bottom-left corner, in the visual frame
  const bx = left
  const by = top + vh
  let x: number
  let y: number
  if (rot === 90) [x, y] = [by, bx]
  else if (rot === 180) [x, y] = [W - bx, by]
  else if (rot === 270) [x, y] = [W - by, H - bx]
  else [x, y] = [bx, H - by]
  return { x, y, width: vw, height: vh, rotate: degrees(rot), VW, VH }
}

// ---------- crop ----------
export type Rect = { x: number; y: number; width: number; height: number }
export type CropUnit = 'mm' | 'pt' | 'percent'
export type CropMode = 'margins' | 'auto' | 'box'
export type CropEdges = { top: number; right: number; bottom: number; left: number }

const PT_PER_MM = 72 / 25.4
const MIN_SIDE = 1 // pt: a crop box thinner than this is not a page any more
const AUTO_PAD = 6 // pt of air left around detected content
const AUTO_SCALE = 1.5 // render scale for the content scan: enough to catch thin rules, cheap enough to be quick

export function normalizeRotation(angle: number): number {
  return (((Math.round(angle / 90) * 90) % 360) + 360) % 360
}

/** One edge value in the user's unit → points. `span` is the length of the side it is measured along. */
export function toPoints(value: number, unit: CropUnit, span: number): number {
  if (!Number.isFinite(value)) return 0
  if (unit === 'mm') return value * PT_PER_MM
  if (unit === 'percent') return (span * value) / 100
  return value
}

/** How big the box looks to the reader: /Rotate 90 or 270 swaps the axes. */
const visualSize = (box: Rect, rot: number) => (rot % 180 ? { VW: box.height, VH: box.width } : { VW: box.width, VH: box.height })

/**
 * A point in the visual frame (u from the visual left, v down from the visual top, both relative to
 * `box`) → unrotated PDF user space. Same frame convention as `visualRect` above, kept in one place.
 */
function visualPoint(u: number, v: number, box: Rect, rot: number): { x: number; y: number } {
  const { width: W, height: H } = box
  if (rot === 90) return { x: box.x + v, y: box.y + u }
  if (rot === 180) return { x: box.x + W - u, y: box.y + v }
  if (rot === 270) return { x: box.x + W - v, y: box.y + H - u }
  return { x: box.x + u, y: box.y + H - v }
}

const fmtPt = (n: number) => Math.round(n * 10) / 10

/**
 * The new crop box, in unrotated user space, from edges the user gave in the *visual* frame.
 * `margins` cuts each edge inwards; `box` reads all four as offsets from the visual top-left corner,
 * the way a selection rectangle reads. Always computed from the box passed in, so crops compose.
 */
export function cropRect(box: Rect, rotation: number, mode: 'margins' | 'box', edges: CropEdges, unit: CropUnit, label = 'this page'): Rect {
  const rot = normalizeRotation(rotation)
  const { VW, VH } = visualSize(box, rot)
  const top = Math.max(0, toPoints(edges.top, unit, VH))
  const bottom = Math.max(0, toPoints(edges.bottom, unit, VH))
  const left = Math.max(0, toPoints(edges.left, unit, VW))
  const right = Math.max(0, toPoints(edges.right, unit, VW))
  const wanted =
    mode === 'box'
      ? { vx: Math.min(left, right), vy: Math.min(top, bottom), vw: Math.abs(right - left), vh: Math.abs(bottom - top) }
      : { vx: left, vy: top, vw: VW - left - right, vh: VH - top - bottom }
  // never step outside the box we already have
  const x0 = Math.min(Math.max(0, wanted.vx), VW)
  const y0 = Math.min(Math.max(0, wanted.vy), VH)
  const x1 = Math.max(x0, Math.min(wanted.vx + wanted.vw, VW))
  const y1 = Math.max(y0, Math.min(wanted.vy + wanted.vh, VH))
  if (x1 - x0 < MIN_SIDE || y1 - y0 < MIN_SIDE) {
    throw new Error(
      mode === 'box'
        ? `Those edges leave nothing of ${label}. In Region mode all four are measured from the top-left corner, so Right must be larger than Left and Bottom larger than Top.`
        : `Those margins would erase ${label} (${fmtPt(VW)} × ${fmtPt(VH)} pt). Use smaller values.`,
    )
  }
  const a = visualPoint(x0, y0, box, rot)
  const b = visualPoint(x1, y1, box, rot)
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), width: Math.abs(b.x - a.x), height: Math.abs(b.y - a.y) }
}

/**
 * Bounding box of everything that is not page-white in an RGBA bitmap, or null for a blank page.
 * Alpha is composited over white first, so an antialiased glyph on a transparent canvas counts the
 * same as one on a white one. Pixel bounds: left/top inclusive, right/bottom exclusive.
 */
export function contentBoxFromLuma(
  data: Uint8ClampedArray | number[],
  width: number,
  height: number,
  tolerance = 10,
): { left: number; top: number; right: number; bottom: number } | null {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  const cut = 255 - tolerance
  for (let y = 0; y < height; y++) {
    const row = y * width * 4
    for (let x = 0; x < width; x++) {
      const i = row + x * 4
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (255 - (data[i + 3] / 255) * (255 - lum) >= cut) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      bottom = y
    }
  }
  return right < 0 ? null : { left, top, right: right + 1, bottom: bottom + 1 }
}

type Bitmap = { data: Uint8ClampedArray; width: number; height: number }

/** Rasterise one page for the content scan. OffscreenCanvas keeps the pixels off the DOM; not every browser has it. */
async function renderForScan(pdf: Awaited<ReturnType<typeof loadPdf>>, pageNumber: number, scale: number): Promise<Bitmap> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale }) // already in the rotated, visual frame
  const width = Math.max(1, Math.ceil(viewport.width))
  const height = Math.max(1, Math.ceil(viewport.height))
  if (typeof OffscreenCanvas !== 'undefined') {
    const ctx = new OffscreenCanvas(width, height).getContext('2d')
    if (ctx) {
      await page.render({ canvas: null, canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport, intent: 'print' }).promise
      return { data: ctx.getImageData(0, 0, width, height).data, width, height }
    }
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('This browser will not give us a 2D canvas, so the content of the page cannot be measured. Use Margins instead.')
  await page.render({ canvas, canvasContext: ctx, viewport, intent: 'print' }).promise
  const data = ctx.getImageData(0, 0, width, height).data
  canvas.width = 0
  canvas.height = 0
  return { data, width, height }
}

/**
 * Sets the crop box rather than rewriting page content: nothing is thrown away and re-cropping
 * composes, because every mode measures from the box the page already has.
 */
export async function crop(
  file: File,
  opts: { mode: CropMode; top: number; right: number; bottom: number; left: number; unit: CropUnit; pages: string },
  onProgress?: Progress,
): Promise<Output[]> {
  const bytes = await readAsArrayBuffer(file)
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false })
  const targets = opts.pages?.trim() ? parseRanges(opts.pages, doc.getPageCount()) : doc.getPageIndices()
  if (!targets.length) throw new Error('That page range does not match any page in this file')

  let blanks = 0
  const pdf = opts.mode === 'auto' ? await loadPdf(bytes) : null
  for (let k = 0; k < targets.length; k++) {
    const i = targets[k]
    const page = doc.getPage(i)
    const box = page.getCropBox()
    const rot = normalizeRotation(page.getRotation().angle)
    let edges: CropEdges = { top: opts.top, right: opts.right, bottom: opts.bottom, left: opts.left }
    let unit: CropUnit = opts.unit
    if (pdf) {
      onProgress?.(k / targets.length, `Measuring page ${i + 1} of ${targets.length}`)
      const bmp = await renderForScan(pdf, i + 1, AUTO_SCALE)
      const found = contentBoxFromLuma(bmp.data, bmp.width, bmp.height)
      if (!found) {
        blanks++
        onProgress?.((k + 1) / targets.length, `Page ${i + 1} is blank, left alone`)
        continue // nothing to crop to; leave the page exactly as it was
      }
      // pixels → points in the same visual frame the viewport used, minus a little breathing room
      edges = {
        top: found.top / AUTO_SCALE - AUTO_PAD,
        left: found.left / AUTO_SCALE - AUTO_PAD,
        right: (bmp.width - found.right) / AUTO_SCALE - AUTO_PAD,
        bottom: (bmp.height - found.bottom) / AUTO_SCALE - AUTO_PAD,
      }
      unit = 'pt'
    }
    const r = cropRect(box, rot, opts.mode === 'box' ? 'box' : 'margins', edges, unit, `page ${i + 1}`)
    page.setCropBox(r.x, r.y, r.width, r.height)
    onProgress?.((k + 1) / targets.length)
  }
  const done = targets.length - blanks
  const note =
    `Cropped ${done} page${done === 1 ? '' : 's'}${blanks ? `, left ${blanks} blank page${blanks === 1 ? '' : 's'} alone` : ''}. ` +
    'The trimmed area is hidden by the crop box, not deleted, so this is reversible.'
  return [{ name: `${stripExt(file.name)}-cropped.pdf`, blob: pdfBlob(await doc.save()), note }]
}

// ---------- edit ----------
export async function watermark(
  file: File,
  opts: { text: string; size: number; opacity: number; rotation: number; color: 'grey' | 'red' | 'blue' | 'black'; position: 'center' | 'tile' | 'top' | 'bottom'; pages?: string },
): Promise<Output[]> {
  const doc = await open(file)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const colors = { grey: rgb(0.5, 0.5, 0.5), red: rgb(1, 0.23, 0.12), blue: rgb(0.04, 0.24, 1), black: rgb(0, 0, 0) }
  const text = opts.text || 'DRAFT'
  const targets = opts.pages?.trim() ? parseRanges(opts.pages, doc.getPageCount()) : doc.getPageIndices()
  if (!targets.length) throw new Error('That page range does not match any page in this file')
  for (const page of targets.map((i) => doc.getPage(i))) {
    const tw = font.widthOfTextAtSize(text, opts.size)
    const th = opts.size
    const { VW, VH } = visualRect(page, 0, 0, 1, 1)
    // (vx, vy) = top-left of the text box in the visual frame, in points
    const draw = (vx: number, vy: number) => {
      const r = visualRect(page, vx / VW, vy / VH, tw / VW, th / VH)
      page.drawText(text, { x: r.x, y: r.y, size: opts.size, font, color: colors[opts.color], opacity: opts.opacity, rotate: degrees(r.rotate.angle + opts.rotation) })
    }
    if (opts.position === 'tile') {
      for (let y = 40; y < VH; y += opts.size * 4) for (let x = -tw / 2; x < VW; x += tw + 80) draw(x, y)
    } else if (opts.position === 'top') draw((VW - tw) / 2, 24)
    else if (opts.position === 'bottom') draw((VW - tw) / 2, VH - th - 24)
    else {
      // rotate about the text's centre so it stays centred on the page
      const rad = (opts.rotation * Math.PI) / 180
      const cx = VW / 2 - (tw / 2) * Math.cos(rad) + (th / 2) * Math.sin(rad)
      const cy = VH / 2 + (tw / 2) * Math.sin(rad) + (th / 2) * Math.cos(rad)
      draw(cx, cy - th)
    }
  }
  return [{ name: `${stripExt(file.name)}-watermarked.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function pageNumbers(file: File, opts: { position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center'; format: 'n' | 'n-of-total' | 'page-n'; size: number; start: number; skipFirst?: number }): Promise<Output[]> {
  const doc = await open(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  const skip = Math.max(0, Math.floor(opts.skipFirst || 0))
  pages.forEach((page, i) => {
    if (i < skip) return // leave a cover or title page unnumbered
    const n = i - skip + opts.start
    const label = opts.format === 'n' ? `${n}` : opts.format === 'page-n' ? `Page ${n}` : `${n} / ${pages.length - skip + opts.start - 1}`
    const tw = font.widthOfTextAtSize(label, opts.size)
    const { VW, VH } = visualRect(page, 0, 0, 1, 1)
    const vx = opts.position.endsWith('center') ? (VW - tw) / 2 : opts.position.endsWith('right') ? VW - tw - 36 : 36
    const vy = opts.position.startsWith('top') ? 36 - opts.size : VH - 24 - opts.size
    const r = visualRect(page, vx / VW, vy / VH, tw / VW, opts.size / VH)
    page.drawText(label, { x: r.x, y: r.y, size: opts.size, font, color: rgb(0.1, 0.1, 0.1), rotate: r.rotate })
  })
  return [{ name: `${stripExt(file.name)}-numbered.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function signPdf(file: File, sig: { png: ArrayBuffer; page: number; x: number; y: number; w: number; h: number }[]): Promise<Output[]> {
  const doc = await open(file)
  for (const s of sig) {
    const img = await doc.embedPng(s.png)
    const page = doc.getPage(s.page)
    // incoming coords are top-left fractions of the page as displayed (rotation applied)
    const r = visualRect(page, s.x, s.y, s.w, s.h)
    page.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height, rotate: r.rotate })
  }
  return [{ name: `${stripExt(file.name)}-signed.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function setMetadata(file: File, meta: { title: string; author: string; subject: string; keywords: string }): Promise<Output[]> {
  const doc = await open(file)
  doc.setTitle(meta.title)
  doc.setAuthor(meta.author)
  doc.setSubject(meta.subject)
  doc.setKeywords(meta.keywords.split(',').map((k) => k.trim()).filter(Boolean))
  doc.setModificationDate(new Date())
  return [{ name: `${stripExt(file.name)}-meta.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function readMetadata(file: File) {
  const doc = await open(file)
  return { title: doc.getTitle() || '', author: doc.getAuthor() || '', subject: doc.getSubject() || '', keywords: doc.getKeywords() || '', pages: doc.getPageCount() }
}

// ---------- security ----------
export async function removeMetadata(file: File): Promise<Output[]> {
  const doc = await open(file)
  doc.setTitle('')
  doc.setAuthor('')
  doc.setSubject('')
  doc.setKeywords([])
  doc.setProducer('')
  doc.setCreator('')
  doc.setCreationDate(new Date(0))
  doc.setModificationDate(new Date(0))
  return [{ name: `${stripExt(file.name)}-clean.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function flatten(file: File): Promise<Output[]> {
  const doc = await open(file)
  let fields = 0
  let form: ReturnType<typeof doc.getForm> | null = null
  try {
    form = doc.getForm()
    fields = form.getFields().length
  } catch {
    form = null // no AcroForm
  }
  if (form && fields) {
    try {
      form.flatten()
    } catch (e) {
      throw new Error(`Found ${fields} field(s) but could not flatten them: ${(e as Error).message}`)
    }
  }
  return [{ name: `${stripExt(file.name)}-flat.pdf`, blob: pdfBlob(await doc.save()), note: fields ? `Flattened ${fields} form field(s).` : 'No form fields found; file re-saved.' }]
}

// ---------- OCR ----------
const OCR_PAGE_CAP = 30

export async function ocr(file: File, lang: string, onProgress?: Progress, pageCap = OCR_PAGE_CAP): Promise<{ text: string; outputs: Output[]; note?: string }> {
  const Tesseract = await import('tesseract.js')
  const worker = await Tesseract.createWorker(lang, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress, 'Recognizing…')
      else onProgress?.(0, m.status)
    },
  })
  const isPdf = /pdf$/i.test(file.type) || /\.pdf$/i.test(file.name)
  const pdf = isPdf ? await loadPdf(await readAsArrayBuffer(file)) : null
  const total = pdf ? Math.min(pdf.numPages, pageCap) : 1
  const note = pdf && pdf.numPages > pageCap ? `Only the first ${pageCap} of ${pdf.numPages} pages were processed in the browser.` : undefined

  const texts: string[] = []
  const searchable = await PDFDocument.create()
  const font = await searchable.embedFont(StandardFonts.Helvetica)
  try {
    // one page at a time: render → recognize → embed → drop the canvas, so memory stays flat
    for (let i = 0; i < total; i++) {
      onProgress?.(0, `Page ${i + 1} of ${total}`)
      const canvas = pdf ? await renderPageToCanvas(pdf, i + 1, 2) : await fileToCanvas(file)
      const { data } = await worker.recognize(canvas, {}, { text: true, blocks: true })
      texts.push(`--- Page ${i + 1} ---\n${data.text.trim()}`)
      const jpg = await canvasToBlob(canvas, 'image/jpeg', 0.85)
      const img = await searchable.embedJpg(await jpg.arrayBuffer())
      const page = searchable.addPage([canvas.width / 2, canvas.height / 2])
      page.drawImage(img, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() })
      // invisible text layer so the PDF is searchable/selectable
      const lines = (data.blocks || []).flatMap((b) => b.paragraphs.flatMap((p) => p.lines))
      for (const line of lines) {
        const h = (line.bbox.y1 - line.bbox.y0) / 2
        const t = line.text.trim()
        if (!t || h < 2) continue
        const size = Math.max(4, h * 0.8)
        page.drawText(t.replace(/[^\x20-\x7e\u00a0-\u00ff]/g, '?'), { x: line.bbox.x0 / 2, y: page.getHeight() - line.bbox.y1 / 2, size, font, opacity: 0 })
      }
      canvas.width = 0
      canvas.height = 0
    }
  } finally {
    await worker.terminate()
  }
  const text = texts.join('\n\n')
  return {
    text,
    note,
    outputs: [
      { name: `${stripExt(file.name)}-ocr.txt`, blob: new Blob([text], { type: 'text/plain' }) },
      { name: `${stripExt(file.name)}-searchable.pdf`, blob: pdfBlob(await searchable.save()), note },
    ],
  }
}

// ---------- QR ----------
export async function qrPng(text: string, opts: { size: number; dark: string; light: string; margin: number }): Promise<Blob> {
  const QRCode = await import('qrcode')
  const url = await QRCode.toDataURL(text, { width: opts.size, margin: opts.margin, color: { dark: opts.dark, light: opts.light }, errorCorrectionLevel: 'M' })
  return (await fetch(url)).blob()
}
export async function qrSvg(text: string, opts: { dark: string; light: string; margin: number }): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toString(text, { type: 'svg', margin: opts.margin, color: { dark: opts.dark, light: opts.light } })
}
export async function qrPdf(text: string, label: string): Promise<Blob> {
  const [QRCode, { jsPDF }] = await Promise.all([import('qrcode'), import('jspdf')])
  const url = await QRCode.toDataURL(text, { width: 800, margin: 2 })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  pdf.addImage(url, 'PNG', 55, 60, 100, 100)
  pdf.setFontSize(14)
  pdf.text(label.slice(0, 80), 105, 175, { align: 'center' })
  return pdf.output('blob')
}
