import html2canvas from 'html2canvas'
import { downloadBlob } from '../../lib/download'
import { canvasToPdf, type PageSize } from '../../lib/canvasToPdf'

export type { PageSize }

// html2canvas at scale 2 on a very long article can exceed the browser's canvas limits; cap the scale so height stays under ~16k px
function scaleFor(el: HTMLElement) {
  const h = el.scrollHeight || el.offsetHeight || 1
  return Math.max(1, Math.min(2, 16000 / h))
}

async function snapshot(el: HTMLElement) {
  return html2canvas(el, {
    scale: scaleFor(el),
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 8000,
    onclone: (doc) => {
      // strip editor-only affordances from the clone; page-break markers become invisible (they drive slicing instead)
      doc.querySelectorAll('.pxp-hover').forEach((n) => n.classList.remove('pxp-hover'))
      doc.querySelectorAll('.pxp-pagebreak').forEach((n) => ((n as HTMLElement).style.cssText = 'border:0;margin:0;height:0'))
    },
  })
}

/** Rasterises the page element and slices it into PDF pages. Images always survive; text is not selectable. */
/** y offsets (in canvas px) of manual page breaks inside el */
export function pageBreakOffsets(el: HTMLElement, canvas: HTMLCanvasElement) {
  const top = el.getBoundingClientRect().top
  const ratio = canvas.height / (el.getBoundingClientRect().height || 1)
  return Array.from(el.querySelectorAll<HTMLElement>('.pxp-pagebreak')).map((b) => (b.getBoundingClientRect().top - top) * ratio)
}

export async function exportPdf(el: HTMLElement, filename: string, size: PageSize = 'A4') {
  const canvas = await snapshot(el)
  const pdf = canvasToPdf(canvas, size, 12, 0.92, pageBreakOffsets(el, canvas))
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
