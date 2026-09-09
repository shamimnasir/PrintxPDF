// Site configuration for the admin panel.
//
// This site is static (no backend), so config lives in two places:
//   1. public/site-config.json — the published config every visitor gets
//   2. localStorage           — your unpublished draft, visible only in your browser
//
// The admin panel edits the draft. "Publish" exports the JSON so you can drop it into
// public/site-config.json and redeploy, which makes the change live for everyone.

export type ToolOverride = { name?: string; short?: string; description?: string }
export type PostOverride = { title?: string; metaTitle?: string; metaDescription?: string; answer?: string }

export type SiteConfig = {
  version: number
  updatedAt: string
  site: {
    name: string
    tagline: string
    description: string
    url: string
    email: string
    twitter: string
    github: string
    footerNote: string
  }
  announcement: { enabled: boolean; text: string; linkText: string; linkUrl: string; dismissible: boolean }
  theme: { accent: string; accentFg: string; ink: string; paper: string; alarm: string; defaultMode: 'light' | 'dark' | 'system'; borderWidth: number; radius: number }
  home: {
    eyebrow: string
    headline1: string
    headline2: string
    lead: string
    fileCardTitle: string
    fileCardText: string
    urlCardTitle: string
    urlCardText: string
    marquee: string[]
    showMarquee: boolean
    showHowItWorks: boolean
    showProducts: boolean
    showPrivacy: boolean
  }
  pages: Record<string, { metaTitle?: string; metaDescription?: string; heading?: string; intro?: string; hidden?: boolean }>
  tools: { hidden: string[]; featured: string[]; overrides: Record<string, ToolOverride> }
  seo: {
    titleTemplate: string
    defaultDescription: string
    keywords: string[]
    robotsTxt: string
    llmsTxt: string
    googleVerification: string
    bingVerification: string
    indexBlog: boolean
    noindexAll: boolean
  }
  analytics: { ga4Id: string; plausibleDomain: string; umamiId: string; umamiSrc: string; localStats: boolean; respectDnt: boolean }
  code: { headHtml: string; bodyEndHtml: string; css: string; js: string }
  content: { hidden: string[]; overrides: Record<string, PostOverride> }
}

export const DEFAULT_CONFIG: SiteConfig = {
  version: 1,
  updatedAt: '2026-09-09',
  site: {
    name: 'PrintxPDF',
    tagline: 'Cut the clutter. Own your PDFs.',
    description: 'Strip ads from web pages before you print, and run every common PDF job in your browser. Free, no upload, no sign-up.',
    url: 'https://printxpdf.vercel.app',
    email: '',
    twitter: '',
    github: 'https://github.com/shamimnasir/PrintxPDF',
    footerNote: 'Demo project. Not affiliated with any other print or PDF service.',
  },
  announcement: { enabled: false, text: 'New: OCR now runs fully offline in your browser.', linkText: 'Try it', linkUrl: '/tools/ocr-pdf', dismissible: true },
  theme: { accent: '#2b5bff', accentFg: '#ffffff', ink: '#0b0b0f', paper: '#ffffff', alarm: '#ff3b1f', defaultMode: 'system', borderWidth: 3, radius: 0 },
  home: {
    eyebrow: 'Free · No uploads · Works offline once loaded',
    headline1: 'Cut the clutter.',
    headline2: 'Own your PDFs.',
    lead: 'Strip ads and menus from any web page before you print. Then merge, split, sign, compress and convert PDFs, all inside your browser. Nothing is uploaded, ever.',
    fileCardTitle: 'Work with a file',
    fileCardText: 'Compress, sign, convert, merge, organize',
    urlCardTitle: 'Print or PDF a web page',
    urlCardText: 'Paste a URL, we strip the ads and clutter',
    marquee: ['Northwind Post', 'Kestrel Labs', 'Harbor Health', 'Meridian U', 'Tabula Legal', 'Orbit Studio', 'Bluebell Schools', 'Fjord Bank'],
    showMarquee: true,
    showHowItWorks: true,
    showProducts: true,
    showPrivacy: true,
  },
  pages: {},
  tools: { hidden: [], featured: [], overrides: {} },
  seo: {
    titleTemplate: '%s — PrintxPDF',
    defaultDescription: 'Print web pages without ads and run every common PDF job free in your browser.',
    keywords: ['print web page without ads', 'pdf tools', 'merge pdf', 'compress pdf', 'sign pdf', 'ocr pdf'],
    robotsTxt: '',
    llmsTxt: '',
    googleVerification: '',
    bingVerification: '',
    indexBlog: true,
    noindexAll: false,
  },
  analytics: { ga4Id: '', plausibleDomain: '', umamiId: '', umamiSrc: 'https://cloud.umami.is/script.js', localStats: true, respectDnt: true },
  code: { headHtml: '', bodyEndHtml: '', css: '', js: '' },
  content: { hidden: [], overrides: {} },
}

