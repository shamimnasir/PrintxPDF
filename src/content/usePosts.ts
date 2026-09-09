import { useMemo } from 'react'
import { useSiteConfig } from '../admin/useSiteConfig'
import { ALL_POSTS, CLUSTERS, clusterBySlug, postBySlug } from '.'
import type { Cluster, Post } from './types'

/** A post with the admin panel's title/meta/answer overrides applied, or undefined if hidden. */
export function usePost(slug: string): Post | undefined {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const base = postBySlug(slug)
    if (!base || cfg.content.hidden.includes(slug)) return undefined
    const ov = cfg.content.overrides[slug]
    return ov ? { ...base, ...ov } : base
  }, [slug, cfg.content])
}

/** A cluster whose post list excludes anything unpublished. */
export function useCluster(slug: string): Cluster | undefined {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const base = clusterBySlug(slug)
    if (!base) return undefined
    const hidden = new Set(cfg.content.hidden)
    return { ...base, posts: base.posts.filter((p) => !hidden.has(p.slug)).map((p) => ({ ...p, ...(cfg.content.overrides[p.slug] || {}) })) }
  }, [slug, cfg.content])
}

export function useClusters(): Cluster[] {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const hidden = new Set(cfg.content.hidden)
    return CLUSTERS.map((c) => ({ ...c, posts: c.posts.filter((p) => !hidden.has(p.slug)).map((p) => ({ ...p, ...(cfg.content.overrides[p.slug] || {}) })) })).filter((c) => c.posts.length > 0)
  }, [cfg.content])
}

export function useAllPosts(): Post[] {
  const cfg = useSiteConfig()
  return useMemo(() => {
    const hidden = new Set(cfg.content.hidden)
    return ALL_POSTS.filter((p) => !hidden.has(p.slug)).map((p) => ({ ...p, ...(cfg.content.overrides[p.slug] || {}) }))
  }, [cfg.content])
}
