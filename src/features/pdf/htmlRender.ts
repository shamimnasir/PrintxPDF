import html2canvas from 'html2canvas'
import DOMPurify from 'dompurify'
import { canvasToPdf, type PageSize } from '../../lib/canvasToPdf'
import { pageBreakOffsets } from '../webclip/exportPdf'

// Renders arbitrary HTML into an off-screen "paper" element styled like the web-clip page, then rasterises.
export async function exportPdfToBlob(html: string, size: PageSize = 'A4'): Promise<Blob> {
  // make sure the paper stylesheet is present even if the editor was never opened
  await import('../webclip/editor.css')
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
  await new Promise((r) => setTimeout(r, 50))
  try {
    const canvas = await html2canvas(page, {
      scale: Math.max(1, Math.min(2, 16000 / (page.scrollHeight || 1))),
      useCORS: true,
      backgroundColor: '#fff',
      logging: false,
      onclone: (doc) => doc.querySelectorAll('.pxp-pagebreak').forEach((n) => ((n as HTMLElement).style.cssText = 'border:0;margin:0;height:0')),
    })
    return canvasToPdf(canvas, size, 12, 0.9, pageBreakOffsets(page, canvas)).output('blob')
  } finally {
    holder.remove()
  }
}
