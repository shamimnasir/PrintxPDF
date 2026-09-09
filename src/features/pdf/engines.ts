// All PDF operations run in the browser. Nothing is uploaded anywhere.
import { PDFDocument, degrees, rgb, StandardFonts, PageSizes } from 'pdf-lib'
import { jsPDF } from 'jspdf'
import { loadPdf, renderPageToCanvas, canvasToBlob, extractText } from '../../lib/pdfjs'
import { readAsArrayBuffer, readAsDataURL, stripExt } from '../../lib/download'

export type Output = { name: string; blob: Blob; note?: string }
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

async function transcodeToPng(file: File): Promise<ArrayBuffer> {
  const url = await readAsDataURL(file)
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = url
  })
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  c.getContext('2d')!.drawImage(img, 0, 0)
  return (await canvasToBlob(c, 'image/png')).arrayBuffer()
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

// ---------- edit ----------
export async function watermark(
  file: File,
  opts: { text: string; size: number; opacity: number; rotation: number; color: 'grey' | 'red' | 'blue' | 'black'; position: 'center' | 'tile' | 'top' | 'bottom' },
): Promise<Output[]> {
  const doc = await open(file)
  const font = await doc.embedFont(StandardFonts.HelveticaBold)
  const colors = { grey: rgb(0.5, 0.5, 0.5), red: rgb(1, 0.23, 0.12), blue: rgb(0.04, 0.24, 1), black: rgb(0, 0, 0) }
  const text = opts.text || 'DRAFT'
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize()
    const tw = font.widthOfTextAtSize(text, opts.size)
    const draw = (x: number, y: number) =>
      page.drawText(text, { x, y, size: opts.size, font, color: colors[opts.color], opacity: opts.opacity, rotate: degrees(opts.rotation) })
    if (opts.position === 'tile') {
      for (let y = 40; y < height; y += opts.size * 4) for (let x = -tw / 2; x < width; x += tw + 80) draw(x, y)
    } else if (opts.position === 'top') draw((width - tw) / 2, height - opts.size - 24)
    else if (opts.position === 'bottom') draw((width - tw) / 2, 24)
    else {
      const rad = (opts.rotation * Math.PI) / 180
      draw(width / 2 - (tw / 2) * Math.cos(rad), height / 2 - (tw / 2) * Math.sin(rad))
    }
  }
  return [{ name: `${stripExt(file.name)}-watermarked.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function pageNumbers(file: File, opts: { position: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center'; format: 'n' | 'n-of-total' | 'page-n'; size: number; start: number }): Promise<Output[]> {
  const doc = await open(file)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const pages = doc.getPages()
  pages.forEach((page, i) => {
    const n = i + opts.start
    const label = opts.format === 'n' ? `${n}` : opts.format === 'page-n' ? `Page ${n}` : `${n} / ${pages.length + opts.start - 1}`
    const { width, height } = page.getSize()
    const tw = font.widthOfTextAtSize(label, opts.size)
    const x = opts.position.endsWith('center') ? (width - tw) / 2 : opts.position.endsWith('right') ? width - tw - 36 : 36
    const y = opts.position.startsWith('top') ? height - 36 : 24
    page.drawText(label, { x, y, size: opts.size, font, color: rgb(0.1, 0.1, 0.1) })
  })
  return [{ name: `${stripExt(file.name)}-numbered.pdf`, blob: pdfBlob(await doc.save()) }]
}

export async function signPdf(file: File, sig: { png: ArrayBuffer; page: number; x: number; y: number; w: number; h: number }[]): Promise<Output[]> {
  const doc = await open(file)
  for (const s of sig) {
    const img = await doc.embedPng(s.png)
    const page = doc.getPage(s.page)
    const { height } = page.getSize()
    // incoming coords are top-left based fractions of the page; pdf-lib is bottom-left points
    const pw = page.getWidth()
    page.drawImage(img, { x: s.x * pw, y: height - (s.y + s.h) * height, width: s.w * pw, height: s.h * height })
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
  try {
    const form = doc.getForm()
    fields = form.getFields().length
    form.flatten()
  } catch {
    /* no AcroForm */
  }
  return [{ name: `${stripExt(file.name)}-flat.pdf`, blob: pdfBlob(await doc.save()), note: fields ? `Flattened ${fields} form field(s).` : 'No form fields found; file re-saved.' }]
}

// ---------- OCR ----------
export async function ocr(file: File, lang: string, onProgress?: Progress): Promise<{ text: string; outputs: Output[] }> {
  const Tesseract = await import('tesseract.js')
  const worker = await Tesseract.createWorker(lang, 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress, 'Recognizing…')
      else onProgress?.(0, m.status)
    },
  })
  const images: HTMLCanvasElement[] = []
  const isPdf = /pdf$/i.test(file.type) || /\.pdf$/i.test(file.name)
  if (isPdf) {
    const pdf = await loadPdf(await readAsArrayBuffer(file))
    for (let i = 1; i <= Math.min(pdf.numPages, 30); i++) images.push(await renderPageToCanvas(pdf, i, 2))
  } else {
    const url = await readAsDataURL(file)
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    c.getContext('2d')!.drawImage(img, 0, 0)
    images.push(c)
  }
  const texts: string[] = []
  const searchable = await PDFDocument.create()
  const font = await searchable.embedFont(StandardFonts.Helvetica)
  for (let i = 0; i < images.length; i++) {
    onProgress?.(0, `Page ${i + 1} of ${images.length}`)
    const { data } = await worker.recognize(images[i])
    texts.push(`--- Page ${i + 1} ---\n${data.text.trim()}`)
    // searchable PDF: page image + invisible text layer
    const jpg = await canvasToBlob(images[i], 'image/jpeg', 0.85)
    const img = await searchable.embedJpg(await jpg.arrayBuffer())
    const page = searchable.addPage([images[i].width / 2, images[i].height / 2])
    page.drawImage(img, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() })
    const lines = (data as unknown as { lines?: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }[] }).lines || []
    for (const line of lines) {
      const h = (line.bbox.y1 - line.bbox.y0) / 2
      if (!line.text.trim() || h < 2) continue
      page.drawText(line.text.trim(), { x: line.bbox.x0 / 2, y: page.getHeight() - line.bbox.y1 / 2, size: Math.max(4, h * 0.8), font, opacity: 0 })
    }
  }
  await worker.terminate()
  const text = texts.join('\n\n')
  return {
    text,
    outputs: [
      { name: `${stripExt(file.name)}-ocr.txt`, blob: new Blob([text], { type: 'text/plain' }) },
      { name: `${stripExt(file.name)}-searchable.pdf`, blob: pdfBlob(await searchable.save()) },
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
  const QRCode = await import('qrcode')
  const url = await QRCode.toDataURL(text, { width: 800, margin: 2 })
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  pdf.addImage(url, 'PNG', 55, 60, 100, 100)
  pdf.setFontSize(14)
  pdf.text(label.slice(0, 80), 105, 175, { align: 'center' })
  return pdf.output('blob')
}
