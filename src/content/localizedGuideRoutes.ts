import data from './localized-guide-routes.json'

export type LanguageGuideRoute = { topic: string; slug: string }
export type LanguageRoutePack = {
  locale: string
  hub: string
  nativeName: string
  guides: LanguageGuideRoute[]
}

const routeIndex = data as unknown as { packs: LanguageRoutePack[]; englishGuides: { slug: string; cluster: string }[] } | LanguageRoutePack[]
export const LANGUAGE_ROUTES = Array.isArray(routeIndex) ? routeIndex : routeIndex.packs
export const ENGLISH_GUIDE_ROUTES = Array.isArray(routeIndex) ? [] : routeIndex.englishGuides

export const LANGUAGE_DIRECTORY = LANGUAGE_ROUTES.map((pack) => ({
  locale: pack.locale,
  name: pack.nativeName,
  shortName: ({ es: 'Es', 'pt-BR': 'Pt', hi: 'Hi', ar: 'Ar', bn: 'Bn', vi: 'Vi', 'zh-CN': 'Zh' } as Record<string, string>)[pack.locale] || pack.locale,
  path: `/${pack.locale.toLowerCase()}/${pack.hub}`,
  active: true,
}))

export const localizedGuidePath = (pack: Pick<LanguageRoutePack, 'locale' | 'hub'>, slug?: string) =>
  `/${pack.locale.toLowerCase()}/${pack.hub}${slug ? `/${slug}` : ''}`
