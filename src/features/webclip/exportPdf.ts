import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { downloadBlob } from '../../lib/download'

export type PageSize = 'A4' | 'Letter'

// jsPDF page dimensions in mm
const SIZES: Record<PageSize, [number, number]> = { A4: [210, 297], Letter: [215.9, 279.4] }

async function snapshot(el: HTMLElement) {
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 8000,
    onclone: (doc) => {
      // strip editor-only affordances from the clone
      doc.querySelectorAll('.pxp-hover, .pxp-editing').forEach((n) => n.classList.remove('pxp-hover', 'pxp-editing'))
    },
  })
}

/** Rasterises the page element and slices it into PDF pages. Images always survive; text is not selectable. */
export async function exportPdf(el: HTMLElement, filename: string, size: PageSize = 'A4', marginMm = 12) {
  const canvas = await snapshot(el)
  const [pw, ph] = SIZES[size]
  const pdf = new jsPDF({ unit: 'mm', format: size.toLowerCase() as 'a4' | 'letter', orientation: 'portrait' })
  const usableW = pw - marginMm * 2
  const usableH = ph - marginMm * 2
  const pxPerMm = canvas.width / usableW
  const sliceHeightPx = Math.floor(usableH * pxPerMm)

  let y = 0
  let first = true
  while (y < canvas.height) {
    const h = Math.min(sliceHeightPx, canvas.height - y)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = h
    slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
    if (!first) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', marginMm, marginMm, usableW, h / pxPerMm)
    first = false
    y += h
  }
  pdf.setProperties({ title: filename.replace(/\.pdf$/, ''), creator: 'PrintxPDF' })
  pdf.save(filename)
}

export async function exportPng(el: HTMLElement, filename: string) {
  const canvas = await snapshot(el)
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'))
  downloadBlob(blob, filename)
}

export function safeFilename(title: string, ext: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'printxpdf'}.${ext}`
}
