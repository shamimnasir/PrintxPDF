import data from './localized-guides.json'

export type LocalizedGuide = (typeof data)[number]['guides'][number]
export type LanguagePack = Omit<(typeof data)[number], 'dir'> & { dir: 'ltr' | 'rtl' }

export const LANGUAGE_PACKS = data as LanguagePack[]

export const guidePath = (pack: LanguagePack, slug?: string) =>
  `/${pack.locale.toLowerCase()}/${pack.hub}${slug ? `/${slug}` : ''}`

export function languagePack(locale: string, hub: string): LanguagePack | undefined {
  return LANGUAGE_PACKS.find((p) => p.locale.toLowerCase() === locale.toLowerCase() && p.hub === hub)
}

export function guideAlternates(topic: string, site = 'https://printxpdf.com'): { lang: string; url: string }[] {
  return LANGUAGE_PACKS.flatMap((pack) => {
    const guide = pack.guides.find((g) => g.topic === topic)
    return guide ? [{ lang: pack.locale, url: `${site.replace(/\/$/, '')}${guidePath(pack, guide.slug)}` }] : []
  })
}

export function hubAlternates(site = 'https://printxpdf.com'): { lang: string; url: string }[] {
  return LANGUAGE_PACKS.map((pack) => ({ lang: pack.locale, url: `${site.replace(/\/$/, '')}${guidePath(pack)}` }))
}

export function localizedContentIssues(): string[] {
  const issues: string[] = []
  const locales = new Set<string>()
  const urls = new Set<string>()
  for (const pack of LANGUAGE_PACKS) {
    if (locales.has(pack.locale.toLowerCase())) issues.push(`duplicate locale ${pack.locale}`)
    locales.add(pack.locale.toLowerCase())
    if (!pack.guides.length) issues.push(`${pack.locale} has no guides`)
    for (const guide of pack.guides) {
      const route = guidePath(pack, guide.slug)
      if (urls.has(route)) issues.push(`duplicate URL ${route}`)
      urls.add(route)
      if (!guide.title || !guide.answer || !guide.metaDescription) issues.push(`${route} is missing SEO or answer copy`)
      if (guide.metaTitle.length > 65) issues.push(`${route} meta title exceeds 65 characters`)
      if (guide.metaDescription.length < 100 || guide.metaDescription.length > 165) issues.push(`${route} meta description must be 100 to 165 characters`)
      if (guide.faqs.length < 3) issues.push(`${route} needs at least three visible FAQs`)
      const words = guide.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.steps || []).flatMap((step) => [step.heading, step.text])]).join(' ').trim().split(/\s+/).filter(Boolean).length
      if (words < 250) issues.push(`${route} has only ${words} body words, needs at least 250`)
      if (!guide.tool || !guide.ctaLabel) issues.push(`${route} needs a real tool and localized CTA`)
      for (const prose of [guide.title, guide.answer, ...guide.sections.flatMap((s) => [s.heading, ...s.paragraphs, ...(s.steps || []).flatMap((step) => [step.heading, step.text])]), ...guide.faqs.flatMap((f) => [f.q, f.a])]) {
        if (prose.includes(String.fromCharCode(0x2014))) issues.push(`${route} contains an em dash`)
      }
    }
  }
  const topics = [...new Set(LANGUAGE_PACKS.flatMap((p) => p.guides.map((g) => g.topic)))]
  for (const topic of topics) {
    const present = LANGUAGE_PACKS.filter((p) => p.guides.some((g) => g.topic === topic)).length
    if (present !== LANGUAGE_PACKS.length) issues.push(`${topic} is translated in ${present}/${LANGUAGE_PACKS.length} locales`)
  }
  return issues
}
