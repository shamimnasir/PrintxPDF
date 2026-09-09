import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTool, useVisibleTools } from './useTools'
import { postsForTool } from '../../content'
import { breadcrumbSchema, faqSchema, howToSchema, softwareSchema, useSeo } from '../../lib/seo'
import { isFilled, toolContent } from '../../content/tools'
import { ToolContentSections, stepAnchor } from './ToolContent'
import { StatusBadge, ToolCard } from './ToolCard'
import { GenericTool } from './GenericTool'
import './tools.css'

const SignTool = lazy(() => import('./custom/SignTool'))
const ReaderTool = lazy(() => import('./custom/ReaderTool'))
const QrTool = lazy(() => import('./custom/QrTool'))
const OcrTool = lazy(() => import('./custom/OcrTool'))
const OrganizeTool = lazy(() => import('./custom/OrganizeTool'))
const EditTool = lazy(() => import('./custom/EditTool'))
const FormsTool = lazy(() => import('./custom/FormsTool'))
const RedactTool = lazy(() => import('./custom/RedactTool'))
const CompareTool = lazy(() => import('./custom/CompareTool'))
const ScanTool = lazy(() => import('./custom/ScanTool'))
// file and image tools live outside the PDF feature so their decoders never load with it
const ImageConvertTool = lazy(() => import('../files/ImageConvertTool'))
const CompressImageTool = lazy(() => import('../files/CompressImageTool'))
const ZipTool = lazy(() => import('../files/ZipTool'))
const UnzipTool = lazy(() => import('../files/UnzipTool'))

export default function ToolPage() {
  const { slug = '' } = useParams()
  const tool = useTool(slug)
  const key = slug // remounts the tool UI when the route changes
  const allTools = useVisibleTools()
  const guides = postsForTool(slug).slice(0, 4)
  const content = toolContent(slug)
  const c = isFilled(content) ? content : undefined

  useSeo({
    title: tool ? c?.metaTitle || `${tool.name} | ${tool.status === 'server' ? 'Free Online Converter' : 'Free, In Your Browser'}` : 'Tool not found',
    description: tool ? c?.metaDescription || `${tool.description} ${tool.status === 'server' ? 'Free for 5 files a month, no sign-up.' : 'No upload, no sign-up: it runs entirely in your browser.'}`.slice(0, 158) : '',
    path: `/tools/${slug}`,
    keywords: tool ? [...(c?.keywords || []), tool.name.toLowerCase(), `${tool.name.toLowerCase()} free`, `${tool.name.toLowerCase()} online`] : [],
    noindex: !tool,
    schema: tool
      ? [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: tool.name, path: `/tools/${tool.slug}` },
          ]),
          softwareSchema({ name: tool.name, description: c?.metaDescription || tool.description, path: `/tools/${tool.slug}` }),
          ...(c ? [faqSchema(c.faqs), howToSchema({ title: c.howHeading || `How to use ${tool.name}`, description: c.answer, steps: c.how, path: `/tools/${tool.slug}`, anchors: c.how.map((_, i) => stepAnchor(i + 1)) })] : []),
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
          <span className="badge">{tool.status === 'server' ? 'Uploaded · converted · deleted' : 'No upload · runs locally'}</span>
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
        {tool.custom === 'edit' && <EditTool key={key} />}
        {tool.custom === 'forms' && <FormsTool key={key} />}
        {tool.custom === 'redact' && <RedactTool key={key} />}
        {tool.custom === 'compare' && <CompareTool key={key} />}
        {tool.custom === 'scan' && <ScanTool key={key} />}
        {tool.custom === 'image' && <ImageConvertTool key={key} />}
        {tool.custom === 'compress-image' && <CompressImageTool key={key} />}
        {tool.custom === 'zip' && <ZipTool key={key} />}
        {tool.custom === 'unzip' && <UnzipTool key={key} />}
        {!tool.custom && <GenericTool key={key} tool={tool} />}
      </Suspense>

      {c && <ToolContentSections tool={tool} c={c} />}

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
