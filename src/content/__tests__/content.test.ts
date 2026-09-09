import { describe, expect, it } from 'vitest'
import { ALL_POSTS, CLUSTERS, postBySlug } from '..'
import { TOOLS } from '../../features/pdf/toolsMeta'

const toolSlugs = new Set(TOOLS.map((t) => t.slug))
const postSlugs = new Set(ALL_POSTS.map((p) => p.slug))
const clusterSlugs = new Set(CLUSTERS.map((c) => c.slug))

describe('content integrity', () => {
  it('has the promised number of clusters and posts', () => {
    expect(CLUSTERS.length).toBeGreaterThanOrEqual(10)
    expect(CLUSTERS.length).toBeLessThanOrEqual(20)
    CLUSTERS.forEach((c) => {
      expect(c.posts.length, `${c.slug} post count`).toBeGreaterThanOrEqual(3)
      expect(c.posts.length, `${c.slug} post count`).toBeLessThanOrEqual(5)
    })
  })

  it('has unique slugs', () => {
    expect(postSlugs.size).toBe(ALL_POSTS.length)
    expect(clusterSlugs.size).toBe(CLUSTERS.length)
  })

  it('gives every post a cluster that exists and lists it', () => {
    ALL_POSTS.forEach((p) => {
      expect(clusterSlugs.has(p.cluster), `${p.slug} → ${p.cluster}`).toBe(true)
      const c = CLUSTERS.find((x) => x.slug === p.cluster)!
      expect(c.posts.some((x) => x.slug === p.slug), `${p.slug} listed in its cluster`).toBe(true)
    })
  })

  it('only references tools that exist', () => {
    const bad: string[] = []
    ALL_POSTS.forEach((p) => {
      p.relatedTools.forEach((t) => !toolSlugs.has(t) && bad.push(`${p.slug} → relatedTools "${t}"`))
      p.body.forEach((b) => b.t === 'cta' && !toolSlugs.has(b.tool) && bad.push(`${p.slug} → cta "${b.tool}"`))
    })
    CLUSTERS.forEach((c) => c.tools.forEach((t) => !toolSlugs.has(t) && bad.push(`cluster ${c.slug} → "${t}"`)))
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('only cross-links posts that exist', () => {
    const bad: string[] = []
    ALL_POSTS.forEach((p) => p.relatedPosts.forEach((r) => !postSlugs.has(r) && bad.push(`${p.slug} → ${r}`)))
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('has no broken internal links in body text or FAQs', () => {
    const bad: string[] = []
    const known = new Set([
      '/', '/print', '/tools', '/blog', '/pricing', '/about', '/api', '/wordpress', '/website-button', '/privacy', '/terms', '/signin', '/signup', '/account', '/extensions',
      ...[...toolSlugs].map((t) => `/tools/${t}`),
      ...[...clusterSlugs].map((c) => `/blog/${c}`),
      ...ALL_POSTS.map((p) => `/blog/${p.cluster}/${p.slug}`),
      ...['chrome', 'firefox', 'safari', 'edge'].map((b) => `/extensions/${b}`),
    ])
    const check = (text: string, where: string) => {
      for (const m of text.matchAll(/\]\((\/[^)]*)\)/g)) {
        const href = m[1].split('#')[0].split('?')[0].replace(/\/$/, '') || '/'
        if (!known.has(href)) bad.push(`${where}: ${m[1]}`)
      }
    }
    ALL_POSTS.forEach((p) => {
      p.body.forEach((b) => {
        if ('x' in b) check(b.x, p.slug)
        if ('items' in b) b.items.forEach((i) => check(typeof i === 'string' ? i : `${i.h} ${i.x}`, p.slug))
        if (b.t === 'table') b.rows.forEach((r) => r.forEach((c) => check(c, p.slug)))
      })
      p.faqs.forEach((f) => check(f.a, `${p.slug} faq`))
    })
    expect(bad, bad.join('\n')).toEqual([])
  })

  it('has SEO fields within the lengths search engines actually use', () => {
    const warn: string[] = []
    ALL_POSTS.forEach((p) => {
      if (p.metaTitle.length > 65) warn.push(`${p.slug}: metaTitle ${p.metaTitle.length} chars`)
      if (p.metaDescription.length < 110 || p.metaDescription.length > 158) warn.push(`${p.slug}: metaDescription ${p.metaDescription.length} chars`)
      const words = p.answer.trim().split(/\s+/).length
      if (words < 25 || words > 90) warn.push(`${p.slug}: answer ${words} words`)
      if (p.faqs.length < 3) warn.push(`${p.slug}: only ${p.faqs.length} FAQs`)
      if (p.entities.length < 4) warn.push(`${p.slug}: only ${p.entities.length} entities`)
      if (p.secondaryKeywords.length < 3) warn.push(`${p.slug}: only ${p.secondaryKeywords.length} secondary keywords`)
    })
    expect(warn, warn.join('\n')).toEqual([])
  })

  it('has substantial body content in every post', () => {
    const thin: string[] = []
    ALL_POSTS.forEach((p) => {
      const words = p.body
        .map((b) => ('x' in b ? b.x : 'items' in b ? b.items.map((i) => (typeof i === 'string' ? i : `${i.h} ${i.x}`)).join(' ') : b.t === 'table' ? b.rows.flat().join(' ') : ''))
        .join(' ')
        .split(/\s+/).length
      if (words < 450) thin.push(`${p.slug}: ${words} words`)
    })
    expect(thin, thin.join('\n')).toEqual([])
  })

  it('gives every how-to post a steps block for HowTo schema', () => {
    const missing = ALL_POSTS.filter((p) => p.intent === 'howto' && !p.body.some((b) => b.t === 'steps')).map((p) => p.slug)
    expect(missing, missing.join(', ')).toEqual([])
  })

  it('resolves every relatedPost through the public lookup', () => {
    ALL_POSTS.forEach((p) => p.relatedPosts.forEach((r) => expect(postBySlug(r), `${p.slug} → ${r}`).toBeTruthy()))
  })

  it('uses dates that are ordered and not in the future', () => {
    const bad: string[] = []
    ALL_POSTS.forEach((p) => {
      if (p.updated < p.published) bad.push(`${p.slug}: updated ${p.updated} before published ${p.published}`)
      if (p.published > '2026-09-09' || p.updated > '2026-09-09') bad.push(`${p.slug}: dated in the future`)
    })
    expect(bad, bad.join('\n')).toEqual([])
  })
})
