import { useEffect, useRef, useState } from 'react'
import { Dropzone, FileList } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/toastContext'
import { ProgressBar, ResultList, type Output } from '../../components/ui/ResultList'
import { canGenerateBrowserFiles, formatBytes } from '../../lib/download'
import { FORMAT_LABEL, formatDelta, formatOf, isImageFile, outName, removeImageMetadata, supportsWebpEncode, type OutFormat } from './engines'
import './files.css'

type Done = { name: string; before: number; after: number; width: number; height: number; error?: string }

export default function RemoveImageMetadataTool() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState<OutFormat>('png')
  const [webp, setWebp] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ f: number; msg?: string } | null>(null)
  const [done, setDone] = useState<Done[]>([])
  const [outputs, setOutputs] = useState<Output[]>([])
  const initialized = useRef(false)

  useEffect(() => { supportsWebpEncode().then(setWebp) }, [])
  useEffect(() => {
    if (initialized.current || !files.length) return
    const source = formatOf(files[0])
    if (source) setFormat(source)
    initialized.current = true
  }, [files])

  const addFiles = (incoming: File[]) => {
    const ok = incoming.filter(isImageFile)
    if (incoming.length > ok.length) toast('Skipped files that are not supported images', 'error')
    if (ok.length) {
      setDone([]); setOutputs([])
      setFiles((current) => [...current, ...ok])
    }
  }

  const run = async () => {
    if (!files.length || busy) return
    if (!canGenerateBrowserFiles('remove-image-metadata', files.length)) return
    setBusy(true); setDone([]); setOutputs([])
    const results: Done[] = []
    const outs: Output[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setProgress({ f: i / files.length, msg: `Creating a clean copy of ${file.name}…` })
        try {
          const result = await removeImageMetadata(file, format)
          const name = outName(file.name, format)
          results.push({ name, before: file.size, after: result.blob.size, width: result.width, height: result.height })
          outs.push({ name, blob: result.blob })
        } catch (error) {
          results.push({ name: file.name, before: file.size, after: 0, width: 0, height: 0, error: (error as Error).message })
        }
        setDone([...results])
      }
      setOutputs(outs)
      if (outs.length) toast(`Made ${outs.length} clean image ${outs.length === 1 ? 'copy' : 'copies'}.`)
      else toast(results[0]?.error || 'No image could be processed', 'error')
    } finally { setBusy(false); setProgress(null) }
  }

  return <div className="tool-grid">
    <div className="stack">
      <Dropzone accept="image/*,.heic,.heif" multiple onFiles={addFiles} label="Drop images here" hint="PNG, JPG, WebP, HEIC and other browser-readable images" />
      <FileList files={files} onRemove={(i) => { setDone([]); setOutputs([]); setFiles((current) => current.filter((_, j) => j !== i)) }} />
      {progress && <ProgressBar value={progress.f} msg={progress.msg} />}
      {done.length > 0 && <div className="card stack"><h4 style={{ margin: 0 }}>Clean copies</h4>{done.map((item) => <div className="row" key={item.name} style={{ justifyContent: 'space-between', gap: '1rem' }}><span>{item.name}</span><span className="muted">{item.error || `${item.width}×${item.height} · ${formatDelta(item.before, item.after)}`}</span></div>)}</div>}
      <ResultList outputs={outputs} title="Metadata-free images" zipName="printxpdf-clean-images.zip" toolKey="remove-image-metadata" />
    </div>
    <div className="card stack conversion-settings">
      <div className="conversion-panel-head"><span className="conversion-step" aria-hidden="true">2</span><div><h4>Make a clean copy</h4><p>The output is rebuilt from visible pixels, not edited in place.</p></div></div>
      <div className="fx-field"><label className="label">Save as</label><div className="fx-seg" role="group" aria-label="Output format">{(['png', 'jpg', 'webp'] as OutFormat[]).filter((item) => item !== 'webp' || webp !== false).map((item) => <button key={item} type="button" aria-pressed={format === item} onClick={() => setFormat(item)}>{FORMAT_LABEL[item]}</button>)}</div></div>
      <div className="fx-notice"><strong>What is removed:</strong> EXIF camera, GPS and date fields; IPTC and XMP descriptions; and embedded provenance records such as C2PA / Content Credentials that are stored as metadata. <strong>What stays:</strong> the visible image. PNG and WebP preserve transparency; JPG puts transparent areas on white.</div>
      <div className="fx-notice">This cannot remove watermarks, labels, text, or other marks visible in the pixels. A new file is made locally in your browser; nothing is uploaded.</div>
      <button className="btn btn-acid btn-lg btn-block" disabled={!files.length || busy} onClick={run}>{busy ? 'Removing metadata…' : `Remove metadata from ${files.length || ''} image${files.length === 1 ? '' : 's'}`}</button>
      {files.length > 0 && <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>Total size added: {formatBytes(files.reduce((total, file) => total + file.size, 0))}.</p>}
    </div>
  </div>
}
