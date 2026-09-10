import { useEffect, useRef, useState } from 'react'
import { Dropzone, FileList } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar, ResultList, type Output } from '../../components/ui/ResultList'
import { formatBytes } from '../../lib/download'
import { FORMAT_LABEL, compressImage, formatDelta, formatOf, isHeic, isImageFile, outName, supportsWebpEncode, type CompressResult } from './engines'
import './files.css'

type Target = 'keep' | 'jpg' | 'webp'
const PRESETS = [1920, 1280, 800] as const

type Preview = { before: string; after: string; result: CompressResult }

export default function CompressImageTool() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState(0.8)
  const [limit, setLimit] = useState(false)
  const [max, setMax] = useState<number>(1920)
  const [target, setTarget] = useState<Target>('keep')
  const [webp, setWebp] = useState<boolean | null>(null)
  const [selected, setSelected] = useState(0)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [previewErr, setPreviewErr] = useState<string | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ f: number; msg?: string } | null>(null)
  const [outputs, setOutputs] = useState<Output[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const urls = useRef<string[]>([])

  useEffect(() => {
    supportsWebpEncode().then((ok) => {
      setWebp(ok)
      if (!ok) setTarget((t) => (t === 'webp' ? 'keep' : t))
    })
  }, [])

  const releaseUrls = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u))
    urls.current = []
  }
  useEffect(() => releaseUrls, [])

  const effectiveMax = limit ? max : null

  // live preview of the selected file, debounced so the slider stays smooth
  useEffect(() => {
    const f = files[selected]
    if (!f) return
    let cancelled = false
    const t = setTimeout(async () => {
      setPreviewing(true)
      setPreviewErr(null)
      try {
        const result = await compressImage(f, { quality, max: effectiveMax, target })
        if (cancelled) return
        releaseUrls()
        // HEIC cannot be shown by <img>; show the re-encoded version on both sides in that case
        const before = URL.createObjectURL(isHeic(f) ? result.blob : f)
        const after = URL.createObjectURL(result.blob)
        urls.current.push(before, after)
        setPreview({ before, after, result })
      } catch (e) {
        if (!cancelled) {
          setPreview(null)
          setPreviewErr((e as Error).message)
        }
      } finally {
        if (!cancelled) setPreviewing(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [files, selected, quality, effectiveMax, target])

  const addFiles = (incoming: File[]) => {
    const ok = incoming.filter(isImageFile)
    const skipped = incoming.length - ok.length
    if (skipped) toast(`Skipped ${skipped} file${skipped > 1 ? 's' : ''} that ${skipped > 1 ? 'are' : 'is'} not an image`, 'error')
    if (ok.length) {
      setOutputs([])
      setNotes([])
      setFiles((f) => [...f, ...ok])
    }
  }

  const run = async () => {
    if (!files.length || busy) return
    setBusy(true)
    setOutputs([])
    const outs: Output[] = []
    const ns: string[] = []
    let saved = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        setProgress({ f: i / files.length, msg: `Compressing ${f.name}…` })
        try {
          const r = await compressImage(f, { quality, max: effectiveMax, target })
          const name = r.kept ? f.name : outName(f.name, r.format)
          outs.push({ name, blob: r.blob })
          saved += f.size - r.blob.size
          if (r.note) ns.push(`${f.name}: ${r.note}`)
        } catch (e) {
          ns.push(`${f.name}: ${(e as Error).message}`)
        }
      }
      setOutputs(outs)
      setNotes(ns)
      if (outs.length) toast(saved > 0 ? `Saved ${formatBytes(saved)} across ${outs.length} file${outs.length > 1 ? 's' : ''}` : 'Nothing got smaller; originals kept')
      else toast(ns[0] ?? 'None of the pictures could be made smaller', 'error')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const sel = files[selected]
  const selFmt = sel ? formatOf(sel) : null
  const pngWithoutKnob = selFmt === 'png' && target === 'keep' && !limit
  const res = preview?.result

  return (
    <div className="tool-grid">
      <div className="stack">
        <Dropzone accept="image/*" multiple onFiles={addFiles} label="Drop images here" hint="PNG, JPG, WebP (HEIC too)" />
        <FileList
          files={files}
          onRemove={(i) => {
            setOutputs([])
            setFiles((f) => f.filter((_, j) => j !== i))
            setSelected((s) => Math.max(0, Math.min(s, files.length - 2)))
          }}
        />
        {files.length > 1 && (
          <div className="fx-field">
            <label className="label" htmlFor="ci-sel">
              Preview file
            </label>
            <select id="ci-sel" className="select" value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
              {files.map((f, i) => (
                <option key={`${f.name}-${i}`} value={i}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {sel && (
          <div className="stack">
            {previewErr && <div className="fx-notice">Could not preview {sel.name}: {previewErr}</div>}
            {res && (
              <div className={`fx-delta-big ${res.kept ? 'is-flat' : ''}`} aria-live="polite">
                {previewing ? 'Updating…' : res.kept ? `Kept original: ${formatBytes(sel.size)}` : formatDelta(sel.size, res.blob.size)}
              </div>
            )}
            {res?.note && <div className="fx-notice">{res.note}</div>}
            {preview && (
              <div className="fx-compare">
                <div className="fx-pane">
                  <img className="fx-img" src={preview.before} alt={`Original ${sel.name}`} />
                  <div className="fx-caption">
                    <span>Before</span>
                    <span className="mono">{formatBytes(sel.size)}</span>
                  </div>
                </div>
                <div className="fx-pane">
                  <img className="fx-img" src={preview.after} alt={`Compressed ${sel.name}`} />
                  <div className="fx-caption">
                    <span>
                      After · {FORMAT_LABEL[preview.result.format]} {preview.result.width}×{preview.result.height}
                    </span>
                    <span className="mono">{formatBytes(preview.result.blob.size)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {progress && <ProgressBar value={progress.f} msg={progress.msg} />}
        {notes.length > 0 && (
          <div className="fx-notice">
            {notes.map((n, i) => (
              <div key={i}>{n}</div>
            ))}
          </div>
        )}
        <ResultList outputs={outputs} title="Compressed" zipName="printxpdf-compressed.zip" />
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Options</h4>
        <div className="fx-field">
          <label className="label" htmlFor="ci-q">
            Quality: {Math.round(quality * 100)}
          </label>
          <input id="ci-q" type="range" min={30} max={100} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} />
        </div>
        <div className="fx-field">
          <label className="fx-check">
            <input type="checkbox" checked={limit} onChange={(e) => setLimit(e.target.checked)} />
            Also shrink the picture (longest side, in pixels)
          </label>
          {limit && (
            <div className="fx-inline">
              <div className="fx-seg" style={{ flex: 1 }} role="group" aria-label="Maximum size presets">
                {PRESETS.map((p) => (
                  <button key={p} type="button" aria-pressed={max === p} onClick={() => setMax(p)}>
                    {p}
                  </button>
                ))}
              </div>
              <input
                className="input"
                style={{ width: 100 }}
                type="number"
                min={16}
                max={16384}
                value={max}
                onChange={(e) => setMax(Math.max(16, Number(e.target.value) || 16))}
                aria-label="Maximum width or height in pixels"
              />
            </div>
          )}
        </div>
        <div className="fx-field">
          <label className="label">Save as</label>
          <div className="fx-seg" role="group" aria-label="Save as">
            <button type="button" aria-pressed={target === 'keep'} onClick={() => setTarget('keep')}>
              Same as original
            </button>
            <button type="button" aria-pressed={target === 'jpg'} onClick={() => setTarget('jpg')}>
              JPG
            </button>
            {webp !== false && (
              <button type="button" aria-pressed={target === 'webp'} onClick={() => setTarget('webp')}>
                WebP
              </button>
            )}
          </div>
          {pngWithoutKnob && (
            <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
              PNG pictures have no quality setting in the browser. Turn on the size limit, or save as JPG{webp ? ' or WebP' : ''}, to make them smaller.
            </p>
          )}
        </div>
        <button className="btn btn-acid btn-lg btn-block" disabled={!files.length || busy} onClick={run}>
          {busy ? 'Compressing…' : `Compress ${files.length > 1 ? `${files.length} images` : 'image'}`}
        </button>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          Never makes a file bigger: if the new version comes out larger, you get the original back with a note. Photos from your phone stay the right way up. Nothing is uploaded.
        </p>
      </div>
    </div>
  )
}
