import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toolBySlug, STATUS_LABEL, TOOLS, type ToolMeta } from './toolsMeta'
import { GenericTool } from './GenericTool'
import './tools.css'

const SignTool = lazy(() => import('./custom/SignTool'))
const ReaderTool = lazy(() => import('./custom/ReaderTool'))
const QrTool = lazy(() => import('./custom/QrTool'))
const OcrTool = lazy(() => import('./custom/OcrTool'))
const OrganizeTool = lazy(() => import('./custom/OrganizeTool'))

export function StatusBadge({ status }: { status: ToolMeta['status'] }) {
  const cls = status === 'real' ? 'badge-acid' : status === 'best-effort' ? 'badge-sky' : 'badge-alarm'
  return <span className={`badge ${cls}`}>{STATUS_LABEL[status]}</span>
}

export default function ToolPage() {
  const { slug = '' } = useParams()
  const tool = toolBySlug(slug)
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((k) => k + 1)
    document.title = tool ? `${tool.name} — PrintxPDF` : 'Tool not found — PrintxPDF'
  }, [slug, tool])

  if (!tool) {
    return (
      <div className="container section">
        <h1>No such tool</h1>
        <Link className="btn btn-acid" to="/tools">
          See all tools
        </Link>
      </div>
    )
  }

  const related = TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4)

  return (
    <div className="container">
      <div className="tool-head">
        <div className="tool-icon">{tool.icon}</div>
        <div className="row" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
          <StatusBadge status={tool.status} />
          <span className="badge">No upload · runs locally</span>
        </div>
        <h1>{tool.name}</h1>
        <p className="lead">{tool.description}</p>
      </div>

      <Suspense fallback={<div className="badge badge-ink">Loading tool…</div>}>
        {tool.custom === 'sign' && <SignTool key={key} />}
        {tool.custom === 'reader' && <ReaderTool key={key} />}
        {tool.custom === 'qr' && <QrTool key={key} />}
        {tool.custom === 'ocr' && <OcrTool key={key} />}
        {tool.custom === 'organize' && <OrganizeTool key={key} />}
        {!tool.custom && <GenericTool key={key} tool={tool} />}
      </Suspense>

      {related.length > 0 && (
        <div className="section-tight" style={{ marginTop: '3rem' }}>
          <span className="eyebrow">Related tools</span>
          <div className="grid grid-4">
            {related.map((t) => (
              <Link key={t.slug} to={`/tools/${t.slug}`} className="card card-hover tool-card">
                <div className="tool-icon">{t.icon}</div>
                <div>
                  <h4>{t.name}</h4>
                  <p className="muted">{t.short}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
