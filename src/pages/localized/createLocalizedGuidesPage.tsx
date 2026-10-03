import LocalizedGuidePage from '../LocalizedGuidePage'
import { LANGUAGE_PACKS, normalizeLocalizedGuides } from '../../content/localizedGuides'
import type { LocalizedGuide } from '../../content/localizedGuides'

export function createLocalizedGuidesPage(locale: string, guides: unknown) {
  const base = LANGUAGE_PACKS.find((pack) => pack.locale === locale)
  if (!base) throw new Error(`Missing localized guide hub for ${locale}`)
  const pack = { ...base, guides: [...base.guides, ...normalizeLocalizedGuides(guides as (Partial<LocalizedGuide> & { description?: string })[])] }
  return function LocalizedGuidesRoute() {
    return <LocalizedGuidePage pack={pack} />
  }
}
