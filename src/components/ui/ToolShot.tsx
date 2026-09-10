import screens from '../../content/tools/screens.json'
import { toolBySlug } from '../../features/pdf/toolsMeta'

// Real screenshots of each tool with a file loaded, taken by scripts/audit-tools.mjs from the
// built site; the manifest carries their pixel size so the page never shifts while they load.
const SHOTS = screens as Record<string, { w: number; h: number }>

export const shotUrl = (slug: string) => (slug in SHOTS ? `${import.meta.env.BASE_URL}screens/tools/${slug}.jpg` : null)
export const shotAbsoluteUrl = (site: string, slug: string) => (slug in SHOTS ? `${site}/screens/tools/${slug}.jpg` : null)

export function ToolShot({ slug, caption }: { slug: string; caption?: string }) {
  const s = SHOTS[slug]
  const tool = toolBySlug(slug)
  if (!s || !tool) return null
  return (
    <figure className="tool-shot">
      <img src={shotUrl(slug)!} alt={`${tool.name} in PrintxPDF with a file loaded, options on the right and the run button below`} width={s.w} height={s.h} loading="lazy" decoding="async" />
      <figcaption className="muted">{caption || `${tool.name}, running in the browser with a file loaded.`}</figcaption>
    </figure>
  )
}
