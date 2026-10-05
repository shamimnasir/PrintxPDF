import { describe, expect, it } from 'vitest'
import { LANGUAGE_PACKS, localizedContentIssues } from '../localizedGuidesFull'
import { guideAlternates, guidePath, hubAlternates } from '../localizedGuides'
import { TOOLS } from '../../features/pdf/toolsMeta'
import { ALL_POSTS } from '..'

describe('localized guides', () => {
  it('has complete, substantial translated guides with unique URLs and aligned topics', () => {
    expect(localizedContentIssues()).toEqual([])
  })

  it('links every localized guide to an existing tool', () => {
    const slugs = new Set(TOOLS.map((tool) => tool.slug))
    for (const pack of LANGUAGE_PACKS) {
      for (const guide of pack.guides) expect(slugs.has(guide.tool), `${pack.locale}: ${guide.tool}`).toBe(true)
    }
  })

  it('translates every English guide into every supported language', () => {
    const englishGuideTopics = new Set(ALL_POSTS.map((post) => post.slug))
    for (const pack of LANGUAGE_PACKS) {
      const translatedTopics = new Set(pack.guides.map((guide) => guide.topic))
      for (const topic of englishGuideTopics) expect(translatedTopics.has(topic), `${pack.locale}: ${topic}`).toBe(true)
    }
  })

  it('includes the English canonical page and every translated equivalent in reciprocal hreflang data', () => {
    const englishGuide = ALL_POSTS[0]
    const englishUrl = `https://printxpdf.com/blog/${englishGuide.cluster}/${englishGuide.slug}`
    const alternates = guideAlternates(englishGuide.slug, 'https://printxpdf.com', LANGUAGE_PACKS)
    expect(alternates).toContainEqual({ lang: 'en', url: englishUrl })
    expect(alternates).toContainEqual({ lang: 'x-default', url: englishUrl })
    expect(alternates).toHaveLength(LANGUAGE_PACKS.length + 2)
    for (const pack of LANGUAGE_PACKS) {
      const translated = pack.guides.find((guide) => guide.topic === englishGuide.slug)
      expect(alternates).toContainEqual({ lang: pack.locale, url: `https://printxpdf.com${guidePath(pack, translated?.slug)}` })
    }
  })

  it('includes the English blog hub and every translated hub in reciprocal hreflang data', () => {
    const alternates = hubAlternates()
    expect(alternates).toContainEqual({ lang: 'en', url: 'https://printxpdf.com/blog' })
    expect(alternates).toContainEqual({ lang: 'x-default', url: 'https://printxpdf.com/blog' })
    expect(alternates).toHaveLength(LANGUAGE_PACKS.length + 2)
  })
})
