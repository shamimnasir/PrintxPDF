import { describe, expect, it } from 'vitest'
import { ALL_POSTS, CLUSTERS, postBySlug } from '..'
import { TOOLS } from '../../features/pdf/toolsMeta'
import { formatIssues, validateContent, type Issue } from '../validate'

// The rules themselves live in ../validate so the admin editor and the Worker enforce exactly what
// CI does. This suite is the CI caller: it runs them once and reports each rule separately, so a
// failure still points at one thing rather than at a wall of unrelated output.
// A fixed date here fails the day it passes; compare against the real one.
const TODAY = new Date().toISOString().slice(0, 10)
const ISSUES: Issue[] = validateContent(CLUSTERS, TOOLS.map((t) => t.slug), TODAY)
const only = (...rules: string[]) => formatIssues(ISSUES.filter((i) => rules.includes(i.rule)))

describe('content integrity', () => {
  it('has the promised number of clusters and posts', () => {
    expect(only('cluster-count', 'posts-per-cluster')).toBe('')
  })

  it('has unique slugs', () => {
    expect(only('unique-slugs')).toBe('')
  })

  it('gives every post a cluster that exists and lists it', () => {
    expect(only('cluster-exists', 'cluster-membership')).toBe('')
  })

  it('only references tools that exist', () => {
    expect(only('tool-exists')).toBe('')
  })

  it('only cross-links posts that exist', () => {
    expect(only('post-exists')).toBe('')
  })

  it('has no broken internal links in body text or FAQs', () => {
    expect(only('broken-link')).toBe('')
  })

  it('has SEO fields within the lengths search engines actually use', () => {
    expect(only('meta-title-length', 'meta-description-length', 'answer-length', 'faq-count', 'entity-count', 'secondary-keyword-count')).toBe('')
  })

  it('has substantial body content in every post', () => {
    expect(only('body-length')).toBe('')
  })

  it('gives every how-to post a steps block for HowTo schema', () => {
    expect(only('howto-steps')).toBe('')
  })

  it('uses dates that are ordered and not in the future', () => {
    expect(only('date-order', 'date-future')).toBe('')
  })

  it('keeps em dashes out of the prose', () => {
    expect(only('em-dash')).toBe('')
  })

  it('reports nothing else', () => {
    expect(formatIssues(ISSUES)).toBe('')
  })

  // Not a content rule: this checks the public lookup the pages call, not the data itself.
  it('resolves every relatedPost through the public lookup', () => {
    ALL_POSTS.forEach((p) => p.relatedPosts.forEach((r) => expect(postBySlug(r), `${p.slug} → ${r}`).toBeTruthy()))
  })
})
