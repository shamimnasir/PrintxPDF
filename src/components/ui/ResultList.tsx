import { downloadBlob, formatBytes } from '../../lib/download'

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

export function ResultList({ outputs, title = 'Ready' }: { outputs: Output[]; title?: string }) {
  if (!outputs.length) return null
  const pdf = outputs.length === 1 && /\.pdf$/i.test(outputs[0].name) ? outputs[0] : null
  return (
    <div className="card">
      <div className="row between" style={{ marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        {outputs.length > 1 && (
          <button className="btn btn-sm btn-acid" onClick={() => outputs.forEach((r, i) => setTimeout(() => downloadBlob(r.blob, r.name), i * 250))}>
            Download all ({outputs.length})
          </button>
        )}
      </div>
      <div className="results">
        {outputs.map((r) => (
          <div className="result-row" key={r.name}>
            <span className="name">{r.name}</span>
            <span className="mono" style={{ fontSize: '0.75rem' }}>
              {formatBytes(r.blob.size)}
            </span>
            <button className="btn btn-sm" onClick={() => downloadBlob(r.blob, r.name)}>
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
    </div>
  )
}
