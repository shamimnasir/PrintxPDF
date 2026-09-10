import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../../../components/ui/Dropzone'
import { ProgressBar } from '../../../components/ui/ResultList'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob, stripExt } from '../../../lib/download'
import { canvasToBlob, loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'
import { uid } from '../../../lib/store'

type Pdf = Awaited<ReturnType<typeof loadPdf>>
/** top-left fractions of the page as displayed */
type Box = { id: string; page: number; x: number; y: number; w: number; h: number }

const EXPORT_SCALE = 2
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export default function RedactTool() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [pageNo, setPageNo] = useState(1)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ v: number; msg: string } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const [draft, setDraft] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  useEffect(() => {
    if (!file) return
    let alive = true
    file
      .arrayBuffer()
      .then(loadPdf)
      .then((p) => {
        if (!alive) return
        setPdf(p)
        setPageNo(1)
        setBoxes([])
      })
      .catch((e: Error) => alive && toast(`Could not open that PDF: ${e.message}`, 'error'))
    return () => {
      alive = false
    }
  }, [file, toast])

  useEffect(() => {
    if (!pdf) return
    let cancel = false
    renderPageToCanvas(pdf, pageNo, 1.4).then((c) => {
      if (cancel || !canvasRef.current) return
      const s = canvasRef.current
      s.width = c.width
      s.height = c.height
      s.getContext('2d')?.drawImage(c, 0, 0)
    })
    return () => {
      cancel = true
    }
  }, [pdf, pageNo])

  const frac = (e: { clientX: number; clientY: number }) => {
    const r = wrapRef.current!.getBoundingClientRect()
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) }
  }

  const onDown = (e: React.PointerEvent) => {
    if (!pdf) return
    const p = frac(e)
    start.current = p
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 })
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!start.current) return
    const p = frac(e)
    const s = start.current
    setDraft({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) })
  }
  const onUp = () => {
    if (!start.current) return
    start.current = null
    if (draft && draft.w > 0.005 && draft.h > 0.005) setBoxes((b) => [...b, { id: uid(), page: pageNo - 1, ...draft }])
    setDraft(null)
  }

  const wholePage = () => setBoxes((b) => [...b.filter((x) => x.page !== pageNo - 1), { id: uid(), page: pageNo - 1, x: 0, y: 0, w: 1, h: 1 }])

  const pageBoxes = boxes.filter((b) => b.page === pageNo - 1)
  const touched = new Set(boxes.map((b) => b.page))

  const run = async () => {
    if (!file || !pdf || !boxes.length) return
    setBusy(true)
    setProgress({ v: 0, msg: 'Preparing…' })
    try {
      const { PDFDocument } = await import('pdf-lib')
      const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false })
      const out = await PDFDocument.create()
      const total = src.getPageCount()
      for (let i = 0; i < total; i++) {
        const mine = boxes.filter((b) => b.page === i)
        setProgress({ v: i / total, msg: mine.length ? `Blacking out page ${i + 1}…` : `Copying page ${i + 1}…` })
        if (!mine.length) {
          const [copied] = await out.copyPages(src, [i])
          out.addPage(copied)
          continue
        }
        const page = await pdf.getPage(i + 1)
        const vp = page.getViewport({ scale: 1 })
        const c = await renderPageToCanvas(pdf, i + 1, EXPORT_SCALE)
        const ctx = c.getContext('2d')
        if (!ctx) throw new Error('This browser cannot draw the pages')
        ctx.fillStyle = '#000000'
        for (const b of mine) ctx.fillRect(Math.round(b.x * c.width), Math.round(b.y * c.height), Math.ceil(b.w * c.width), Math.ceil(b.h * c.height))
        const bytes = await (await canvasToBlob(c, 'image/jpeg', 0.88)).arrayBuffer()
        const img = await out.embedJpg(bytes)
        // the pdf.js viewport already has the page rotation applied, so the flat image page uses those dims
        const p = out.addPage([vp.width, vp.height])
        p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height })
      }
      setProgress({ v: 1, msg: 'Saving…' })
      const bytes = await out.save()
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${stripExt(file.name)}-redacted.pdf`)
      toast(`Blacked out ${touched.size} page(s)`)
    } catch (e) {
      toast(`Could not black out the pages: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  if (!file)
    return (
      <div className="stack" style={{ maxWidth: 720 }}>
        <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop a PDF to redact" />
        <p className="muted">
          Drag a box over anything private. When you download, each marked page is turned into a picture with the
          boxes painted on, so the words underneath are really gone from the file, not just hidden behind a black box.
        </p>
      </div>
    )

  return (
    <div className="tool-grid">
      <div className="stack">
        <div className="row between">
          <div className="row" style={{ gap: '0.5rem' }}>
            <button className="icon-btn" disabled={pageNo <= 1} onClick={() => setPageNo(pageNo - 1)} aria-label="Previous page">
              ‹
            </button>
            <span className="mono">Page {pageNo} / {pdf?.numPages ?? '…'}</span>
            <button className="icon-btn" disabled={!pdf || pageNo >= pdf.numPages} onClick={() => setPageNo(pageNo + 1)} aria-label="Next page">
              ›
            </button>
            <span className="badge badge-acid">Drag a box over what to hide</span>
          </div>
          <div className="row" style={{ gap: '0.5rem' }}>
            <button className="btn btn-sm" onClick={wholePage}>
              Redact whole page
            </button>
            <button className="btn btn-sm btn-ghost" disabled={!pageBoxes.length} onClick={() => setBoxes((b) => b.filter((x) => x.page !== pageNo - 1))}>
              Clear page
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}>
              Change file
            </button>
          </div>
        </div>

        <div ref={wrapRef} className="redact-stage" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <canvas ref={canvasRef} />
          {pageBoxes.map((b) => (
            <div key={b.id} className="redact-box" style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }}>
              <button
                className="del"
                aria-label="Remove this box"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setBoxes((list) => list.filter((x) => x.id !== b.id))}
              >
                ×
              </button>
            </div>
          ))}
          {draft && <div className="redact-box draft" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%` }} />}
        </div>
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Marked areas</h4>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          {boxes.length} box(es) across {touched.size} page(s).
        </p>
        {progress && <ProgressBar value={progress.v} msg={progress.msg} />}
        <button className="btn btn-acid btn-lg btn-block" disabled={!boxes.length || busy} onClick={run}>
          {busy ? 'Blacking out…' : 'Redact & download'}
        </button>
        <button className="btn btn-sm btn-ghost" disabled={!boxes.length || busy} onClick={() => setBoxes([])}>
          Clear all
        </button>
        <div className="tool-notice">
          <strong>Good to know.</strong>
          <p>
            Every page you mark is turned into a sharp picture ({EXPORT_SCALE}× size). On those pages you can no longer
            select text or click links, and the file gets bigger. Pages you do not mark are copied through untouched.
            Run <Link to="/tools/ocr-pdf">OCR PDF</Link> afterwards if you need the blacked-out pages searchable again.
          </p>
        </div>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          Check the result before sending it. The hidden details stored inside the PDF (title, author, dates), attached
          files and bookmarks are not cleared by this tool. Use <Link to="/tools/remove-metadata">Remove Metadata</Link>{' '}
          for those.
        </p>
      </div>
    </div>
  )
}
