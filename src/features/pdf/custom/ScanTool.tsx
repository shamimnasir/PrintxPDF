import { useCallback, useEffect, useRef, useState } from 'react'
import { Dropzone } from '../../../components/ui/Dropzone'
import { ProgressBar } from '../../../components/ui/ResultList'
import { Seg } from '../../../components/ui/Seg'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob } from '../../../lib/download'
import { canvasToBlob } from '../../../lib/pdfjs'
import { uid } from '../../../lib/store'
import { capCanvas } from './pdfGeom'

type PageSize = 'A4' | 'Letter' | 'fit'
type Page = { id: string; name: string; grey: boolean; contrast: boolean; preview: string }
type CamState = 'off' | 'starting' | 'on' | 'denied' | 'missing' | 'insecure' | 'unsupported'

/** Full-resolution sources live outside React state; state only carries small preview URLs. */
const MAX_EDGE = 2400
const THUMB_EDGE = 320

function processed(src: HTMLCanvasElement, grey: boolean, contrast: boolean): HTMLCanvasElement {
  if (!grey && !contrast) return src
  const out = document.createElement('canvas')
  out.width = src.width
  out.height = src.height
  const ctx = out.getContext('2d')
  if (!ctx) return src
  ctx.drawImage(src, 0, 0)
  const img = ctx.getImageData(0, 0, out.width, out.height)
  const d = img.data
  if (grey) for (let i = 0; i < d.length; i += 4) d[i] = d[i + 1] = d[i + 2] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
  if (contrast) {
    // simple luma stretch: find the 1st/99th percentile of brightness and map it to 0..255
    const hist = new Uint32Array(256)
    for (let i = 0; i < d.length; i += 4) hist[Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])]++
    const total = d.length / 4
    const cut = total * 0.01
    let lo = 0
    let hi = 255
    let acc = 0
    for (let v = 0; v < 256; v++) {
      acc += hist[v]
      if (acc > cut) {
        lo = v
        break
      }
    }
    acc = 0
    for (let v = 255; v >= 0; v--) {
      acc += hist[v]
      if (acc > cut) {
        hi = v
        break
      }
    }
    const span = Math.max(1, hi - lo)
    const lut = new Uint8Array(256)
    for (let v = 0; v < 256; v++) lut[v] = Math.min(255, Math.max(0, Math.round(((v - lo) * 255) / span)))
    for (let i = 0; i < d.length; i += 4) {
      d[i] = lut[d[i]]
      d[i + 1] = lut[d[i + 1]]
      d[i + 2] = lut[d[i + 2]]
    }
  }
  ctx.putImageData(img, 0, 0)
  return out
}

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = () => rej(new Error(`Could not open ${file.name}`))
      i.src = url
    })
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    c.getContext('2d')?.drawImage(img, 0, 0)
    return capCanvas(c, MAX_EDGE)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export default function ScanTool() {
  const { toast } = useToast()
  const [pages, setPages] = useState<Page[]>([])
  const [cam, setCam] = useState<CamState>('off')
  const [camMsg, setCamMsg] = useState('')
  const [size, setSize] = useState<PageSize>('A4')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ v: number; msg: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const sources = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const previews = useRef<Map<string, string>>(new Map())

  const stopCamera = useCallback(() => {
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCam('off')
  }, [])

  // never leave the camera light on, and never leak preview URLs
  useEffect(() => {
    const urls = previews.current
    const srcs = sources.current
    return () => {
      stream.current?.getTracks().forEach((t) => t.stop())
      stream.current = null
      urls.forEach((u) => URL.revokeObjectURL(u))
      urls.clear()
      srcs.clear()
    }
  }, [])

  const startCamera = async () => {
    if (!window.isSecureContext) {
      setCam('insecure')
      setCamMsg('The camera only works on a secure (https) web address.')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam('unsupported')
      setCamMsg('This browser cannot use the camera.')
      return
    }
    setCam('starting')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false })
      stream.current = s
      if (videoRef.current) {
        videoRef.current.srcObject = s
        await videoRef.current.play().catch(() => undefined)
      }
      setCam('on')
    } catch (e) {
      const err = e as DOMException
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setCam('denied')
        setCamMsg('Permission was refused. Allow camera access for this site in the address bar, then try again.')
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        setCam('missing')
        setCamMsg('No camera was found on this device.')
      } else {
        setCam('unsupported')
        setCamMsg(err.message || 'The camera could not be started.')
      }
    }
  }

  const addCanvas = useCallback(async (canvas: HTMLCanvasElement, name: string) => {
    const id = uid()
    sources.current.set(id, canvas)
    const url = URL.createObjectURL(await canvasToBlob(capCanvas(canvas, THUMB_EDGE), 'image/jpeg', 0.8))
    previews.current.set(id, url)
    setPages((p) => [...p, { id, name, grey: false, contrast: false, preview: url }])
  }, [])

  const capture = async () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return toast('The camera is not ready yet', 'error')
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    await addCanvas(capCanvas(c, MAX_EDGE), `Capture ${pages.length + 1}`)
    toast('Page captured')
  }

  const onFiles = async (list: File[]) => {
    for (const f of list) {
      if (!/^image\//.test(f.type)) {
        toast(`${f.name} is not an image`, 'error')
        continue
      }
      try {
        await addCanvas(await fileToCanvas(f), f.name)
      } catch (e) {
        toast((e as Error).message, 'error')
      }
    }
  }

  const remove = (id: string) => {
    const url = previews.current.get(id)
    if (url) URL.revokeObjectURL(url)
    previews.current.delete(id)
    sources.current.delete(id)
    setPages((p) => p.filter((x) => x.id !== id))
  }
  const move = (i: number, to: number) =>
    setPages((p) => {
      if (to < 0 || to >= p.length) return p
      const n = [...p]
      const [x] = n.splice(i, 1)
      n.splice(to, 0, x)
      return n
    })
  const toggle = (id: string, key: 'grey' | 'contrast') => setPages((p) => p.map((x) => (x.id === id ? { ...x, [key]: !x[key] } : x)))
  const applyAll = (key: 'grey' | 'contrast', on: boolean) => setPages((p) => p.map((x) => ({ ...x, [key]: on })))

  const exportPdf = async () => {
    if (!pages.length) return
    setBusy(true)
    setProgress({ v: 0, msg: 'Building…' })
    try {
      const { PDFDocument, PageSizes } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]
        setProgress({ v: i / pages.length, msg: `Page ${i + 1} of ${pages.length}…` })
        const src = sources.current.get(p.id)
        if (!src) continue
        const canvas = processed(src, p.grey, p.contrast)
        const bytes = await (await canvasToBlob(canvas, 'image/jpeg', 0.85)).arrayBuffer()
        const img = await doc.embedJpg(bytes)
        if (size === 'fit') {
          const page = doc.addPage([img.width, img.height])
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
        } else {
          let [pw, ph] = size === 'A4' ? PageSizes.A4 : PageSizes.Letter
          if (img.width > img.height) [pw, ph] = [ph, pw]
          const page = doc.addPage([pw, ph])
          const m = 18
          const r = Math.min((pw - m * 2) / img.width, (ph - m * 2) / img.height)
          const w = img.width * r
          const h = img.height * r
          page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h })
        }
      }
      setProgress({ v: 1, msg: 'Saving…' })
      const bytes = await doc.save()
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), 'scan.pdf')
      toast(`Saved ${pages.length} page(s)`)
    } catch (e) {
      toast(`Could not build the PDF: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const camBroken = cam === 'denied' || cam === 'missing' || cam === 'insecure' || cam === 'unsupported'

  return (
    <div className="tool-grid">
      <div className="stack">
        <div className="scan-cam">
          <video ref={videoRef} playsInline muted aria-label="Camera preview" style={{ display: cam === 'on' ? 'block' : 'none' }} />
          {cam !== 'on' && (
            <div className="scan-cam-empty">
              {cam === 'starting' ? (
                <p className="muted" style={{ margin: 0 }}>Asking for the camera…</p>
              ) : camBroken ? (
                <>
                  <strong>The camera is not available.</strong>
                  <p className="muted" style={{ margin: '0.4rem 0 0' }}>{camMsg} You can still add photos from your device below.</p>
                </>
              ) : (
                <>
                  <strong>Use your camera as a scanner</strong>
                  <p className="muted" style={{ margin: '0.4rem 0 0' }}>Or skip it entirely and upload photos you already took.</p>
                </>
              )}
            </div>
          )}
        </div>
        <div className="row" style={{ gap: '0.5rem' }}>
          {cam !== 'on' && (
            <button className="btn btn-sm" onClick={startCamera} disabled={cam === 'starting'}>
              {camBroken ? 'Try the camera again' : 'Start camera'}
            </button>
          )}
          {cam === 'on' && (
            <>
              <button className="btn btn-acid" onClick={capture}>
                Capture page
              </button>
              <button className="btn btn-sm btn-ghost" onClick={stopCamera}>
                Stop camera
              </button>
            </>
          )}
        </div>

        <Dropzone accept="image/*" multiple onFiles={onFiles} label="Or drop photos of your pages" hint="JPG, PNG or any photo your browser can open" />

        {pages.length > 0 && (
          <div className="film">
            {pages.map((p, i) => (
              <div className="film-item" key={p.id}>
                <span className="n">{i + 1}</span>
                <img src={p.preview} alt={p.name} style={{ filter: `${p.grey ? 'grayscale(1) ' : ''}${p.contrast ? 'contrast(1.15)' : ''}`.trim() || undefined }} />
                <div className="film-acts">
                  <button disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move ${p.name} earlier`}>
                    ←
                  </button>
                  <button disabled={i === pages.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move ${p.name} later`}>
                    →
                  </button>
                  <button onClick={() => remove(p.id)} aria-label={`Delete ${p.name}`} style={{ color: 'var(--alarm)' }}>
                    ×
                  </button>
                </div>
                <label className="check" style={{ fontSize: '0.75rem' }}>
                  <input type="checkbox" checked={p.grey} onChange={() => toggle(p.id, 'grey')} />
                  Greyscale
                </label>
                <label className="check" style={{ fontSize: '0.75rem' }}>
                  <input type="checkbox" checked={p.contrast} onChange={() => toggle(p.id, 'contrast')} />
                  Auto-contrast
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Document</h4>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>{pages.length} page(s) queued.</p>
        <div>
          <label className="label">Page size</label>
          <Seg<PageSize>
            label="Page size"
            value={size}
            onChange={setSize}
            options={[
              ['A4', 'A4'],
              ['Letter', 'Letter'],
              ['fit', 'Fit image'],
            ]}
          />
        </div>
        <div>
          <label className="label">Apply to every page</label>
          <div className="row" style={{ gap: '0.4rem' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => applyAll('grey', true)}>
              All black & white
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => applyAll('contrast', true)}>
              All sharper contrast
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                applyAll('grey', false)
                applyAll('contrast', false)
              }}
            >
              Reset
            </button>
          </div>
        </div>
        {progress && <ProgressBar value={progress.v} msg={progress.msg} />}
        <button className="btn btn-acid btn-lg btn-block" disabled={!pages.length || busy} onClick={exportPdf}>
          {busy ? 'Building…' : `Save as PDF (${pages.length})`}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          Photos are kept to {MAX_EDGE} pixels on the longest side, which is plenty for a readable page and keeps the
          file small. The small previews only roughly show the black & white and contrast effects; the exact result is
          worked out when you save. Nothing leaves your device, and the camera is switched off the moment you stop it
          or leave the page.
        </p>
      </div>
    </div>
  )
}
