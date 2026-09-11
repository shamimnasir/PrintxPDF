import { describe, expect, it } from 'vitest'
import { LIMITS, validateContent, type Issue } from '../validate'
import type { Cluster, Post } from '../types'

// A rule nobody has seen fail is a rule you are trusting on faith, so every one gets a fixture
// that breaks it. The shared fixtures below pass cleanly; each test breaks exactly one thing.

const TODAY = '2026-09-11'
const TOOLS = ['merge-pdf', 'split-pdf']

const prose = (words: number) => Array.from({ length: words }, (_, i) => `word${i}`).join(' ')

const post = (over: Partial<Post> = {}): Post => ({
  slug: 'a-post',
  cluster: 'a-cluster',
  title: 'A post',
  metaTitle: 'A post about merging PDFs',
  metaDescription: 'A description that sits comfortably inside the range search engines actually use, which is a hundred and ten to a hundred and fifty.',
  published: '2026-01-01',
  updated: '2026-02-01',
  readMinutes: 5,
  intent: 'informational',
  primaryKeyword: 'merge pdf',
  secondaryKeywords: ['one', 'two', 'three'],
  entities: ['one', 'two', 'three', 'four'],
  answer: prose(40),
  body: [{ t: 'p', x: prose(500) }],
  faqs: [
    { q: 'Q1', a: 'A1' },
    { q: 'Q2', a: 'A2' },
    { q: 'Q3', a: 'A3' },
  ],
  relatedTools: ['merge-pdf'],
  relatedPosts: [],
  ...over,
})

const cluster = (over: Partial<Cluster> = {}): Cluster => ({
  slug: 'a-cluster',
  name: 'A cluster',
  title: 'A cluster',
  metaTitle: 'A cluster',
  metaDescription: 'x',
  intro: 'x',
  answer: 'x',
  primaryKeyword: 'x',
  entities: [],
  icon: '▦',
  tools: ['merge-pdf'],
  posts: [post(), post({ slug: 'b-post' }), post({ slug: 'c-post' })],
  ...over,
})

/** Ten clusters is the floor, so the baseline sits at the floor and stays valid. */
const clusters = (first?: Cluster): Cluster[] => [
  first ?? cluster(),
  ...Array.from({ length: 9 }, (_, i) =>
    cluster({
      slug: `c${i}`,
      posts: [post({ slug: `c${i}-1`, cluster: `c${i}` }), post({ slug: `c${i}-2`, cluster: `c${i}` }), post({ slug: `c${i}-3`, cluster: `c${i}` })],
    }),
  ),
]

const run = (cs: Cluster[]): Issue[] => validateContent(cs, TOOLS, TODAY)
const rules = (cs: Cluster[]) => run(cs).map((i) => i.rule)

/** Replace the first post of the first cluster, keeping everything else valid. */
const withPost = (over: Partial<Post>) => {
  const c = cluster()
  c.posts = [post(over), post({ slug: 'b-post' }), post({ slug: 'c-post' })]
  return clusters(c)
}

