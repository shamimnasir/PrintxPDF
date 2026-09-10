// Site configuration for the admin panel.
//
// This site is static (no backend), so config lives in two places:
//   1. public/site-config.json, the published config every visitor gets
//   2. localStorage          , your unpublished draft, visible only in your browser
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
  /** the person credited on every guide and in Organization.founder */
  author: {
    name: string
    title: string
    bio: string
    photo: string
    links: { linkedin: string; x: string; github: string; website: string }
  }
  announcement: { enabled: boolean; text: string; linkText: string; linkUrl: string; dismissible: boolean }
  theme: {
    accent: string
    accentFg: string
    ink: string
    paper: string
    alarm: string
    defaultMode: 'light' | 'dark' | 'system'
    borderWidth: number
    radius: number
    /** site-wide look; see src/design/presets.ts */
    design: 'blocks' | 'paper' | 'studio'
  }
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
  billing: { portalLoginUrl: string }
}

export const DEFAULT_CONFIG: SiteConfig = {
  version: 1,
  updatedAt: '2026-09-09',
  site: {
    name: 'PrintxPDF',
    tagline: 'Print only what matters. Fix any PDF.',
    description: 'Turn any web page into a clean printout or PDF, then merge, sign, shrink, protect or convert any PDF free in your browser. Nothing is uploaded, no account.',
    url: 'https://printxpdf.com',
    email: '',
    twitter: '',
    github: 'https://github.com/shamimnasir/PrintxPDF',
    footerNote: 'Independent project. Not affiliated with any other print or PDF service.',
  },
  author: {
    name: 'Nasir Uddin Shamim',
    title: 'Founder, PrintxPDF',
    bio: 'Nasir builds PrintxPDF and writes every guide on it: how to print web pages without the clutter and how to get PDFs to behave, using tools that keep your files on your own computer.',
    photo: '/author.jpg',
    links: { linkedin: '', x: '', github: '', website: '' },
  },
  announcement: { enabled: false, text: 'New: turn scanned pages into searchable text, right in your browser.', linkText: 'Try it', linkUrl: '/tools/ocr-pdf', dismissible: true },
  theme: { accent: '#2b5bff', accentFg: '#ffffff', ink: '#0f172a', paper: '#ffffff', alarm: '#ff3b1f', defaultMode: 'light', borderWidth: 1, radius: 12, design: 'studio' },
  home: {
    eyebrow: 'Free · {count} tools · Your files never leave your computer',
    headline1: 'Print only what matters.',
    headline2: 'Fix any PDF.',
    lead: 'Paste a link and keep just the article: no ads, no menus, no comment threads. Print it or save it as a PDF. Or drop in a PDF and merge, split, sign, shrink, black out private details, make scans searchable or convert it. Everything happens in your browser, nothing is uploaded, and you never have to sign up.',
    fileCardTitle: 'Drop in a file',
    fileCardText: 'Merge, sign, shrink, convert, protect, black out, {count} tools',
    urlCardTitle: 'Print a web page',
    urlCardText: 'Paste a link. Keep the article, drop the rest.',
    marquee: ['Merge', 'Split', 'Sign', 'Shrink', 'Scan to text', 'Black out', 'Protect', 'Crop', 'Compare', 'Convert', 'Fill forms', 'Scan'],
    showMarquee: true,
    showHowItWorks: true,
    showProducts: true,
    showPrivacy: true,
  },
  pages: {},
  tools: { hidden: [], featured: [], overrides: {} },
  seo: {
    titleTemplate: '%s | PrintxPDF',
    defaultDescription: 'Print web pages without ads and do every common PDF job free in your browser. Nothing is uploaded and you never need an account.',
    keywords: ['print web page without ads', 'pdf tools', 'merge pdf', 'compress pdf', 'sign pdf', 'ocr pdf'],
    robotsTxt: '',
    llmsTxt: '',
    googleVerification: 'slGiktuabKHt-tyfyIWljlwqX3Dj2RoaoKB4sQm1oT4',
    bingVerification: '',
    indexBlog: true,
    noindexAll: false,
  },
  analytics: { ga4Id: 'G-ZZXBGJ8KPF', plausibleDomain: '', umamiId: '', umamiSrc: 'https://cloud.umami.is/script.js', localStats: true, respectDnt: true },
  code: { headHtml: '', bodyEndHtml: '', css: '', js: '' },
  content: { hidden: [], overrides: {} },
  billing: { portalLoginUrl: '' },
}

const DRAFT_KEY = 'pxp:admin:config'
const AUTH_KEY = 'pxp:admin:auth'

type Plain = Record<string, unknown>
const isPlain = (v: unknown): v is Plain => !!v && typeof v === 'object' && !Array.isArray(v)

