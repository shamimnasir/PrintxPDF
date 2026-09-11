// The content rules, in one place. These used to live inside the vitest suite, which meant only
// CI could reach them. Three callers need the same answer: the admin editor (live, while you
// type), the Worker (authoritative, before it commits anything to the repository) and the test
// suite (unchanged). Keep this file free of imports beyond types so the Worker can bundle it.
import type { Block, Cluster, Post } from './types'

export type Issue = {
  /** stable id so the editor can attach a message to a field */
  rule: string
  /** post slug, cluster slug, or '' for a whole-site rule */
  where: string
  message: string
}

/** Routes that exist outside the content model and are therefore valid link targets. */
export const STATIC_ROUTES = [
  '/', '/print', '/tools', '/blog', '/pricing', '/about', '/api', '/wordpress', '/website-button',
  '/privacy', '/terms', '/signin', '/signup', '/account', '/extensions', '/support',
]

const BROWSERS = ['chrome', 'firefox', 'safari', 'edge']

export const LIMITS = {
  clustersMin: 10,
  clustersMax: 24,
  postsPerClusterMin: 3,
  postsPerClusterMax: 5,
  metaTitleMax: 65,
  metaDescriptionMin: 110,
  metaDescriptionMax: 158,
  answerWordsMin: 25,
  answerWordsMax: 90,
  faqsMin: 3,
  entitiesMin: 4,
  secondaryKeywordsMin: 3,
  bodyWordsMin: 450,
} as const

const EM_DASH = String.fromCharCode(0x2014)

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length

/** Every piece of prose in a block, flattened. Mirrors what a reader actually sees. */
function blockText(b: Block): string {
  if ('x' in b) return b.x
  if ('items' in b) return b.items.map((i) => (typeof i === 'string' ? i : `${i.h} ${i.x}`)).join(' ')
  if (b.t === 'table') return b.rows.flat().join(' ')
  return ''
}

export const bodyWordCount = (body: Block[]): number => body.map(blockText).join(' ').split(/\s+/).length

/** Text fields a house-style rule should look at: body prose, the answer, and both halves of an FAQ. */
function proseOf(p: Post): { text: string; where: string }[] {
  const out = [{ text: p.answer, where: 'answer' }]
  p.body.forEach((b, i) => out.push({ text: blockText(b), where: `body block ${i + 1}` }))
  p.faqs.forEach((f, i) => out.push({ text: `${f.q} ${f.a}`, where: `faq ${i + 1}` }))
  return out
}

export type PostContext = {
  toolSlugs: ReadonlySet<string>
  postSlugs: ReadonlySet<string>
  clusterSlugs: ReadonlySet<string>
  /** ISO yyyy-mm-dd. Passed in rather than read from the clock so results are reproducible. */
  today: string
}

export function buildContext(clusters: Cluster[], toolSlugs: string[], today: string): PostContext {
  const posts = clusters.flatMap((c) => c.posts)
  return {
    toolSlugs: new Set(toolSlugs),
    postSlugs: new Set(posts.map((p) => p.slug)),
    clusterSlugs: new Set(clusters.map((c) => c.slug)),
    today,
  }
}

/** Link targets that resolve. Built once per validation run rather than per link. */
function knownRoutes(ctx: PostContext, clusters: Cluster[]): Set<string> {
  const known = new Set(STATIC_ROUTES)
  ctx.toolSlugs.forEach((t) => known.add(`/tools/${t}`))
  ctx.clusterSlugs.forEach((c) => known.add(`/blog/${c}`))
  clusters.forEach((c) => c.posts.forEach((p) => known.add(`/blog/${p.cluster}/${p.slug}`)))
  BROWSERS.forEach((b) => known.add(`/extensions/${b}`))
  return known
}

/** Markdown links to our own site, normalised the way the router would see them. */
export function internalLinks(text: string): string[] {
  return [...text.matchAll(/\]\((\/[^)]*)\)/g)].map((m) => m[1].split('#')[0].split('?')[0].replace(/\/$/, '') || '/')
}

/**
 * Everything checkable about one post on its own. The editor runs this on every keystroke, so it
 * takes a prepared context instead of rebuilding the slug sets each time.
 */
