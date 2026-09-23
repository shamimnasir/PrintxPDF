import { Link } from 'react-router-dom'
import screens from '../../content/tools/screens.json'
import { toolBySlug } from '../../features/pdf/toolsMeta'

// Real screenshots of each tool with a file loaded, taken by scripts/audit-tools.mjs from the
// built site; the manifest carries their pixel size so the page never shifts while they load.
const SHOTS = screens as Record<string, { w: number; h: number }>

export const shotUrl = (slug: string) => (slug in SHOTS ? `${import.meta.env.BASE_URL}screens/tools/${slug}.jpg` : null)
export const shotAbsoluteUrl = (site: string, slug: string) => (slug in SHOTS ? `${site}/screens/tools/${slug}.jpg` : null)

export function ToolShot({ slug, caption, compact = false }: { slug: string; caption?: string; compact?: boolean }) {
  const s = SHOTS[slug]
  const tool = toolBySlug(slug)
  if (!s || !tool) return null
  const compactSrc = compact && slug === 'edit-pdf' ? `${import.meta.env.BASE_URL}screens/tools/edit-pdf-640.jpg` : null
  const width = compactSrc ? 640 : s.w
  const height = compactSrc ? Math.round((s.h / s.w) * width) : s.h
  return (
    <figure className="tool-shot">
      <img src={compactSrc || shotUrl(slug)!} alt={`${tool.name} in PrintxPDF with a file loaded, options on the right and the run button below`} width={width} height={height} loading="lazy" decoding="async" />
      <figcaption className="muted">{caption || `${tool.name}, running in the browser with a file loaded.`}</figcaption>
    </figure>
  )
}

/** Show every tool a guide recommends, using the same verified screenshots as the tool pages. */
export function ToolShotGallery({ slugs, heading = 'See the tools in action' }: { slugs: string[]; heading?: string }) {
  const tools = slugs.map((slug) => ({ slug, tool: toolBySlug(slug), shot: SHOTS[slug] })).filter((x) => x.tool && x.shot) as { slug: string; tool: NonNullable<ReturnType<typeof toolBySlug>>; shot: { w: number; h: number } }[]
  if (!tools.length) return null
  return (
    <section className="tool-shot-gallery" aria-labelledby="tool-shot-gallery-heading">
      <h2 id="tool-shot-gallery-heading">{heading}</h2>
      <div className="tool-shot-grid">
        {tools.map(({ slug, tool, shot }) => (
          <figure className="tool-shot" key={slug}>
            <Link to={`/tools/${slug}`} aria-label={`Open ${tool.name}`}>
              <img src={shotUrl(slug)!} alt={`${tool.name} in PrintxPDF with a file loaded, options visible and the run button ready`} width={shot.w} height={shot.h} loading="lazy" decoding="async" />
            </Link>
            <figcaption className="muted">
              <Link to={`/tools/${slug}`}>{tool.name}</Link>, ready to use in your browser.
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
