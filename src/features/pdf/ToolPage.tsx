import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toolBySlug, TOOLS } from './toolsMeta'
import { StatusBadge, ToolCard } from './ToolCard'
import { GenericTool } from './GenericTool'
import './tools.css'

const SignTool = lazy(() => import('./custom/SignTool'))
const ReaderTool = lazy(() => import('./custom/ReaderTool'))
const QrTool = lazy(() => import('./custom/QrTool'))
const OcrTool = lazy(() => import('./custom/OcrTool'))
const OrganizeTool = lazy(() => import('./custom/OrganizeTool'))

export default function ToolPage() {
  const { slug = '' } = useParams()
  const tool = toolBySlug(slug)
  const key = slug // remounts the tool UI when the route changes
  useEffect(() => {
    document.title = tool ? `${tool.name} — PrintxPDF` : 'Tool not found — PrintxPDF'
  }, [tool])

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
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