describe('validateContent', () => {
  it('passes a clean content set', () => {
    expect(run(clusters())).toEqual([])
  })

  it('catches too few and too many clusters', () => {
    expect(rules([cluster()])).toContain('cluster-count')
    expect(rules(Array.from({ length: LIMITS.clustersMax + 1 }, (_, i) => cluster({ slug: `x${i}`, posts: [post({ slug: `x${i}-1`, cluster: `x${i}` }), post({ slug: `x${i}-2`, cluster: `x${i}` }), post({ slug: `x${i}-3`, cluster: `x${i}` })] })))).toContain('cluster-count')
  })

  it('catches a cluster with the wrong number of posts', () => {
    expect(rules(clusters(cluster({ posts: [post()] })))).toContain('posts-per-cluster')
    expect(rules(clusters(cluster({ posts: Array.from({ length: 6 }, (_, i) => post({ slug: `p${i}` })) })))).toContain('posts-per-cluster')
  })

  it('catches duplicate slugs', () => {
    expect(rules(clusters(cluster({ posts: [post(), post(), post()] })))).toContain('unique-slugs')
  })

  it('catches a post claiming a cluster it does not sit in', () => {
    expect(rules(withPost({ cluster: 'a-cluster-that-is-listed-nowhere' }))).toContain('cluster-exists')
    const c = cluster()
    c.posts = [post({ cluster: 'c0' }), post({ slug: 'b-post' }), post({ slug: 'c-post' })]
    expect(rules(clusters(c))).toContain('cluster-membership')
  })

  it('catches references to tools that do not exist', () => {
    expect(rules(withPost({ relatedTools: ['no-such-tool'] }))).toContain('tool-exists')
    expect(rules(withPost({ body: [{ t: 'p', x: prose(500) }, { t: 'cta', tool: 'no-such-tool', x: 'Try it' }] }))).toContain('tool-exists')
    expect(rules(clusters(cluster({ tools: ['no-such-tool'] })))).toContain('tool-exists')
  })

  it('catches cross-links to posts that do not exist', () => {
    expect(rules(withPost({ relatedPosts: ['ghost'] }))).toContain('post-exists')
  })

  it('catches broken internal links in body, answer and FAQs', () => {
    expect(rules(withPost({ body: [{ t: 'p', x: `${prose(500)} [see](/tools/nope)` }] }))).toContain('broken-link')
    expect(rules(withPost({ faqs: [{ q: 'Q', a: '[x](/nope)' }, { q: 'Q2', a: 'A' }, { q: 'Q3', a: 'A' }] }))).toContain('broken-link')
  })

  it('accepts links that do resolve, including anchors and trailing slashes', () => {
    expect(rules(withPost({ body: [{ t: 'p', x: `${prose(500)} [a](/tools/merge-pdf) [b](/blog/a-cluster/b-post) [c](/pricing#refunds) [d](/tools/)` }] }))).not.toContain('broken-link')
  })

  it('catches SEO fields outside the usable lengths', () => {
    expect(rules(withPost({ metaTitle: 'x'.repeat(LIMITS.metaTitleMax + 1) }))).toContain('meta-title-length')
    expect(rules(withPost({ metaDescription: 'short' }))).toContain('meta-description-length')
    expect(rules(withPost({ metaDescription: 'x'.repeat(LIMITS.metaDescriptionMax + 1) }))).toContain('meta-description-length')
    expect(rules(withPost({ answer: prose(5) }))).toContain('answer-length')
    expect(rules(withPost({ answer: prose(200) }))).toContain('answer-length')
    expect(rules(withPost({ faqs: [{ q: 'Q', a: 'A' }] }))).toContain('faq-count')
    expect(rules(withPost({ entities: ['one'] }))).toContain('entity-count')
    expect(rules(withPost({ secondaryKeywords: ['one'] }))).toContain('secondary-keyword-count')
  })

  it('catches a thin body', () => {
    expect(rules(withPost({ body: [{ t: 'p', x: prose(50) }] }))).toContain('body-length')
  })

  it('counts words inside lists, steps and tables toward the body', () => {
    const viaList = withPost({ body: [{ t: 'ul', items: [prose(500)] }] })
    expect(rules(viaList)).not.toContain('body-length')
    const viaTable = withPost({ body: [{ t: 'table', head: ['a'], rows: [[prose(500)]] }] })
    expect(rules(viaTable)).not.toContain('body-length')
    const viaSteps = withPost({ body: [{ t: 'steps', items: [{ h: 'Step', x: prose(500) }] }] })
    expect(rules(viaSteps)).not.toContain('body-length')
  })

  it('catches a how-to post with no steps block', () => {
    expect(rules(withPost({ intent: 'howto' }))).toContain('howto-steps')
    expect(rules(withPost({ intent: 'howto', body: [{ t: 'steps', items: [{ h: 'Step', x: prose(500) }] }] }))).not.toContain('howto-steps')
  })

  it('catches dates that are reversed or in the future', () => {
    expect(rules(withPost({ published: '2026-03-01', updated: '2026-01-01' }))).toContain('date-order')
    expect(rules(withPost({ published: '2030-01-01', updated: '2030-01-01' }))).toContain('date-future')
  })

  it('catches an em dash anywhere in the prose', () => {
    const dash = String.fromCharCode(0x2014)
    expect(rules(withPost({ body: [{ t: 'p', x: `${prose(500)} a ${dash} b` }] }))).toContain('em-dash')
    expect(rules(withPost({ answer: `${prose(40)} ${dash}` }))).toContain('em-dash')
    expect(rules(withPost({ faqs: [{ q: 'Q', a: `A ${dash}` }, { q: 'Q2', a: 'A' }, { q: 'Q3', a: 'A' }] }))).toContain('em-dash')
  })

  it('names the post a problem belongs to', () => {
    const issue = run(withPost({ entities: [] })).find((i) => i.rule === 'entity-count')
    expect(issue?.where).toBe('a-post')
  })
})
