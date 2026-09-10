import { useState } from 'react'
import { Dropzone, FileList } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { ProgressBar, ResultList } from '../../../components/ui/ResultList'
import type { Output } from '../engines'
import { useUser } from '../../account/useUser'

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
  const user = useUser()
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
    setProgress({ f: 0, msg: 'Loading the language pack (about 10 MB the first time)…' })
    try {
      const { ocr } = await import('../engines')
      const r = await ocr(files[0], lang, (f, msg) => setProgress({ f, msg }), user && user.plan !== 'free' ? 200 : 30)
      setText(r.text)
      setOutputs(r.outputs)
      toast(r.note ? `Text recognised. ${r.note}` : 'Text recognised')
    } catch (e) {
      toast(`Could not read the text: ${(e as Error).message}`, 'error')
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
        {progress && <ProgressBar value={progress.f} msg={progress.msg} />}
        {text && (
          <div className="card">
            <div className="row between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>Text found in your file</h4>
              <button className="btn btn-sm" onClick={() => navigator.clipboard.writeText(text).then(() => toast('Copied'))}>
                Copy
              </button>
            </div>
            <textarea className="textarea" style={{ minHeight: 280 }} value={text} readOnly />
            <div style={{ marginTop: '1rem' }}>
              <ResultList outputs={outputs} title="Downloads" />
            </div>
          </div>
        )}
      </div>
      <div className="card stack">
        <h4 style={{ margin: 0 }}>Options</h4>
        <div>
          <label className="label">Language of the text</label>
          <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-acid btn-lg btn-block" disabled={!files.length || busy} onClick={run}>
          {busy ? 'Reading the text…' : 'Run OCR'}
        </button>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          OCR (turning a picture of text into real, searchable text) runs in your browser, so nothing is uploaded. Each language pack downloads once and is kept for next time. Free plan: up to 30 pages per PDF. Pro: up to 200. You get a plain text file plus a copy of your PDF that you can search, with the text laid invisibly over the scan.
        </p>
      </div>
    </div>
  )
}
