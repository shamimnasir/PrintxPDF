/**
 * Site-wide design presets.
 *
 * Pure data, no React. The CSS side lives in src/index.css under
 * "Design presets": each preset is a `[data-design='…']` token block, and
 * the runtime sets `<html data-design>` (plus loads `fontHref()` for the
 * non-default fonts) when one is chosen.
 */
export type DesignId = 'blocks' | 'paper' | 'studio'

export type DesignPreset = {
  id: DesignId
  name: string
  tagline: string
  /** values written into cfg.theme when the preset is chosen */
  theme: { accent: string; accentFg: string; ink: string; borderWidth: number; radius: number }
  /** Google Fonts families this preset needs; index.html only loads the design-independent mono */
  googleFamilies: string[]
  swatch: { bg: string; card: string; ink: string; accent: string; fontDisplay: string }
}

export const DESIGNS: Record<DesignId, DesignPreset> = {
  blocks: {
    id: 'blocks',
    name: 'Blocks',
    tagline: 'Electric brutalist: hard edges, thick rules, offset shadows.',
    theme: { accent: '#2b5bff', accentFg: '#ffffff', ink: '#0b0b0f', borderWidth: 3, radius: 0 },
    googleFamilies: ['Archivo+Black', 'Archivo:wght@400;500;600;700;800;900'],
    swatch: { bg: '#ffffff', card: '#ffffff', ink: '#0b0b0f', accent: '#2b5bff', fontDisplay: "'Archivo Black', 'Archivo', Impact, sans-serif" },
  },
  paper: {
    id: 'paper',
    name: 'Paper',
    tagline: 'A printed book: serif type, hairline rules, warm cream stock.',
    theme: { accent: '#a3341f', accentFg: '#ffffff', ink: '#2a2419', borderWidth: 1, radius: 2 },
    googleFamilies: ['Fraunces:opsz,wght@9..144,600;9..144,700', 'Source+Serif+4:ital,wght@0,400;0,600;1,400'],
    swatch: { bg: '#fbf7ee', card: '#fffdf8', ink: '#2a2419', accent: '#a3341f', fontDisplay: "'Fraunces', Georgia, serif" },
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    tagline: 'Classic SaaS: soft shadows, rounded cards, cool greys.',
    theme: { accent: '#2b5bff', accentFg: '#ffffff', ink: '#0f172a', borderWidth: 1, radius: 12 },
    googleFamilies: ['Inter:wght@400;500;600;700;800'],
    swatch: { bg: '#f6f8fb', card: '#ffffff', ink: '#0f172a', accent: '#2b5bff', fontDisplay: "'Inter', system-ui, sans-serif" },
  },
}

export const DESIGN_IDS: DesignId[] = ['blocks', 'paper', 'studio']

export const isDesignId = (s: unknown): s is DesignId => typeof s === 'string' && DESIGN_IDS.some((id) => id === s)

/** Google Fonts stylesheet for a preset's families; null only if a preset needs no extra face. */
export function fontHref(id: DesignId): string | null {
  const families = DESIGNS[id].googleFamilies
  if (families.length === 0) return null
  return `https://fonts.googleapis.com/css2?${families.map((f) => 'family=' + f).join('&')}&display=swap`
}