export function validatePost(p: Post, ctx: PostContext, known: Set<string>): Issue[] {
  const issues: Issue[] = []
  const add = (rule: string, message: string) => issues.push({ rule, where: p.slug, message })

  if (!ctx.clusterSlugs.has(p.cluster)) add('cluster-exists', `cluster "${p.cluster}" does not exist`)

  if (p.metaTitle.length > LIMITS.metaTitleMax) {
    add('meta-title-length', `metaTitle is ${p.metaTitle.length} chars, keep it to ${LIMITS.metaTitleMax}`)
  }
  if (p.metaDescription.length < LIMITS.metaDescriptionMin || p.metaDescription.length > LIMITS.metaDescriptionMax) {
    add('meta-description-length', `metaDescription is ${p.metaDescription.length} chars, needs ${LIMITS.metaDescriptionMin} to ${LIMITS.metaDescriptionMax}`)
  }
  const answerWords = wordCount(p.answer)
  if (answerWords < LIMITS.answerWordsMin || answerWords > LIMITS.answerWordsMax) {
    add('answer-length', `answer is ${answerWords} words, needs ${LIMITS.answerWordsMin} to ${LIMITS.answerWordsMax}`)
  }
  if (p.faqs.length < LIMITS.faqsMin) add('faq-count', `only ${p.faqs.length} FAQs, needs ${LIMITS.faqsMin}`)
  if (p.entities.length < LIMITS.entitiesMin) add('entity-count', `only ${p.entities.length} entities, needs ${LIMITS.entitiesMin}`)
  if (p.secondaryKeywords.length < LIMITS.secondaryKeywordsMin) {
    add('secondary-keyword-count', `only ${p.secondaryKeywords.length} secondary keywords, needs ${LIMITS.secondaryKeywordsMin}`)
  }

  const words = bodyWordCount(p.body)
  if (words < LIMITS.bodyWordsMin) add('body-length', `body is ${words} words, needs ${LIMITS.bodyWordsMin}`)

  if (p.intent === 'howto' && !p.body.some((b) => b.t === 'steps')) {
    add('howto-steps', 'a how-to post needs a steps block, which is what becomes HowTo structured data')
  }

  p.relatedTools.forEach((t) => !ctx.toolSlugs.has(t) && add('tool-exists', `relatedTools names "${t}", which is not a tool`))
  p.body.forEach((b) => b.t === 'cta' && !ctx.toolSlugs.has(b.tool) && add('tool-exists', `a CTA points at "${b.tool}", which is not a tool`))
  p.relatedPosts.forEach((r) => !ctx.postSlugs.has(r) && add('post-exists', `relatedPosts names "${r}", which is not a post`))

  proseOf(p).forEach(({ text, where }) => {
    internalLinks(text).forEach((href) => !known.has(href) && add('broken-link', `${where} links to ${href}, which does not resolve`))
    if (text.includes(EM_DASH)) add('em-dash', `${where} contains an em dash, which this site's style does not use`)
  })

  if (p.updated < p.published) add('date-order', `updated ${p.updated} is before published ${p.published}`)
  if (p.published > ctx.today || p.updated > ctx.today) add('date-future', `dated after today (${ctx.today})`)

  return issues
}

/**
 * The whole content set: every post, plus the structural rules that only make sense across posts.
 * The Worker calls this before a commit, so a publish can never introduce a build-breaking post.
 */
export function validateContent(clusters: Cluster[], toolSlugs: string[], today: string): Issue[] {
  const issues: Issue[] = []
  const site = (rule: string, message: string) => issues.push({ rule, where: '', message })

  if (clusters.length < LIMITS.clustersMin || clusters.length > LIMITS.clustersMax) {
    site('cluster-count', `${clusters.length} clusters, needs ${LIMITS.clustersMin} to ${LIMITS.clustersMax}`)
  }

  const ctx = buildContext(clusters, toolSlugs, today)
  const known = knownRoutes(ctx, clusters)
  const posts = clusters.flatMap((c) => c.posts)

  if (ctx.clusterSlugs.size !== clusters.length) site('unique-slugs', 'two clusters share a slug')
  if (ctx.postSlugs.size !== posts.length) site('unique-slugs', 'two posts share a slug')

  clusters.forEach((c) => {
    if (c.posts.length < LIMITS.postsPerClusterMin || c.posts.length > LIMITS.postsPerClusterMax) {
      issues.push({
        rule: 'posts-per-cluster',
        where: c.slug,
        message: `${c.posts.length} posts, needs ${LIMITS.postsPerClusterMin} to ${LIMITS.postsPerClusterMax}`,
      })
    }
    c.tools.forEach((t) => !ctx.toolSlugs.has(t) && issues.push({ rule: 'tool-exists', where: c.slug, message: `cluster tool "${t}" does not exist` }))
    // a post can name a cluster that exists but is not listed by it, which breaks the hub page
    c.posts.forEach((p) => {
      if (p.cluster !== c.slug) issues.push({ rule: 'cluster-membership', where: p.slug, message: `sits in ${c.slug} but claims cluster ${p.cluster}` })
    })
  })

  posts.forEach((p) => issues.push(...validatePost(p, ctx, known)))
  return issues
}

/** One line per issue, for a test failure message or a Worker error body. */
export const formatIssues = (issues: Issue[]): string =>
  issues.map((i) => `${i.where ? `${i.where}: ` : ''}${i.message} [${i.rule}]`).join('\n')
