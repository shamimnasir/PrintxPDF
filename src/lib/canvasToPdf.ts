import { jsPDF } from 'jspdf'

export type PageSize = 'A4' | 'Letter'

// page dimensions in mm
export const PAGE_MM: Record<PageSize, [number, number]> = { A4: [210, 297], Letter: [215.9, 279.4] }

/** Slice one tall canvas into portrait PDF pages. Shared by the web-clip exporter and the HTML/Word/Excel converters. */
/**
 * @param breaksPx canvas-space y offsets where a new page must start (manual page breaks); slices never cross one
 */
export function canvasToPdf(canvas: HTMLCanvasElement, size: PageSize = 'A4', marginMm = 12, quality = 0.92, breaksPx: number[] = []): jsPDF {
  const [pw, ph] = PAGE_MM[size]
  const pdf = new jsPDF({ unit: 'mm', format: size.toLowerCase() as 'a4' | 'letter', orientation: 'portrait' })
  const usableW = pw - marginMm * 2
  const usableH = ph - marginMm * 2
  const pxPerMm = canvas.width / usableW
  const sliceHeightPx = Math.max(1, Math.floor(usableH * pxPerMm))

  const breaks = [...new Set(breaksPx.map((b) => Math.round(b)).filter((b) => b > 0 && b < canvas.height))].sort((a, b) => a - b)
  let y = 0
  let first = true
  while (y < canvas.height) {
    const nextBreak = breaks.find((b) => b > y)
    const h = Math.min(sliceHeightPx, canvas.height - y, nextBreak ? nextBreak - y : Infinity)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = h
    slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
    if (!first) pdf.addPage()
    pdf.addImage(slice.toDataURL('image/jpeg', quality), 'JPEG', marginMm, marginMm, usableW, h / pxPerMm)
    first = false
    y += h
  }
  pdf.setProperties({ creator: 'PrintxPDF' })
  return pdf
}
