import esPosts from './localized-posts/es.json'
import ptPosts from './localized-posts/pt-BR.json'
import hiPosts from './localized-posts/hi.json'
import hiBatch1 from './localized-posts/hi-chatgpt-1.json'
import hiBatch2 from './localized-posts/hi-chatgpt-2.json'
import hiBatch3 from './localized-posts/hi-chatgpt-3.json'
import hiBatch4 from './localized-posts/hi-chatgpt-4.json'
import hiBatch5 from './localized-posts/hi-chatgpt-5.json'
import hiBatch6 from './localized-posts/hi-chatgpt-6.json'
import hiBatch7 from './localized-posts/hi-chatgpt-7.json'
import hiBatch8 from './localized-posts/hi-chatgpt-8.json'
import arPosts from './localized-posts/ar.json'
import arBatch1 from './localized-posts/ar-chatgpt-1.json'
import arBatch2 from './localized-posts/ar-chatgpt-2.json'
import arBatch3 from './localized-posts/ar-chatgpt-3.json'
import arBatch4 from './localized-posts/ar-chatgpt-4.json'
import arBatch5 from './localized-posts/ar-chatgpt-5.json'
import arBatch6 from './localized-posts/ar-chatgpt-6.json'
import arBatch7 from './localized-posts/ar-chatgpt-7.json'
import arBatch8 from './localized-posts/ar-chatgpt-8.json'
import arBatch9 from './localized-posts/ar-chatgpt-9.json'
import arBatch10 from './localized-posts/ar-chatgpt-10.json'
import arBatch11 from './localized-posts/ar-chatgpt-11.json'
import bnPosts from './localized-posts/bn.json'
import bnBatch1 from './localized-posts/bn-chatgpt-1.json'
import bnBatch2 from './localized-posts/bn-chatgpt-2.json'
import bnBatch3 from './localized-posts/bn-chatgpt-3.json'
import bnBatch4 from './localized-posts/bn-chatgpt-4.json'
import bnBatch5 from './localized-posts/bn-chatgpt-5.json'
import bnBatch6 from './localized-posts/bn-chatgpt-6.json'
import bnBatch7 from './localized-posts/bn-chatgpt-7.json'
import bnBatch8 from './localized-posts/bn-chatgpt-8.json'
import bnBatch9 from './localized-posts/bn-chatgpt-9.json'
import bnBatch10 from './localized-posts/bn-chatgpt-10.json'
import bnBatch11 from './localized-posts/bn-chatgpt-11.json'
import viPosts from './localized-posts/vi.json'
import viBatch1 from './localized-posts/vi-chatgpt-1.json'
import zhPosts from './localized-posts/zh-CN.json'
import { LANGUAGE_PACKS as basePacks, guidePath, normalizeLocalizedGuides } from './localizedGuides'
import type { LanguagePack, LocalizedGuide } from './localizedGuides'
export { guidePath } from './localizedGuides'

const translations: { locale: string; guides: LocalizedGuide[] }[] = [esPosts, ptPosts, { ...hiPosts, guides: [...hiPosts.guides, ...hiBatch1.guides, ...hiBatch2.guides, ...hiBatch3.guides, ...hiBatch4.guides, ...hiBatch5.guides, ...hiBatch6.guides, ...hiBatch7.guides, ...hiBatch8.guides] }, { ...arPosts, guides: [...arPosts.guides, ...arBatch1.guides, ...arBatch2.guides, ...arBatch3.guides, ...arBatch4.guides, ...arBatch5.guides, ...arBatch6.guides, ...arBatch7.guides, ...arBatch8.guides, ...arBatch9.guides, ...arBatch10.guides, ...arBatch11.guides] }, { ...bnPosts, guides: [...bnPosts.guides, ...bnBatch1.guides, ...bnBatch2.guides, ...bnBatch3.guides, ...bnBatch4.guides, ...bnBatch5.guides, ...bnBatch6.guides, ...bnBatch7.guides, ...bnBatch8.guides, ...bnBatch9.guides, ...bnBatch10.guides, ...bnBatch11.guides] }, { ...viPosts, guides: [...viPosts.guides, ...viBatch1.guides] }, zhPosts]
  .map((entry) => ({ ...entry, guides: normalizeLocalizedGuides(entry.guides as (Partial<LocalizedGuide> & { description?: string })[]) }))

export const LANGUAGE_PACKS: LanguagePack[] = basePacks.map((pack) => ({
  ...pack,
  guides: [...pack.guides, ...(translations.find((entry) => entry.locale === pack.locale)?.guides || [])],
}))

export function languagePack(locale: string, hub: string): LanguagePack | undefined {
  return LANGUAGE_PACKS.find((pack) => pack.locale.toLowerCase() === locale.toLowerCase() && pack.hub === hub)
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
      if (guide.metaTitle.length > 90) issues.push(`${route} meta title exceeds 90 characters`)
      const cjk = /[\u3400-\u9fff]/u.test(`${guide.title} ${guide.answer}`)
      const descriptionMin = cjk ? 45 : 100
      const descriptionMax = cjk ? 180 : 220
      if (guide.metaDescription.length < descriptionMin || guide.metaDescription.length > descriptionMax) issues.push(`${route} meta description must be ${descriptionMin} to ${descriptionMax} characters`)
      if (guide.faqs.length < 3) issues.push(`${route} needs at least three visible FAQs`)
      const body = guide.body
        ? JSON.stringify(guide.body)
        : (guide.sections || []).flatMap((section) => [section.heading, ...section.paragraphs, ...(section.steps || []).flatMap((step) => [step.heading, step.text])]).join(' ')
      const hasCjk = /[\u3400-\u9fff]/u.test(body)
      const words = body.trim().split(/\s+/).filter(Boolean).length
      const cjkCharacters = [...body.replace(/\s/g, '')].length
      if (hasCjk ? cjkCharacters < 800 : words < 250) issues.push(`${route} has ${hasCjk ? `${cjkCharacters} CJK characters` : `${words} body words`}, needs ${hasCjk ? 'at least 800 CJK characters' : 'at least 250 words'}`)
      if (!guide.tool || !guide.ctaLabel) issues.push(`${route} needs a real tool and localized CTA`)
      for (const prose of [guide.title, guide.answer, body, ...guide.faqs.flatMap((faq) => [faq.q, faq.a])]) {
        if (prose.includes(String.fromCharCode(0x2014))) issues.push(`${route} contains an em dash`)
      }
    }
  }
  const topics = [...new Set(LANGUAGE_PACKS.flatMap((pack) => pack.guides.map((guide) => guide.topic)))]
  for (const topic of topics) {
    const present = LANGUAGE_PACKS.filter((pack) => pack.guides.some((guide) => guide.topic === topic)).length
    if (present !== LANGUAGE_PACKS.length) issues.push(`${topic} is translated in ${present}/${LANGUAGE_PACKS.length} locales`)
  }
  return issues
}