const DRAFT_KEY = 'pxp:admin:config'
const AUTH_KEY = 'pxp:admin:auth'

type Plain = Record<string, unknown>
const isPlain = (v: unknown): v is Plain => !!v && typeof v === 'object' && !Array.isArray(v)

/** Deep merge that lets a partial config override defaults without dropping unknown keys. */
export function merge<T>(base: T, patch: unknown): T {
  if (!isPlain(patch) || !isPlain(base)) return (patch === undefined ? base : (patch as T))
  const out: Plain = { ...base }
  for (const [k, v] of Object.entries(patch)) {
    out[k] = isPlain(v) && isPlain(out[k]) ? merge(out[k], v) : v
  }
  return out as T
}

let published: SiteConfig = DEFAULT_CONFIG
let current: SiteConfig = DEFAULT_CONFIG
const listeners = new Set<(c: SiteConfig) => void>()

function readDraft(): Partial<SiteConfig> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Partial<SiteConfig>) : null
  } catch {
    return null
  }
}

function recompute() {
  const draft = readDraft()
  current = draft ? merge(published, draft) : published
  listeners.forEach((fn) => fn(current))
}

/** Fetches the published config once at boot, then layers the local draft on top. */
export async function bootConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}site-config.json`, { cache: 'no-cache' })
    if (res.ok) {
      const json = (await res.json()) as Partial<SiteConfig>
      published = merge(DEFAULT_CONFIG, json)
    }
  } catch {
    // no published config yet — defaults are the site
  }
  recompute()
  return current
}

export const getConfig = () => current
export const getPublished = () => published
export const hasDraft = () => readDraft() !== null

export function subscribeConfig(fn: (c: SiteConfig) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Saves a partial change into the local draft. */
export function updateConfig(patch: Partial<SiteConfig>) {
  const draft = merge(readDraft() || {}, patch) as Partial<SiteConfig>
  draft.updatedAt = new Date().toISOString().slice(0, 10)
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    return false
  }
  recompute()
  return true
}

export function discardDraft() {
  localStorage.removeItem(DRAFT_KEY)
  recompute()
}

export function importConfig(json: string) {
  const parsed = JSON.parse(json) as Partial<SiteConfig>
  localStorage.setItem(DRAFT_KEY, JSON.stringify(parsed))
  recompute()
  return current
}

/** The file you drop into public/site-config.json. */
export const exportConfig = () => JSON.stringify(current, null, 2)

// ---------- admin access ----------
// Client-side only. This gates the UI, it is NOT a security boundary: the panel
// edits a local draft, and publishing requires repository access anyway.
const DEFAULT_PASSCODE = 'printxpdf'

export function isUnlocked() {
  try {
    return localStorage.getItem(AUTH_KEY) === 'ok'
  } catch {
    return false
  }
}
export function unlock(pass: string) {
  const expected = localStorage.getItem('pxp:admin:pass') || DEFAULT_PASSCODE
  if (pass !== expected) return false
  localStorage.setItem(AUTH_KEY, 'ok')
  return true
}
export function lock() {
  localStorage.removeItem(AUTH_KEY)
}
export function setPasscode(next: string) {
  localStorage.setItem('pxp:admin:pass', next)
}

// ---------- local analytics ----------
export type Hit = { path: string; t: number; ref: string }
const HITS_KEY = 'pxp:stats'

export function trackPageview(path: string) {
  const c = getConfig()
  if (!c.analytics.localStats) return
  if (c.analytics.respectDnt && (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1')) return
  try {
    const hits: Hit[] = JSON.parse(localStorage.getItem(HITS_KEY) || '[]')
    hits.push({ path, t: Date.now(), ref: document.referrer ? new URL(document.referrer).hostname : 'direct' })
    localStorage.setItem(HITS_KEY, JSON.stringify(hits.slice(-2000)))
  } catch {
    /* private mode or quota */
  }
}

export function getHits(): Hit[] {
  try {
    return JSON.parse(localStorage.getItem(HITS_KEY) || '[]') as Hit[]
  } catch {
    return []
  }
}
export const clearHits = () => localStorage.removeItem(HITS_KEY)
