import { useEffect, useRef, useState } from 'react'
import { Dropzone } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob } from '../../../lib/download'
import { canvasToBlob, loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'

type P = { index: number; rotation: number }

export default function OrganizeTool() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<P[]>([])
  const [loading, setLoading] = useState(false)
  const [dragI, setDragI] = useState<number | null>(null)
  const [overI, setOverI] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  // thumbnail object URLs live outside React state: small strings in state, bytes owned by the browser
  const thumbs = useRef<Map<number, string>>(new Map())
  const [, bump] = useState(0)

  useEffect(() => {
    const urls = thumbs.current
    const revokeAll = () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
      urls.clear()
    }
    if (!file) {
      revokeAll()
      setPages([])
      return
    }
    let cancel = false
    setLoading(true)
    setPages([])
    revokeAll()
    ;(async () => {
      try {
        const pdf = await loadPdf(await file.arrayBuffer())
        const list: P[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const c = await renderPageToCanvas(pdf, i, 0.35)
          if (cancel) return
          const blob = await canvasToBlob(c, 'image/jpeg', 0.7)
          if (cancel) return
          urls.set(i - 1, URL.createObjectURL(blob))
          list.push({ index: i - 1, rotation: 0 })
          if (i % 5 === 0 || i === pdf.numPages) {
            setPages([...list])
            bump((n) => n + 1)
          }
        }
      } catch (e) {
        if (!cancel) toast(`Could not read that PDF: ${(e as Error).message}`, 'error')
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
      revokeAll()
    }
  }, [file, toast])

  const rotate = (i: number, d: number) => setPages((p) => p.map((x, k) => (k === i ? { ...x, rotation: (x.rotation + d + 360) % 360 } : x)))
  const remove = (i: number) => setPages((p) => p.filter((_, k) => k !== i))
  const move = (from: number, to: number) =>
    setPages((p) => {
      const n = [...p]
      const [x] = n.splice(from, 1)
      n.splice(to, 0, x)
      return n
    })

  const apply = async () => {
    if (!file || !pages.length) return
    setBusy(true)
    try {
      const { reorganize } = await import('../engines')
      const [out] = await reorganize(file, pages)
      downloadBlob(out.blob, out.name)
      toast('Organized PDF downloaded')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!file) return <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop a PDF to organize" />

  return (
    <div className="stack">
      <div className="row between">
        <div className="row" style={{ gap: '0.5rem' }}>
          <span className="badge badge-acid">{pages.length} pages</span>
          {loading && <span className="badge">Rendering…</span>}
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            Drag to reorder
          </span>
        </div>
        <div className="row" style={{ gap: '0.5rem' }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setPages((p) => [...p].reverse())}>
            Reverse
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setPages((p) => p.map((x) => ({ ...x, rotation: (x.rotation + 90) % 360 })))}>
            Rotate all
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}>
            Change file
          </button>
          <button className="btn btn-sm btn-acid" disabled={busy || loading || !pages.length} onClick={apply}>
            {busy ? 'Saving…' : 'Apply & download'}
          </button>
        </div>
      </div>
      <div className="thumbs">
        {pages.map((p, i) => (
          <div
            key={p.index}
            className={`thumb ${dragI === i ? 'dragging' : ''} ${overI === i ? 'over' : ''}`}
            draggable
            onDragStart={() => setDragI(i)}
            onDragOver={(e) => {
              e.preventDefault()
              setOverI(i)
            }}
            onDragLeave={() => setOverI(null)}
            onDrop={() => {
              if (dragI !== null && dragI !== i) move(dragI, i)
              setDragI(null)
              setOverI(null)
            }}
            onDragEnd={() => {
              setDragI(null)
              setOverI(null)
            }}
          >
            <span className="n">{p.index + 1}</span>
            <img src={thumbs.current.get(p.index)} alt={`Page ${p.index + 1}`} style={{ transform: `rotate(${p.rotation}deg)` }} />
            <div className="acts">
              <button onClick={() => rotate(i, -90)} title="Rotate left" aria-label={`Rotate page ${p.index + 1} left`}>
                ↺
              </button>
              <button onClick={() => rotate(i, 90)} title="Rotate right" aria-label={`Rotate page ${p.index + 1} right`}>
                ↻
              </button>
              <button disabled={i === 0} onClick={() => move(i, i - 1)} title="Move left" aria-label={`Move page ${p.index + 1} left`}>
                ←
              </button>
              <button disabled={i === pages.length - 1} onClick={() => move(i, i + 1)} title="Move right" aria-label={`Move page ${p.index + 1} right`}>
                →
              </button>
              <button onClick={() => remove(i)} title="Delete" aria-label={`Delete page ${p.index + 1}`} style={{ color: 'var(--alarm)' }}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
