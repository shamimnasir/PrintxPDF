import { useState } from 'react'
import { browserGenerationStatus, canDownloadGeneratedFiles, downloadBlob, downloadGeneratedFiles, downloadGeneratedZip, formatBytes } from '../../lib/download'
import { zipBlobs } from '../../lib/zip'

export type Output = { name: string; blob: Blob; note?: string }

export function ProgressBar({ value, msg }: { value: number; msg?: string }) {
  return (
    <div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)}>
        <div style={{ width: `${Math.max(4, value * 100)}%` }} />
      </div>
      {msg && (
        <div className="mono muted" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
          {msg}
        </div>
      )}
    </div>
  )
}

export function ResultList({ outputs, title = 'Ready', zipName = 'printxpdf-files.zip', toolKey }: { outputs: Output[]; title?: string; zipName?: string; toolKey?: string }) {
  const [zipping, setZipping] = useState(false)
  if (!outputs.length) return null
  const pdf = outputs.length === 1 && /\.pdf$/i.test(outputs[0].name) ? outputs[0] : null

  const downloadZip = async () => {
    if (toolKey && !canDownloadGeneratedFiles(toolKey, outputs.length)) return
    setZipping(true)
    try {
      const blob = await zipBlobs(outputs)
      if (toolKey) downloadGeneratedZip(blob, zipName, toolKey, outputs.length)
      else downloadBlob(blob, zipName)
    } finally {
      setZipping(false)
    }
  }
  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        {outputs.length > 1 && (
          <div className="row" style={{ gap: '0.4rem' }}>
            <button className="btn btn-sm btn-acid" disabled={zipping} onClick={downloadZip}>
              {zipping ? 'Zipping…' : `Download ZIP (${outputs.length})`}
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => {
              if (toolKey) downloadGeneratedFiles(outputs, toolKey)
              else outputs.forEach((r, i) => setTimeout(() => downloadBlob(r.blob, r.name), i * 250))
            }}>
              Separately
            </button>
          </div>
        )}
      </div>
      <div className="results">
        {outputs.map((r) => (
          <div className="result-row" key={r.name}>
            <span className="name">{r.name}</span>
            <span className="mono" style={{ fontSize: '0.75rem' }}>
              {formatBytes(r.blob.size)}
            </span>
            <button className="btn btn-sm" onClick={() => { if (toolKey) downloadGeneratedFiles([r], toolKey); else downloadBlob(r.blob, r.name) }}>
              Download
            </button>
          </div>
        ))}
      </div>
      {outputs[0].note && (
        <p className="muted" style={{ margin: '0.75rem 0 0', fontSize: '0.85rem' }}>
          {outputs[0].note}
        </p>
      )}
      {pdf && (
        <button className="btn btn-sm btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => window.open(URL.createObjectURL(pdf.blob), '_blank')}>
          Open in a new tab
        </button>
      )}
      {toolKey && (() => { const q = browserGenerationStatus(toolKey); return <p className="mono muted" style={{ fontSize: '0.7rem', margin: '0.75rem 0 0' }}>{q.paid ? 'Pro plan · unlimited browser generations.' : `${q.remaining} of 10 free file downloads left for this tool on this device.`}</p> })()}
    </div>
  )
}
