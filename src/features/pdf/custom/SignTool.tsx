import { useEffect, useMemo, useRef, useState } from 'react'
import { Dropzone } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob } from '../../../lib/download'
import { loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'
import { store, uid, type Signature } from '../../../lib/store'

type Placed = { id: string; page: number; x: number; y: number; w: number; h: number; dataUrl: string }

function useSignaturePad() {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [empty, setEmpty] = useState(true)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = c.clientWidth * dpr
    c.height = c.clientHeight * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0b1c8a'
  }, [])
  const pos = (e: PointerEvent | React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top] as const
  }
  const onDown = (e: React.PointerEvent) => {
    drawing.current = true
    const ctx = ref.current!.getContext('2d')!
    const [x, y] = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const ctx = ref.current!.getContext('2d')!
    const [x, y] = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setEmpty(false)
  }
  const onUp = () => (drawing.current = false)
  const clear = () => {
    const c = ref.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setEmpty(true)
  }
  const toDataUrl = () => {
    // trim whitespace so the placed signature hugs the ink
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const { data } = ctx.getImageData(0, 0, c.width, c.height)
    let minX = c.width, minY = c.height, maxX = 0, maxY = 0
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++)
        if (data[(y * c.width + x) * 4 + 3] > 0) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
    if (maxX <= minX) return c.toDataURL('image/png')
    const pad = 8
    const out = document.createElement('canvas')
    out.width = maxX - minX + pad * 2
    out.height = maxY - minY + pad * 2
    out.getContext('2d')!.drawImage(c, minX - pad, minY - pad, out.width, out.height, 0, 0, out.width, out.height)
    return out.toDataURL('image/png')
  }
  return { ref, onDown, onMove, onUp, clear, empty, toDataUrl }
}

function typedSignature(text: string, font: string) {
  const c = document.createElement('canvas')
  c.width = 900
  c.height = 220
  const ctx = c.getContext('2d')!
  ctx.font = `italic 96px ${font}`
  ctx.fillStyle = '#0b1c8a'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 30, 110)
  return c.toDataURL('image/png')
}

