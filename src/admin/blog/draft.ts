// The blog draft: edited clusters held in localStorage until they are published.
//
// The site's own CLUSTERS array is the baseline. Only clusters you actually touched are stored, so
// a draft stays small and a cluster you never opened can never be republished with stale content.
import { CLUSTERS, CLUSTER_FILE } from '../../content'
import type { Cluster, Post } from '../../content/types'

const KEY = 'pxp:admin:content'
const EVENT = 'pxp:admin:content'

type DraftMap = Record<string, Cluster>

function read(): DraftMap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as DraftMap) : {}
  } catch {
    return {}
  }
}

function write(map: DraftMap) {
  try {
    if (Object.keys(map).length) localStorage.setItem(KEY, JSON.stringify(map))
    else localStorage.removeItem(KEY)
  } catch {
    /* quota or private mode: the edit stays in memory for this render only */
  }
  window.dispatchEvent(new CustomEvent(EVENT))
}

/** Clusters as they would be published: the site's own, with any edited ones swapped in. */
export function draftClusters(): Cluster[] {
  const map = read()
  return CLUSTERS.map((c) => map[CLUSTER_FILE[c.slug]] ?? c)
}

export const draftPosts = (): Post[] => draftClusters().flatMap((c) => c.posts)

/** File names of the clusters that differ from what is committed. */
export const changedFiles = (): string[] => Object.keys(read())

export const hasContentDraft = (): boolean => changedFiles().length > 0

/** Just the edited clusters, keyed by file name, which is exactly what a publish sends. */
export function changedClusters(): Record<string, Cluster> {
  return read()
}

export function findPost(slug: string): { post: Post; cluster: Cluster } | null {
  for (const c of draftClusters()) {
    const post = c.posts.find((p) => p.slug === slug)
    if (post) return { post, cluster: c }
  }
  return null
}

/**
 * Replaces one post inside its cluster. The whole cluster is stored because that is the unit a
 * file holds, and publishing a half-cluster would drop its siblings.
 */
export function savePost(slug: string, next: Post) {
  const map = read()
  for (const c of draftClusters()) {
    const i = c.posts.findIndex((p) => p.slug === slug)
    if (i === -1) continue
    const posts = c.posts.map((p, k) => (k === i ? next : p))
    map[CLUSTER_FILE[c.slug]] = { ...c, posts }
    write(map)
    return
  }
}

/** Adds a post to a cluster. The rules cap a cluster at five, and the rule panel enforces it. */
export function addPost(clusterSlug: string, post: Post) {
  const map = read()
  const c = draftClusters().find((x) => x.slug === clusterSlug)
  if (!c) return
  map[CLUSTER_FILE[c.slug]] = { ...c, posts: [...c.posts, post] }
  write(map)
}

export function deletePost(slug: string) {
  const map = read()
  for (const c of draftClusters()) {
    if (!c.posts.some((p) => p.slug === slug)) continue
    map[CLUSTER_FILE[c.slug]] = { ...c, posts: c.posts.filter((p) => p.slug !== slug) }
    write(map)
    return
  }
}

/** Throws the draft away and goes back to what is committed. */
export function discardDraft() {
  write({})
}

export function onDraftChange(fn: () => void): () => void {
  window.addEventListener(EVENT, fn)
  window.addEventListener('storage', fn)
  return () => {
    window.removeEventListener(EVENT, fn)
    window.removeEventListener('storage', fn)
  }
}

/** A blank post, pre-filled with everything the rules require a value for. */
export function blankPost(clusterSlug: string): Post {
  const today = new Date().toISOString().slice(0, 10)
  return {
    slug: '',
    cluster: clusterSlug,
    title: '',
    metaTitle: '',
    metaDescription: '',
    published: today,
    updated: today,
    readMinutes: 5,
    intent: 'howto',
    primaryKeyword: '',
    secondaryKeywords: [],
    entities: [],
    answer: '',
    body: [{ t: 'p', x: '' }],
    faqs: [
      { q: '', a: '' },
      { q: '', a: '' },
      { q: '', a: '' },
    ],
    relatedTools: [],
    relatedPosts: [],
  }
}
