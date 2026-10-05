import data from './localized-guides.json'
import { ALL_POSTS } from './index'

export type LocalizedGuide = {
  topic: string
  slug: string
  keyword: string
  secondaryKeywords: string[]
  title: string
  metaTitle: string
  metaDescription: string
  answer: string
  tool: string
  ctaLabel: string
  published?: string
  updated?: string
  sections?: { heading: string; paragraphs: string[]; steps?: { heading: string; text: string }[] }[]
  body?: import('./types').Block[]
  faqs: { q: string; a: string }[]
}

export type LanguagePack = Omit<(typeof data)[number], 'dir' | 'guides'> & { dir: 'ltr' | 'rtl'; guides: LocalizedGuide[] }

export function normalizeLocalizedGuides(guides: (Partial<LocalizedGuide> & { description?: string })[]): LocalizedGuide[] {
  return guides.map((guide) => {
    const body = guide.body || []
    const firstParagraph = body.find((block) => block.t === 'p')
    const cta = body.find((block) => block.t === 'cta')
    return {
      ...guide,
      topic: guide.topic || guide.slug || '',
      slug: guide.slug || guide.topic || '',
      keyword: guide.keyword || guide.title || '',
      secondaryKeywords: guide.secondaryKeywords || [],
      title: guide.title || '',
      metaTitle: guide.metaTitle || guide.title || '',
      metaDescription: guide.metaDescription || '',
      answer: guide.answer || (firstParagraph && firstParagraph.t === 'p' ? firstParagraph.x : '') || guide.description || '',
      tool: guide.tool || (cta && cta.t === 'cta' ? cta.tool : '') || '',
      ctaLabel: guide.ctaLabel || (cta && cta.t === 'cta' ? cta.x : '') || '',
      faqs: guide.faqs || [],
      published: guide.published || '2026-10-04',
      updated: guide.updated || '2026-10-04',
    }
  }) as LocalizedGuide[]
}

export const LANGUAGE_PACKS = data as LanguagePack[]

export const LANGUAGE_DIRECTORY = LANGUAGE_PACKS.map((pack) => ({
  locale: pack.locale,
  name: pack.nativeName,
  shortName: ({ es: 'Es', 'pt-BR': 'Pt', hi: 'Hi', ar: 'Ar', bn: 'Bn', vi: 'Vi', 'zh-CN': 'Zh' } as Record<string, string>)[pack.locale] || pack.locale,
  path: `/${pack.locale.toLowerCase()}/${pack.hub}`,
  active: true,
}))

export const guidePath = (pack: LanguagePack, slug?: string) =>
  `/${pack.locale.toLowerCase()}/${pack.hub}${slug ? `/${slug}` : ''}`

export function languagePack(locale: string, hub: string): LanguagePack | undefined {
  return LANGUAGE_PACKS.find((p) => p.locale.toLowerCase() === locale.toLowerCase() && p.hub === hub)
}

export function guideAlternates(topic: string, site = 'https://printxpdf.com', packs: LanguagePack[] = LANGUAGE_PACKS): { lang: string; url: string }[] {
  const base = site.replace(/\/$/, '')
  const english = ALL_POSTS.find((post) => post.slug === topic)
  const alternates = packs.map((pack) => {
    const guide = pack.guides.find((item) => item.topic === topic)
    return { lang: pack.locale, url: `${base}${guidePath(pack, guide?.slug || topic)}` }
  })
  if (!english) return alternates
  const englishUrl = `${base}/blog/${english.cluster}/${english.slug}`
  return [{ lang: 'en', url: englishUrl }, ...alternates, { lang: 'x-default', url: englishUrl }]
}

export function hubAlternates(site = 'https://printxpdf.com'): { lang: string; url: string }[] {
  const base = site.replace(/\/$/, '')
  const englishUrl = `${base}/blog`
  return [
    { lang: 'en', url: englishUrl },
    ...LANGUAGE_PACKS.map((pack) => ({ lang: pack.locale, url: `${base}${guidePath(pack)}` })),
    { lang: 'x-default', url: englishUrl },
  ]
}
