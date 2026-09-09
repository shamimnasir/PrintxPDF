import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import DOMPurify from 'dompurify'

// Renders arbitrary HTML into an off-screen "paper" element styled like the web-clip page, then rasterises.
export async function exportPdfToBlob(html: string, size: 'A4' | 'Letter' = 'A4'): Promise<Blob> {
  const holder = document.createElement('div')
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#fff;z-index:-1'
  const page = document.createElement('div')
  page.className = 'pxp-page size-M font-sans img-large margin-normal'
  page.style.cssText = 'box-shadow:none;border:0;width:794px'
  const body = document.createElement('div')
  body.className = 'pxp-body'
  body.innerHTML = DOMPurify.sanitize(html, { FORBID_TAGS: ['script', 'style', 'iframe'] })
  page.appendChild(body)
  holder.appendChild(page)
  document.body.appendChild(holder)
  // make sure the editor stylesheet is present even if the editor was never opened
  await import('../webclip/editor.css')
  await new Promise((r) => setTimeout(r, 50))
  try {
    const canvas = await html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#fff', logging: false })
    const [pw, ph] = size === 'A4' ? [210, 297] : [215.9, 279.4]
    const margin = 12
    const pdf = new jsPDF({ unit: 'mm', format: size.toLowerCase() as 'a4' | 'letter' })
    const usableW = pw - margin * 2
    const usableH = ph - margin * 2
    const pxPerMm = canvas.width / usableW
    const sliceH = Math.floor(usableH * pxPerMm)
    let y = 0
    let first = true
    while (y < canvas.height) {
      const h = Math.min(sliceH, canvas.height - y)
      const c = document.createElement('canvas')
      c.width = canvas.width
      c.height = h
      c.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
      if (!first) pdf.addPage()
      pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', margin, margin, usableW, h / pxPerMm)
      first = false
      y += h
    }
    return pdf.output('blob')
  } finally {
    holder.remove()
  }
}
