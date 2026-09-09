import { useEffect } from 'react'

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://printxpdf.vercel.app'
export const SITE_NAME = 'PrintxPDF'
export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
}

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

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
  return el
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
  return el
}

/**
 * Sets title, description, canonical, Open Graph, Twitter and JSON-LD for a route.
 * This is a client-rendered SPA, so crawlers that execute JS (Googlebot, Bingbot) read
 * these; the prerender step in scripts/prerender.mjs bakes the same tags into static HTML
 * for crawlers that do not.
 */
export function useSeo({ title, description, path, type = 'website', published, updated, keywords, schema, noindex }: Seo) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    if (keywords?.length) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1' })
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    if (published) upsertMeta('meta[property="article:published_time"]', { property: 'article:published_time', content: published })
    if (updated) upsertMeta('meta[property="article:modified_time"]', { property: 'article:modified_time', content: updated })

    document.querySelectorAll('script[data-seo-jsonld]').forEach((n) => n.remove())
    for (const graph of schema || []) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.dataset.seoJsonld = 'true'
      s.textContent = JSON.stringify(graph)
      document.head.appendChild(s)
    }
  }, [title, description, path, type, published, updated, keywords, schema, noindex])
}

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${SITE_URL}${t.path}` })),
})

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
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: a.title,
  description: a.description,
  abstract: a.answer,
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${a.path}` },
  datePublished: a.published,
  dateModified: a.updated,
  author: PUBLISHER,
  publisher: PUBLISHER,
  keywords: a.keywords.join(', '),
  timeRequired: `PT${a.readMinutes}M`,
  inLanguage: 'en',
  isAccessibleForFree: true,
  // tells assistants which part of the page is the citable answer
  speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.post-answer', 'h1'] },
})

export const howToSchema = (h: { title: string; description: string; steps: { h: string; x: string }[]; path: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: h.title,
  description: h.description,
  totalTime: 'PT3M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
  tool: [{ '@type': 'HowToTool', name: 'A web browser' }],
  step: h.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.h, text: s.x, url: `${SITE_URL}${h.path}#step-${i + 1}` })),
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