// keys that would re-parent the merged object or shadow Object.prototype
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

/**
 * Deep merge that lets a partial config override defaults without dropping unknown keys.
 * A patch value only replaces the base when it is the same broad type, so an imported file
 * with `{ marquee: null }` cannot turn an array into null and crash the page that maps it.
 */
export function merge<T>(base: T, patch: unknown): T {
  if (patch === undefined) return base
  if (!isPlain(patch) || !isPlain(base)) {
    // type mismatch (array vs object vs scalar) means the patch is not trustworthy
    if (base !== undefined && base !== null && typeof base !== typeof patch) return base
    if (Array.isArray(base) !== Array.isArray(patch)) return base
    return patch as T
  }
  const out: Plain = { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (UNSAFE_KEYS.has(k)) continue
    out[k] = isPlain(v) && isPlain(out[k]) ? merge(out[k], v) : merge(out[k], v)
  }
  return out as T
}

/** Strips unsafe keys anywhere in an imported payload before it is trusted. */
function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize)
  if (!isPlain(value)) return value
  const out: Plain = {}
  for (const [k, v] of Object.entries(value)) {
    if (UNSAFE_KEYS.has(k)) continue
    out[k] = sanitize(v)
  }
  return out
}

let published: SiteConfig = DEFAULT_CONFIG
let current: SiteConfig = DEFAULT_CONFIG
let booted = false
/** True once the published config has been fetched (or found missing). */
export const isBooted = () => booted
const listeners = new Set<(c: SiteConfig) => void>()

/** Persists a value, reporting failure instead of throwing (quota, private mode, blocked storage). */
function writeRaw(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

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

/** Installs the published config directly: the static renderer and the inline copy in built pages use this. */
export function setPublishedConfig(json: Partial<SiteConfig>) {
  published = merge(DEFAULT_CONFIG, json)
  booted = true
  recompute()
}

// Built pages carry the published config inline, so the first render (and hydration of the
// static HTML) already sees it; the dev server has no inline copy and fetches instead.
if (typeof document !== 'undefined') {
  try {
    const inline = document.getElementById('pxp-config')?.textContent
    if (inline) setPublishedConfig(JSON.parse(inline) as Partial<SiteConfig>)
  } catch {
    // malformed inline config, the fetch below is the fallback
  }
}

/** Fetches the published config once at boot, then layers the local draft on top. */
export async function bootConfig(): Promise<SiteConfig> {
  if (booted) return current
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}site-config.json`, { cache: 'no-cache' })
    if (res.ok) {
      const json = (await res.json()) as Partial<SiteConfig>
      published = merge(DEFAULT_CONFIG, json)
    }
  } catch {
    // no published config yet, defaults are the site
  }
  booted = true
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
export function updateConfig(patch: Partial<SiteConfig>): boolean {
  const draft = merge(readDraft() || {}, patch) as Partial<SiteConfig>
  draft.updatedAt = new Date().toISOString().slice(0, 10)
  if (!writeRaw(DRAFT_KEY, draft)) return false
  recompute()
  return true
}

export function discardDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* storage blocked */
  }
  recompute()
}

/** True when the payload contains code that RuntimeEffects will execute on every page. */
export function importCarriesCode(json: string): boolean {
  try {
    const c = (sanitize(JSON.parse(json)) as Partial<SiteConfig>)?.code
    return !!(c && (c.js?.trim() || c.headHtml?.trim() || c.bodyEndHtml?.trim()))
  } catch {
    return false
  }
}

export function importConfig(json: string) {
  const parsed = sanitize(JSON.parse(json)) as Partial<SiteConfig>
  if (!isPlain(parsed)) throw new Error('That file is not a config object.')
  // merge against the defaults first so type mismatches are rejected before anything is stored
  const safe = merge(DEFAULT_CONFIG, parsed)
  if (!writeRaw(DRAFT_KEY, safe)) throw new Error('Browser storage is full, so the import was not saved.')
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
  try {
    const expected = localStorage.getItem('pxp:admin:pass') || DEFAULT_PASSCODE
    if (pass !== expected) return false
    localStorage.setItem(AUTH_KEY, 'ok')
    return true
  } catch {
    return false
  }
}
export function lock() {
  try {
    localStorage.removeItem(AUTH_KEY)
  } catch {
    /* storage blocked */
  }
}
export function setPasscode(next: string) {
  try {
    localStorage.setItem('pxp:admin:pass', next)
  } catch {
    /* storage blocked */
  }
}

/** sessionStorage/localStorage access throws outright when site data is blocked. */
export function safeStorage(kind: 'local' | 'session') {
  try {
    const s = kind === 'local' ? window.localStorage : window.sessionStorage
    s.getItem('__probe')
    return s
  } catch {
    return null
  }
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
