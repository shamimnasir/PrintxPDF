import { useMemo } from 'react'
import { useSiteConfig } from '../../admin/useSiteConfig'
import { TOOLS, toolBySlug, type ToolMeta } from './toolsMeta'

/** Applies the admin panel's name/description overrides to a tool. */
export function useTool(slug: string): ToolMeta | undefined {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const base = toolBySlug(slug)
    if (!base) return undefined
    const ov = cfg.tools.overrides[slug]
    return ov ? { ...base, ...ov } : base
  }, [slug, cfg.tools.overrides])
}

/** Every tool the admin has not hidden, with overrides applied and featured tools first. */
export function useVisibleTools(): ToolMeta[] {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const hidden = new Set(cfg.tools.hidden)
    const featured = cfg.tools.featured
    const list = TOOLS.filter((t) => !hidden.has(t.slug)).map((t) => {
      const ov = cfg.tools.overrides[t.slug]
      return ov ? { ...t, ...ov } : t
    })
    if (!featured.length) return list
    const rank = (s: string) => {
      const i = featured.indexOf(s)
      return i === -1 ? featured.length : i
    }
    return [...list].sort((a, b) => rank(a.slug) - rank(b.slug))
  }, [cfg.tools])
}

export function useIsToolHidden(slug: string) {
  return useSiteConfig().tools.hidden.includes(slug)
}
