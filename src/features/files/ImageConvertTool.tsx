import { useEffect, useRef, useState } from 'react'
import { Dropzone, FileList } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar, ResultList, type Output } from '../../components/ui/ResultList'
import { downloadBlob, formatBytes } from '../../lib/download'
import { FORMAT_LABEL, convertImage, formatDelta, isHeic, isImageFile, isSvg, outName, supportsWebpEncode, type OutFormat } from './engines'
import './files.css'

type Done = { name: string; before: number; after: number; url: string; width: number; height: number; error?: string }

const SVG_SCALES = [1, 2, 3] as const

export default function ImageConvertTool() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState<OutFormat>('jpg')
  const [quality, setQuality] = useState(0.9)
  const [svgScale, setSvgScale] = useState<number>(2)
  const [svgWidth, setSvgWidth] = useState('')
  const [svgWhite, setSvgWhite] = useState(false)
  const [webp, setWebp] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ f: number; msg?: string } | null>(null)
  const [done, setDone] = useState<Done[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  const urls = useRef<string[]>([])

  useEffect(() => {
    supportsWebpEncode().then((ok) => {
      setWebp(ok)
      if (!ok) setFormat((f) => (f === 'webp' ? 'jpg' : f))
    })
  }, [])
  useEffect(() => {
    const list = urls.current
    return () => list.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  const reset = () => {
    urls.current.forEach((u) => URL.revokeObjectURL(u))
    urls.current = []
    setDone([])
    setOutputs([])
  }

  const addFiles = (incoming: File[]) => {
    const ok = incoming.filter(isImageFile)
    const skipped = incoming.length - ok.length
    if (skipped) toast(`Skipped ${skipped} file${skipped > 1 ? 's' : ''} that ${skipped > 1 ? 'are' : 'is'} not an image`, 'error')
    if (ok.length) {
      reset()
      setFiles((f) => [...f, ...ok])
    }
  }

  const hasSvg = files.some(isSvg)
  const hasHeic = files.some(isHeic)

  const run = async () => {
    if (!files.length || busy) return
    setBusy(true)
    reset()
    const results: Done[] = []
    const outs: Output[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        setProgress({ f: i / files.length, msg: isHeic(f) && i === 0 ? `Loading the HEIC decoder, then ${f.name}…` : `Converting ${f.name}…` })
        try {
          const r = await convertImage(f, {
            format,
            quality,
            whiteBackground: svgWhite,
            svg: svgWidth.trim() ? { width: Number(svgWidth) } : { scale: svgScale },
          })
          const name = outName(f.name, format)
          const url = URL.createObjectURL(r.blob)
          urls.current.push(url)
          results.push({ name, before: f.size, after: r.blob.size, url, width: r.width, height: r.height })
          outs.push({ name, blob: r.blob })
        } catch (e) {
          results.push({ name: f.name, before: f.size, after: 0, url: '', width: 0, height: 0, error: (e as Error).message })
        }
        setDone([...results])
      }
      setOutputs(outs)
      const failed = results.filter((r) => r.error).length
      if (outs.length === 1 && files.length === 1) {
        downloadBlob(outs[0].blob, outs[0].name)
        toast(`Converted to ${FORMAT_LABEL[format]}. Download started.`)
      } else if (outs.length) {
        toast(`Converted ${outs.length} of ${files.length} image${files.length > 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}`, failed ? 'error' : 'ok')
      } else {
        toast(results[0]?.error ?? 'Nothing could be converted', 'error')
      }
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="tool-grid">
      <div className="stack">
        <Dropzone accept="image/*,.heic,.heif,.svg" multiple onFiles={addFiles} label="Drop images here" hint="HEIC, PNG, JPG, WebP, GIF, BMP, SVG" />
        <FileList
          files={files}
          onRemove={(i) => {
            reset()
            setFiles((f) => f.filter((_, j) => j !== i))
          }}
        />
        {progress && <ProgressBar value={progress.f} msg={progress.msg} />}
        {done.length > 0 && (
          <div className="card stack">
            <h4 style={{ margin: 0 }}>Preview</h4>
            <div className="fx-thumbs">
              {done.map((d, i) => (
                <div className={`fx-thumb ${d.error ? 'is-error' : ''}`} key={`${d.name}-${i}`}>
                  {d.url ? <img className="fx-img" src={d.url} alt={d.name} loading="lazy" /> : <div className="fx-img" aria-hidden="true" />}
                  <div className="fx-name" title={d.name}>
                    {d.name}
                  </div>
                  <div className="fx-delta">
                    {d.error ? d.error : `${d.width}×${d.height} · ${formatDelta(d.before, d.after)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <ResultList outputs={outputs} title="Converted" zipName={`printxpdf-images-${format}.zip`} />
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Options</h4>
        <div className="fx-field">
          <label className="label">Convert to</label>
          <div className="fx-seg" role="group" aria-label="Output format">
            {(['jpg', 'png', 'webp'] as OutFormat[])
              .filter((f) => f !== 'webp' || webp !== false)
              .map((f) => (
                <button key={f} type="button" aria-pressed={format === f} onClick={() => setFormat(f)}>
                  {FORMAT_LABEL[f]}
                </button>
              ))}
          </div>
          {webp === false && (
            <p className="muted" style={{ fontSize: '0.75rem', margin: 0 }}>
              This browser cannot encode WebP, so that option is hidden.
            </p>
          )}
        </div>
        {format !== 'png' && (
          <div className="fx-field">
            <label className="label" htmlFor="ic-q">
              Quality: {Math.round(quality * 100)}
            </label>
            <input id="ic-q" type="range" min={40} max={100} value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} />
          </div>
        )}
        {hasSvg && (
          <>
            <div className="fx-field">
              <label className="label">SVG size</label>
              <div className="fx-inline">
                <div className="fx-seg" style={{ flex: 1 }} role="group" aria-label="SVG scale">
                  {SVG_SCALES.map((s) => (
                    <button key={s} type="button" aria-pressed={!svgWidth && svgScale === s} onClick={() => {
                      setSvgWidth('')
                      setSvgScale(s)
                    }}>
                      {s}×
                    </button>
                  ))}
                </div>
                <input
                  className="input"
                  style={{ width: 110 }}
                  type="number"
                  min={1}
                  max={16384}
                  placeholder="width px"
                  value={svgWidth}
                  onChange={(e) => setSvgWidth(e.target.value)}
                  aria-label="Explicit SVG width in pixels"
                />
              </div>
            </div>
            {format !== 'jpg' && (
              <label className="fx-check">
                <input type="checkbox" checked={svgWhite} onChange={(e) => setSvgWhite(e.target.checked)} />
                White background (instead of transparent)
              </label>
            )}
          </>
        )}
        <button className="btn btn-acid btn-lg btn-block" disabled={!files.length || busy} onClick={run}>
          {busy ? 'Converting…' : `Convert ${files.length || ''} to ${FORMAT_LABEL[format]}`}
        </button>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          Runs entirely in your browser; nothing is uploaded. {hasHeic ? 'HEIC photos are decoded with libheif (LGPL) compiled to WebAssembly, loaded on first use (~2 MB). ' : ''}
          Photo orientation from your phone is preserved. {format === 'jpg' ? 'JPG has no transparency; transparent areas become white.' : ''}
          {files.length ? ` Total input: ${formatBytes(files.reduce((n, f) => n + f.size, 0))}.` : ''}
        </p>
      </div>
    </div>
  )
}
