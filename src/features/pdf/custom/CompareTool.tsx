import { useCallback, useEffect, useRef, useState } from 'react'
import { Dropzone, FileList } from '../../../components/ui/Dropzone'
import { ProgressBar } from '../../../components/ui/ResultList'
import { Seg } from '../../../components/ui/Seg'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob, stripExt } from '../../../lib/download'
import { canvasToBlob, loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'
import { tokenRgb } from './pdfGeom'

type Pdf = Awaited<ReturnType<typeof loadPdf>>
type View = 'a' | 'b' | 'diff'

const TARGET_W = 900

function blank(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
  }
  return c
}

/** Render page `n` of `pdf` so its width lands on TARGET_W. Returns null when the page does not exist. */
async function renderAt(pdf: Pdf | null, n: number): Promise<HTMLCanvasElement | null> {
  if (!pdf || n < 1 || n > pdf.numPages) return null
  const page = await pdf.getPage(n)
  const vp = page.getViewport({ scale: 1 })
  return renderPageToCanvas(pdf, n, TARGET_W / vp.width)
}

/** Pad a canvas onto a white sheet of the given size (top-left aligned). */
function pad(src: HTMLCanvasElement | null, w: number, h: number) {
  const c = blank(w, h)
  if (src) c.getContext('2d')?.drawImage(src, 0, 0)
  return c
}

type DiffResult = { canvas: HTMLCanvasElement; percent: number }

function diffCanvases(a: HTMLCanvasElement, b: HTMLCanvasElement, tolerance: number, accent: [number, number, number]): DiffResult {
  const w = a.width
  const h = a.height
  const ca = a.getContext('2d')
  const cb = b.getContext('2d')
  const out = blank(w, h)
  const co = out.getContext('2d')
  if (!ca || !cb || !co) return { canvas: out, percent: 0 }
  const da = ca.getImageData(0, 0, w, h)
  const db = cb.getImageData(0, 0, w, h)
  const dd = co.createImageData(w, h)
  let changed = 0
  for (let i = 0; i < da.data.length; i += 4) {
    const dr = Math.abs(da.data[i] - db.data[i])
    const dg = Math.abs(da.data[i + 1] - db.data[i + 1])
    const dbl = Math.abs(da.data[i + 2] - db.data[i + 2])
    const isDiff = dr > tolerance || dg > tolerance || dbl > tolerance
    // desaturated, lightened base so the accent tint reads on top of it
    const luma = 0.299 * da.data[i] + 0.587 * da.data[i + 1] + 0.114 * da.data[i + 2]
    const base = 255 - (255 - luma) * 0.28
    if (isDiff) {
      changed++
      dd.data[i] = accent[0]
      dd.data[i + 1] = accent[1]
      dd.data[i + 2] = accent[2]
    } else {
      dd.data[i] = base
      dd.data[i + 1] = base
      dd.data[i + 2] = base
    }
    dd.data[i + 3] = 255
  }
  co.putImageData(dd, 0, 0)
  return { canvas: out, percent: (changed / (w * h)) * 100 }
}

