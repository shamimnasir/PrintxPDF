import { useState } from 'react'
import { Dropzone, FileList } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob, formatBytes } from '../../../lib/download'
import { ocr, type Output } from '../engines'

const LANGS: [string, string][] = [
  ['eng', 'English'],
  ['ben', 'Bengali'],
  ['hin', 'Hindi'],
  ['ara', 'Arabic'],
  ['spa', 'Spanish'],
  ['fra', 'French'],
  ['deu', 'German'],
  ['por', 'Portuguese'],
  ['rus', 'Russian'],
  ['jpn', 'Japanese'],
  ['chi_sim', 'Chinese (simplified)'],
  ['kor', 'Korean'],
]

export default function OcrTool() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [lang, setLang] = useState('eng')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ f: number; msg?: string } | null>(null)
  const [text, setText] = useState('')
  const [outputs, setOutputs] = useState<Output[]>([])

  const run = async () => {
    if (!files[0]) return
    setBusy(true)
    setText('')
    setOutputs([])
    setProgress({ f: 0, msg: 'Loading language data (first run downloads ~10 MB)…' })
    try {
      const r = await ocr(files[0], lang, (f, msg) => setProgress({ f, msg }))
      setText(r.text)
      setOutputs(r.outputs)
      toast('OCR complete')
    } catch (e) {
      toast(`OCR failed: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  return (
    <div className="tool-grid">
      <div className="stack">
        <Dropzone accept=".pdf,.png,.jpg,.jpeg" multiple={false} onFiles={(f) => setFiles(f)} label="Drop a scan or photo" />
        <FileList files={files} onRemove={() => setFiles([])} />
        {progress && (
          <div>
            <div className="progress">
              <div style={{ width: `${Math.max(4, progress.f * 100)}%` }} />
            </div>
            <div className="mono muted" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>{progress.msg}</div>
          </div>
        )}
        {text && (
          <div className="card">
            <div className="row between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>Recognized text</h4>
              <button className="btn btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => toast('Copied'))}>
                Copy
              </button>
            </div>
            <textarea className="textarea" style={{ minHeight: 280 }} value={text} readOnly />
            <div className="results" style={{ marginTop: '1rem' }}>
              {outputs.map((o) => (
                <div className="result-row" key={o.name}>
                  <span className="name">{o.name}</span>
                  <span className="mono" style={{ fontSize: '0.75rem' }}>
                    {formatBytes(o.blob.size)}
                  </span>
                  <button className="btn btn-sm" onClick={() => downloadBlob(o.blob, o.name)}>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="card stack">
        <h4 style={{ margin: 0 }}>Options</h4>
        <div>
          <label className="label">Language</label>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-acid btn-lg btn-block" disabled={!files.length || busy} onClick={run}>
          {busy ? 'Recognizing…' : 'Run OCR'}
        </button>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          Powered by Tesseract compiled to WebAssembly. Language packs download once and are cached. PDFs are capped at
          30 pages in the browser. Output: a .txt and a searchable PDF with an invisible text layer.
        </p>
      </div>
    </div>
  )
}
