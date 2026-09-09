import { Link } from 'react-router-dom'
import { STATUS_LABEL, type ToolMeta } from './toolsMeta'

export function StatusBadge({ status }: { status: ToolMeta['status'] }) {
  const cls = status === 'real' ? 'badge-acid' : status === 'best-effort' ? 'badge-sky' : 'badge-alarm'
  return <span className={`badge ${cls}`}>{STATUS_LABEL[status]}</span>
}

export function ToolCard({ tool, showStatus = false }: { tool: ToolMeta; showStatus?: boolean }) {
  return (
    <Link to={`/tools/${tool.slug}`} className="card card-hover tool-card">
      <div className="tool-icon" aria-hidden>
        {tool.icon}
      </div>
      <div>
        <h4>{tool.name}</h4>
        <p className="muted" style={showStatus ? { marginBottom: '0.5rem' } : undefined}>
          {tool.short}
        </p>
        {showStatus && <StatusBadge status={tool.status} />}
      </div>
    </Link>
  )
}