export default function CompareTool() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [a, setA] = useState<Pdf | null>(null)
  const [b, setB] = useState<Pdf | null>(null)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<View>('diff')
  const [tolerance, setTolerance] = useState(28)
  const [percent, setPercent] = useState<number | null>(null)
  const [rendering, setRendering] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ v: number; msg: string } | null>(null)
  const holder = useRef<HTMLDivElement>(null)

  const pagesA = a?.numPages ?? 0
  const pagesB = b?.numPages ?? 0
  const maxPages = Math.max(pagesA, pagesB)

  useEffect(() => {
    if (files.length < 2) {
      setA(null)
      setB(null)
      return
    }
    let alive = true
    Promise.all([files[0].arrayBuffer().then(loadPdf), files[1].arrayBuffer().then(loadPdf)])
      .then(([x, y]) => {
        if (!alive) return
        setA(x)
        setB(y)
        setPage(1)
      })
      .catch((e: Error) => alive && toast(`Could not open both files: ${e.message}`, 'error'))
    return () => {
      alive = false
    }
  }, [files, toast])

  const buildPage = useCallback(
    async (n: number) => {
      const accent = tokenRgb(holder.current, '--acid', [43, 91, 255])
      const [ra, rb] = await Promise.all([renderAt(a, n), renderAt(b, n)])
      const w = Math.max(ra?.width ?? 1, rb?.width ?? 1)
      const h = Math.max(ra?.height ?? 1, rb?.height ?? 1)
      const pa = pad(ra, w, h)
      const pb = pad(rb, w, h)
      const d = diffCanvases(pa, pb, tolerance, accent)
      return { a: pa, b: pb, diff: d.canvas, percent: d.percent }
    },
    [a, b, tolerance],
  )

  // render the visible page into the holder
  useEffect(() => {
    const el = holder.current
    if (!a || !b || !el) return
    let cancel = false
    setRendering(true)
    ;(async () => {
      try {
        const r = await buildPage(page)
        if (cancel) return
        setPercent(r.percent)
        el.replaceChildren(view === 'a' ? r.a : view === 'b' ? r.b : r.diff)
      } catch (e) {
        if (!cancel) toast(`Could not render page ${page}: ${(e as Error).message}`, 'error')
      } finally {
        if (!cancel) setRendering(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [a, b, page, view, buildPage, toast])

  const exportDiff = async () => {
    if (!a || !b) return
    setBusy(true)
    setProgress({ v: 0, msg: 'Building diff…' })
    try {
      const { PDFDocument } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      for (let n = 1; n <= maxPages; n++) {
        setProgress({ v: (n - 1) / maxPages, msg: `Page ${n} of ${maxPages}…` })
        const r = await buildPage(n)
        const bytes = await (await canvasToBlob(r.diff, 'image/jpeg', 0.85)).arrayBuffer()
        const img = await doc.embedJpg(bytes)
        const p = doc.addPage([r.diff.width / 2, r.diff.height / 2])
        p.drawImage(img, { x: 0, y: 0, width: p.getWidth(), height: p.getHeight() })
      }
      setProgress({ v: 1, msg: 'Saving…' })
      const bytes = await doc.save()
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${stripExt(files[0].name)}-vs-${stripExt(files[1].name)}-diff.pdf`)
      toast('Diff PDF downloaded')
    } catch (e) {
      toast(`Could not build the diff PDF: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  if (files.length < 2)
    return (
      <div className="stack" style={{ maxWidth: 720 }}>
        <Dropzone accept=".pdf" multiple onFiles={(f) => setFiles((prev) => [...prev, ...f].slice(0, 2))} label="Drop two PDFs — old first, new second" />
        <FileList files={files} onRemove={(i) => setFiles((f) => f.filter((_, k) => k !== i))} />
        <p className="muted">
          Both files are rendered to the same width and compared pixel by pixel. It sees anything that moved, including
          reflowed lines — it is not a word-level text diff.
        </p>
      </div>
    )

  return (
    <div className="tool-grid">
      <div className="stack">
        <div className="row between">
          <div className="row" style={{ gap: '0.5rem' }}>
            <button className="icon-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
              ‹
            </button>
            <span className="mono">Page {page} / {maxPages}</span>
            <button className="icon-btn" disabled={page >= maxPages} onClick={() => setPage(page + 1)} aria-label="Next page">
              ›
            </button>
            {percent !== null && <span className="badge badge-acid">{percent.toFixed(2)}% of pixels differ</span>}
            {rendering && <span className="badge">Rendering…</span>}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={() => setFiles([])}>
            Change files
          </button>
        </div>

        <Seg<View>
          label="Which version to show"
          value={view}
          onChange={setView}
          options={[
            ['a', `A · ${files[0].name.slice(0, 18)}`],
            ['b', `B · ${files[1].name.slice(0, 18)}`],
            ['diff', 'Diff'],
          ]}
        />

        {page > pagesA && <div className="tool-notice alarm">Page {page} exists only in B. A is shown as a blank sheet, so the whole page reads as changed.</div>}
        {page > pagesB && <div className="tool-notice alarm">Page {page} exists only in A. B is shown as a blank sheet, so the whole page reads as changed.</div>}

        <div ref={holder} className="cmp-stage" />
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Comparison</h4>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          A has {pagesA} page(s), B has {pagesB}.
          {pagesA !== pagesB ? ' The page counts differ, so pages past the shorter file are compared against blank.' : ''}
        </p>
        <div>
          <label className="label" htmlFor="cmp-tol">
            Tolerance — {tolerance} / 255 per channel
          </label>
          <input id="cmp-tol" type="range" min={0} max={90} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
          <p className="muted" style={{ margin: '0.3rem 0 0', fontSize: '0.8rem' }}>
            Raise it to ignore antialiasing noise; lower it to catch faint changes.
          </p>
        </div>
        {progress && <ProgressBar value={progress.v} msg={progress.msg} />}
        <button className="btn btn-acid btn-lg btn-block" disabled={busy || !a || !b} onClick={exportDiff}>
          {busy ? 'Building…' : 'Download the diff as PDF'}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          The diff PDF is a picture of each page, one per page of the longer file, with changed pixels tinted in the
          accent colour. It is a visual record, not an editable document.
        </p>
      </div>
    </div>
  )
}
