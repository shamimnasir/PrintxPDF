import screens from '../../content/tools/screens.json'

const SHOTS = screens as Record<string, { w: number; h: number }>

export const shotUrl = (slug: string) => (slug in SHOTS ? `${import.meta.env.BASE_URL}screens/tools/${slug}.jpg` : null)
export const shotAbsoluteUrl = (site: string, slug: string) => (slug in SHOTS ? `${site}/screens/tools/${slug}.jpg` : null)
export const shotSize = (slug: string) => SHOTS[slug]
