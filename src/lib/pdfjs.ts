import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Vite bundles the worker as an asset; pdf.js needs its URL.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjs }

export async function loadPdf(data: ArrayBuffer) {
  return pdfjs.getDocument({ data: new Uint8Array(data) }).promise
}

export async function renderPageToCanvas(
  pdf: Awaited<ReturnType<typeof loadPdf>>,
  pageNumber: number,
  scale = 1.5,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  const ctx = canvas.getContext('2d')!
  // intent:'print' makes pdf.js skip requestAnimationFrame, so rendering keeps going in a background tab
  await page.render({ canvasContext: ctx, viewport, canvas, intent: 'print' }).promise
  return canvas
}

export async function extractText(data: ArrayBuffer, onProgress?: (p: number) => void): Promise<string> {
  const pdf = await loadPdf(data)
  const parts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    let last: number | null = null
    let line = ''
    const lines: string[] = []
    for (const item of tc.items) {
      if (!('str' in item)) continue
      const y = Math.round(item.transform[5])
      if (last !== null && Math.abs(y - last) > 2) {
        lines.push(line)
        line = ''
      }
      line += item.str + (item.hasEOL ? '' : ' ')
      last = y
    }
    if (line) lines.push(line)
    parts.push(`--- Page ${i} ---\n${lines.join('\n').replace(/[ \t]+\n/g, '\n').trim()}`)
    onProgress?.(i / pdf.numPages)
  }
  return parts.join('\n\n')
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/jpeg' | 'image/png', quality = 0.92): Promise<Blob> {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), type, quality))
}