export default function SignTool() {
  const { toast } = useToast()
  const pad = useSignaturePad()
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<Awaited<ReturnType<typeof loadPdf>> | null>(null)
  const [pageNo, setPageNo] = useState(1)
  const stageRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tab, setTab] = useState<'draw' | 'type' | 'upload' | 'saved'>('draw')
  const [uploaded, setUploaded] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [font, setFont] = useState('"Brush Script MT", "Snell Roundhand", cursive')
  const [active, setActive] = useState<string | null>(null) // dataUrl to place
  const [placed, setPlaced] = useState<Placed[]>([])
  const [saved, setSaved] = useState<Signature[]>(store.getSignatures())
  const [busy, setBusy] = useState(false)
  const drag = useRef<{ id: string; dx: number; dy: number; resize: boolean } | null>(null)

  useEffect(() => {
    if (!file) return
    file.arrayBuffer().then(loadPdf).then((p) => {
      setPdf(p)
      setPageNo(1)
      setPlaced([])
    })
  }, [file])

  useEffect(() => {
    if (!pdf || !stageRef.current) return
    let cancel = false
    renderPageToCanvas(pdf, pageNo, 1.3).then((c) => {
      if (cancel) return
      const s = stageRef.current!
      s.width = c.width
      s.height = c.height
      s.getContext('2d')!.drawImage(c, 0, 0)
    })
    return () => {
      cancel = true
    }
  }, [pdf, pageNo])

  // encoding a 900×220 PNG on every keystroke is wasteful; memoise per (text, font)
  const typedPreview = useMemo(() => (typed.trim() ? typedSignature(typed.trim(), font) : null), [typed, font])
  const currentSig = () => {
    if (tab === 'draw') return pad.empty ? null : pad.toDataUrl()
    if (tab === 'type') return typedPreview
    if (tab === 'upload') return uploaded
    return active
  }

  const onUpload = async (f: File | undefined) => {
    if (!f) return
    if (!/^image\//.test(f.type)) return toast('Pick a PNG or JPG image', 'error')
    const reader = new FileReader()
    reader.onload = () => setUploaded(reader.result as string)
    reader.onerror = () => toast('Could not read that image', 'error')
    reader.readAsDataURL(f)
  }

  const onStageClick = (e: React.MouseEvent) => {
    const sig = currentSig()
    if (!sig) return toast('Draw, type or pick a signature first', 'error')
    if (drag.current) return
    const r = wrapRef.current!.getBoundingClientRect()
    const w = 0.28
    const h = w * (r.width / r.height) * 0.35
    const x = Math.min(1 - w, Math.max(0, (e.clientX - r.left) / r.width - w / 2))
    const y = Math.min(1 - h, Math.max(0, (e.clientY - r.top) / r.height - h / 2))
    setPlaced((p) => [...p, { id: uid(), page: pageNo - 1, x, y, w, h, dataUrl: sig }])
  }

  const onPointerDown = (e: React.PointerEvent, id: string, resize = false) => {
    e.stopPropagation()
    const r = wrapRef.current!.getBoundingClientRect()
    const p = placed.find((s) => s.id === id)!
    drag.current = { id, dx: (e.clientX - r.left) / r.width - p.x, dy: (e.clientY - r.top) / r.height - p.y, resize }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const r = wrapRef.current!.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const { id, dx, dy, resize } = drag.current
    setPlaced((list) =>
      list.map((s) => {
        if (s.id !== id) return s
        if (resize) {
          const w = Math.max(0.06, px - s.x)
          return { ...s, w, h: Math.max(0.03, py - s.y) }
        }
        return { ...s, x: Math.min(1 - s.w, Math.max(0, px - dx)), y: Math.min(1 - s.h, Math.max(0, py - dy)) }
      }),
    )
  }
  const onPointerUp = () => setTimeout(() => (drag.current = null), 0)

  const apply = async () => {
    if (!file || !placed.length) return
    setBusy(true)
    try {
      const sigs = await Promise.all(
        placed.map(async (p) => ({ png: await (await fetch(p.dataUrl)).arrayBuffer(), page: p.page, x: p.x, y: p.y, w: p.w, h: p.h })),
      )
      const { signPdf } = await import('../engines')
      const [out] = await signPdf(file, sigs)
      downloadBlob(out.blob, out.name)
      toast('Signed PDF downloaded')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const saveCurrent = () => {
    const sig = currentSig()
    if (!sig) return toast('Nothing to save yet', 'error')
    if (!store.getUser()) return toast('Sign in to keep signatures across visits', 'error')
    const ok = store.addSignature(typed || `Signature ${saved.length + 1}`, sig)
    setSaved(store.getSignatures())
    toast(ok ? 'Signature saved to your account' : 'Could not save: browser storage is full', ok ? 'ok' : 'error')
  }

  return (
    <div className="tool-grid">
      <div className="stack">
        {!file && <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop the PDF to sign" />}
        {file && pdf && (
          <>
            <div className="row between">
              <div className="row" style={{ gap: '0.5rem' }}>
                <button className="icon-btn" disabled={pageNo <= 1} onClick={() => setPageNo(pageNo - 1)}>
                  ‹
                </button>
                <span className="mono">
                  Page {pageNo} / {pdf.numPages}
                </span>
                <button className="icon-btn" disabled={pageNo >= pdf.numPages} onClick={() => setPageNo(pageNo + 1)}>
                  ›
                </button>
              </div>
              <span className="badge badge-acid">Click the page to place your signature</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}>
                Change file
              </button>
            </div>
            <div ref={wrapRef} className="sign-stage" onClick={onStageClick} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
              <canvas ref={stageRef} />
              {placed
                .filter((p) => p.page === pageNo - 1)
                .map((p) => (
                  <div
                    key={p.id}
                    className="sig-placed"
                    style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${p.w * 100}%`, height: `${p.h * 100}%` }}
                    onPointerDown={(e) => onPointerDown(e, p.id)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img src={p.dataUrl} alt="signature" style={{ objectFit: 'contain' }} />
                    <button className="del" onClick={() => setPlaced(placed.filter((s) => s.id !== p.id))} aria-label="Remove">
                      ×
                    </button>
                    <div className="resize" onPointerDown={(e) => onPointerDown(e, p.id, true)} />
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div className="card stack">
        <div className="tabs">
          {(['draw', 'type', 'upload', 'saved'] as const).map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'draw' && (
          <>
            <canvas ref={pad.ref} className="sig-pad" onPointerDown={pad.onDown} onPointerMove={pad.onMove} onPointerUp={pad.onUp} onPointerLeave={pad.onUp} />
            <button className="btn btn-sm btn-ghost" onClick={pad.clear}>
              Clear
            </button>
          </>
        )}
        {tab === 'type' && (
          <>
            <input className="input" placeholder="Your name" value={typed} onChange={(e) => setTyped(e.target.value)} />
            <select className="select" value={font} onChange={(e) => setFont(e.target.value)}>
              <option value='"Brush Script MT", "Snell Roundhand", cursive'>Script</option>
              <option value='"Apple Chancery", "URW Chancery L", cursive'>Chancery</option>
              <option value="Georgia, serif">Serif</option>
              <option value="'Archivo Black', sans-serif">Block</option>
            </select>
            {typedPreview && (
              <div style={{ border: '2px solid var(--line)', background: '#fff' }}>
                <img src={typedPreview} alt="preview" />
              </div>
            )}
          </>
        )}
        {tab === 'upload' && (
          <div className="stack">
            <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
              A PNG with a transparent background sits cleanest on the page. A photo of a signature on white paper works
              too, but the white block will cover whatever is under it.
            </p>
            <input className="input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onUpload(e.target.files?.[0])} />
            {uploaded && (
              <div style={{ border: '2px solid var(--line)', background: '#fff', padding: '0.5rem' }}>
                <img src={uploaded} alt="Uploaded signature preview" style={{ maxHeight: 90, width: 'auto', margin: '0 auto' }} />
              </div>
            )}
          </div>
        )}
        {tab === 'saved' && (
          <div className="stack">
            {saved.length === 0 && <p className="muted" style={{ margin: 0 }}>No saved signatures yet. Draw or type one and hit Save.</p>}
            {saved.map((s) => (
              <div key={s.id} className="file-row" style={{ cursor: 'pointer', outline: active === s.dataUrl ? '3px solid var(--acid)' : 'none' }} onClick={() => setActive(s.dataUrl)}>
                <img src={s.dataUrl} alt={s.name} style={{ height: 32, width: 'auto', maxWidth: 120 }} />
                <span className="name">{s.name}</span>
                <button
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    store.deleteSignature(s.id)
                    setSaved(store.getSignatures())
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="row" style={{ gap: '0.5rem' }}>
          <button className="btn btn-sm" onClick={saveCurrent}>
            Save signature
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => setPlaced([])} disabled={!placed.length}>
            Clear placed
          </button>
        </div>
        <label className="label">Add a date stamp</label>
        <button
          className="btn btn-sm btn-ghost"
          disabled={!file}
          onClick={() => {
            const d = typedSignature(new Date().toLocaleDateString(), 'Helvetica, Arial')
            setPlaced((p) => [...p, { id: uid(), page: pageNo - 1, x: 0.6, y: 0.85, w: 0.25, h: 0.045, dataUrl: d }])
          }}
        >
          Insert today's date
        </button>
        <button className="btn btn-acid btn-lg btn-block" disabled={!placed.length || busy} onClick={apply}>
          {busy ? 'Signing…' : `Sign & download (${placed.length})`}
        </button>
      </div>
    </div>
  )
}
