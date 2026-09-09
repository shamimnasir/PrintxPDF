import { useEffect } from 'react'

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://printxpdf.com'
export const SITE_NAME = 'PrintxPDF'
export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
}

export type AuthorInfo = { name: string; title: string; bio: string; photo: string; links: Record<string, string> }

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const authorPath = (a: { name: string }) => `/author/${slugify(a.name)}`

/** Person node for the founder/author. `@id` lets Article.author and Organization.founder point at one entity. */
export const authorPerson = (a: AuthorInfo) => ({
  '@type': 'Person',
  '@id': `${SITE_URL}${authorPath(a)}#person`,
  name: a.name,
  jobTitle: a.title,
  url: `${SITE_URL}${authorPath(a)}`,
  ...(a.photo ? { image: a.photo } : {}),
  ...(a.bio ? { description: a.bio } : {}),
  sameAs: Object.values(a.links || {}).filter(Boolean),
  worksFor: PUBLISHER,
})

/** Organization with its founder attached; used as `publisher` wherever the author is known. */
export const orgSchema = (author?: AuthorInfo) => (author ? { ...PUBLISHER, founder: authorPerson(author) } : PUBLISHER)

export const profileSchema = (a: AuthorInfo, knowsAbout: string[] = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: `${SITE_URL}${authorPath(a)}`,
  mainEntity: { ...authorPerson(a), ...(knowsAbout.length ? { knowsAbout } : {}) },
})

type Seo = {
  title: string
  description: string
  /** path with leading slash, e.g. /blog/merge-pdf */
  path: string
  type?: 'website' | 'article'
  published?: string
  updated?: string
  keywords?: string[]
  /** one or more JSON-LD graphs */
  schema?: Record<string, unknown>[]
  noindex?: boolean
}

/** Every meta tag this hook owns. Anything not supplied for a route is removed, so state
 *  from the previous route can never leak onto the next one. */
const MANAGED = [
  'meta[name="description"]',
  'meta[name="keywords"]',
  'meta[name="robots"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:type"]',
  'meta[property="og:site_name"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[property="article:published_time"]',
  'meta[property="article:modified_time"]',
]

function setMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  el.dataset.seo = 'true'
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets title, description, canonical, Open Graph, Twitter and JSON-LD for a route.
 *
 * Every page must call this. Tags it manages are cleared first, so a route that omits
 * (say) `published` cannot inherit the previous route's article dates, and JSON-LD from
 * an article never follows the visitor onto a marketing page.
 *
 * The `schema` and `keywords` props are usually fresh array literals, so the effect keys
 * off their serialised form rather than object identity, otherwise every unrelated
 * re-render would tear down and rebuild the structured data.
 */
export function useSeo({ title, description, path, type = 'website', published, updated, keywords, schema, noindex }: Seo) {
  const schemaKey = schema ? JSON.stringify(schema) : ''
  const keywordsKey = keywords?.join(',') || ''

  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title

    // clear everything this hook owns before writing the new route's tags
    MANAGED.forEach((sel) => document.head.querySelector(sel)?.remove())
    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove())

    setMeta('meta[name="description"]', { name: 'description', content: description })
    if (keywordsKey) setMeta('meta[name="keywords"]', { name: 'keywords', content: keywordsKey })
    setMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1' })
    upsertLink('canonical', url)

    setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    if (published) setMeta('meta[property="article:published_time"]', { property: 'article:published_time', content: published })
    if (updated) setMeta('meta[property="article:modified_time"]', { property: 'article:modified_time', content: updated })

    if (schemaKey) {
      for (const graph of JSON.parse(schemaKey) as Record<string, unknown>[]) {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.dataset.seoJsonld = 'true'
        s.textContent = JSON.stringify(graph)
        document.head.appendChild(s)
      }
    }
  }, [title, description, path, type, published, updated, keywordsKey, schemaKey, noindex])
}

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${SITE_URL}${t.path}` })),
})

/** Only emit this when the questions and answers are actually rendered on the page , 
 *  Google requires FAQ markup to match visible content. */
export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})

export const articleSchema = (a: {
  title: string
  description: string
  path: string
  published: string
  updated: string
  keywords: string[]
  answer: string
  readMinutes: number
  author?: AuthorInfo
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  abstract: a.answer,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${a.path}` },
  datePublished: a.published,
  dateModified: a.updated,
  author: a.author ? authorPerson(a.author) : PUBLISHER,
  publisher: orgSchema(a.author),
  keywords: a.keywords.join(', '),
  timeRequired: `PT${a.readMinutes}M`,
  inLanguage: 'en',
  isAccessibleForFree: true,
  // tells assistants which part of the page is the citable answer
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.post-answer', 'h1'] },
})

export const howToSchema = (h: { title: string; description: string; steps: { h: string; x: string }[]; path: string; anchors: string[] }) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: h.title,
  description: h.description,
  totalTime: 'PT3M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
  step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.h, text: s.x, url: `${SITE_URL}${h.path}#${h.anchors[i]}` })),
})

export const softwareSchema = (s: { name: string; description: string; path: string; category?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: s.name,
  description: s.description,
  url: `${SITE_URL}${s.path}`,
  applicationCategory: s.category || 'UtilitiesApplication',
  operatingSystem: 'Any (web browser)',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: PUBLISHER,
})
