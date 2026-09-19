import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTool, useVisibleTools } from './useTools'
import { postsForTool } from '../../content'
import { breadcrumbSchema, faqSchema, howToSchema, softwareSchema, useSeo, SITE_URL } from '../../lib/seo'
import { shotAbsoluteUrl } from '../../components/ui/ToolShot'
import { isFilled, toolContent } from '../../content/tools'
import { toolAliasBySlug } from '../../content/toolAliases'
import { toolAliasContent } from '../../content/toolAliasContent'
import { ToolContentSections, stepAnchor } from './ToolContent'
import { StatusBadge, ToolCard } from './ToolCard'
import { GenericTool } from './GenericTool'
import { ClientOnly } from '../../components/ClientOnly'
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
  const alias = toolAliasBySlug(slug)
  const baseSlug = alias?.baseSlug || slug
  const tool = useTool(baseSlug)
  const key = slug // remounts the tool UI when the route changes
  const allTools = useVisibleTools()
  const guides = postsForTool(baseSlug).slice(0, 4)
  const content = alias ? toolAliasContent(alias) : toolContent(slug)
  const c = isFilled(content) ? content : undefined

  useSeo({
    title: tool ? c?.metaTitle || `${tool.name} | ${tool.status === 'server' ? 'Free Online Converter' : 'Free, In Your Browser'}` : 'Tool not found',
    description: tool ? c?.metaDescription || `${tool.description} ${tool.status === 'server' ? 'Free for 5 files a month, no sign-up.' : 'No upload, no sign-up: it runs entirely in your browser.'}`.slice(0, 158) : '',
    path: `/tools/${slug}`,
    keywords: tool ? [...(c?.keywords || []), (alias?.name || tool.name).toLowerCase(), `${(alias?.name || tool.name).toLowerCase()} free`, `${(alias?.name || tool.name).toLowerCase()} online`] : [],
    noindex: !tool,
    schema: tool
      ? [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: alias?.name || tool.name, path: `/tools/${slug}` },
          ]),
          softwareSchema({ name: alias?.name || tool.name, description: c?.metaDescription || tool.description, path: `/tools/${slug}` }),
          ...(c ? [faqSchema(c.faqs), howToSchema({ title: c.howHeading || `How to use ${alias?.name || tool.name}`, description: c.answer, steps: c.how, path: `/tools/${slug}`, anchors: c.how.map((_, i) => stepAnchor(i + 1)), image: shotAbsoluteUrl(SITE_URL, tool.slug) || undefined })] : []),
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
          <span className="badge">{tool.status === 'server' ? 'Sent securely · converted · deleted' : 'Nothing is uploaded'}</span>
        </div>
        <h1>{alias?.name || tool.name}</h1>
        <p className="lead">{alias?.answer || tool.description}</p>
      </div>

      {/* the workbench reads files and browser APIs, so it is left out of the static HTML and
          mounts after hydration; the skeleton keeps the page from jumping meanwhile */}
      <ClientOnly fallback={<div className="card tool-skeleton" aria-busy="true"><span className="badge badge-ink">Loading tool…</span></div>}>
      <Suspense fallback={<div className="card tool-skeleton" aria-busy="true"><span className="badge badge-ink">Loading tool…</span></div>}>
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
        {tool.custom === 'image' && <ImageConvertTool key={key} initialFormat={alias?.target} />}
        {tool.custom === 'compress-image' && <CompressImageTool key={key} />}
        {tool.custom === 'zip' && <ZipTool key={key} />}
        {tool.custom === 'unzip' && <UnzipTool key={key} />}
        {!tool.custom && <GenericTool key={key} tool={tool} />}
      </Suspense>
      </ClientOnly>

      {c && <ToolContentSections tool={tool} c={c} related={related} />}

      {(alias || tool.slug === 'image-converter') && (
        <div className="section-tight" style={{ marginTop: '3rem' }}>
          <span className="eyebrow">More image conversions</span>
          <div className="grid grid-3">
            {['heic-to-jpg', 'heic-to-png', 'heic-to-webp', 'png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'webp-to-png', 'svg-to-png', 'svg-to-jpg']
              .filter((s) => s !== slug)
              .map((s) => {
                const a = toolAliasBySlug(s)
                return a ? <Link key={s} to={`/tools/${s}`} className="card card-hover" style={{ textDecoration: 'none' }}><h4>{a.name}</h4><p className="muted" style={{ margin: 0 }}>{a.source} to {a.target.toUpperCase()} in your browser.</p></Link> : null
              })}
          </div>
        </div>
      )}

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

      {/* with editorial content the sidebar lists related tools instead */}
      {related.length > 0 && !c && (
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
