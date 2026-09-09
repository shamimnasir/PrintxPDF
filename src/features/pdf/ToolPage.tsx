import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTool, useVisibleTools } from './useTools'
import { postsForTool } from '../../content'
import { breadcrumbSchema, softwareSchema, useSeo } from '../../lib/seo'
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
  const tool = useTool(slug)
  const key = slug // remounts the tool UI when the route changes
  const allTools = useVisibleTools()
  const guides = postsForTool(slug).slice(0, 4)

  useSeo({
    title: tool ? `${tool.name} — Free, In Your Browser` : 'Tool not found',
    description: tool ? `${tool.description} No upload, no sign-up: it runs entirely in your browser.`.slice(0, 158) : '',
    path: `/tools/${slug}`,
    keywords: tool ? [tool.name.toLowerCase(), `${tool.name.toLowerCase()} free`, `${tool.name.toLowerCase()} online`, 'no upload'] : [],
    noindex: !tool,
    schema: tool
      ? [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: tool.name, path: `/tools/${tool.slug}` },
          ]),
          softwareSchema({ name: tool.name, description: tool.description, path: `/tools/${tool.slug}` }),
        ]
      : [],
  })

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

  const related = allTools.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 4)

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

      {guides.length > 0 && (
        <div className="section-tight" style={{ marginTop: '3rem' }}>
          <span className="eyebrow">Guides that use this tool</span>
          <div className="grid grid-2">
            {guides.map((g) => (
              <Link key={g.slug} to={`/blog/${g.cluster}/${g.slug}`} className="card card-hover" style={{ textDecoration: 'none' }}>
                <h4 style={{ fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: '-0.01em', fontWeight: 800, marginBottom: '0.3rem' }}>{g.title}</h4>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>{g.metaDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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
