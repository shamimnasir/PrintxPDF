// Tiny localStorage-backed store for the account features. Everything here stays in the
// browser; the one server-side fact is the entitlement, a signed key that points at a
// Stripe subscription, which api.printxpdf.com verifies whenever it is used.

import type { Entitlement, Plan } from './api'

export type User = { email: string; name: string; plan: Plan; createdAt: string; entitlement?: Entitlement }
export type SavedDoc = { id: string; title: string; url?: string; html: string; savedAt: string }
export type Signature = { id: string; name: string; dataUrl: string; createdAt: string }
export type Settings = {
  theme: 'light' | 'dark' | 'system'
  defaultTextSize: 'S' | 'M' | 'L' | 'XL'
  defaultImageSize: 'full' | 'large' | 'small' | 'none'
  defaultPageSize: 'A4' | 'Letter'
}

const KEYS = {
  user: 'pxp:user',
  docs: 'pxp:docs',
  sigs: 'pxp:signatures',
  settings: 'pxp:settings',
  history: 'pxp:history',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
/** Returns false when the browser refused the write (quota exceeded, private mode). */
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('pxp:store', { detail: key }))
    return true
  } catch {
    return false
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const store = {
  getUser: () => read<User | null>(KEYS.user, null),
  signIn(email: string, name?: string) {
    const existing = read<User | null>(KEYS.user, null)
    const user: User =
      existing && existing.email === email
        ? existing
        : {
            email,
            name: name || email.split('@')[0],
            plan: 'free',
            createdAt: new Date().toISOString(),
          }
    write(KEYS.user, user)
    return user
  },
  updateUser(patch: Partial<User>) {
    const u = read<User | null>(KEYS.user, null)
    if (!u) return null
    const next = { ...u, ...patch }
    write(KEYS.user, next)
    return next
  },
  /** Records a paid plan from the API's entitlement, creating the local account if there is none. */
  setEntitlement(e: Entitlement) {
    const u = read<User | null>(KEYS.user, null)
    const base: User = u
      ? { ...u, email: e.email || u.email }
      : { email: e.email, name: e.email.split('@')[0] || 'You', plan: 'free', createdAt: new Date().toISOString() }
    const next: User = { ...base, plan: e.plan, entitlement: e }
    write(KEYS.user, next)
    return next
  },
  signOut: () => {
    localStorage.removeItem(KEYS.user)
    window.dispatchEvent(new CustomEvent('pxp:store', { detail: KEYS.user }))
  },

  getDocs: () => read<SavedDoc[]>(KEYS.docs, []),
  /** Returns null when nothing could be persisted (storage quota). */
  saveDoc(doc: Omit<SavedDoc, 'id' | 'savedAt'>): SavedDoc | null {
    const docs = read<SavedDoc[]>(KEYS.docs, [])
    const d: SavedDoc = { ...doc, id: uid(), savedAt: new Date().toISOString() }
    return write(KEYS.docs, [d, ...docs].slice(0, 50)) ? d : null
  },
  deleteDoc(id: string) {
    write(
      KEYS.docs,
      read<SavedDoc[]>(KEYS.docs, []).filter((d) => d.id !== id),
    )
  },

  getSignatures: () => read<Signature[]>(KEYS.sigs, []),
  addSignature(name: string, dataUrl: string): Signature | null {
    const s: Signature = { id: uid(), name, dataUrl, createdAt: new Date().toISOString() }
    return write(KEYS.sigs, [s, ...read<Signature[]>(KEYS.sigs, [])]) ? s : null
  },
  deleteSignature(id: string) {
    write(
      KEYS.sigs,
      read<Signature[]>(KEYS.sigs, []).filter((s) => s.id !== id),
    )
  },

  getSettings: (): Settings =>
    read<Settings>(KEYS.settings, {
      theme: 'system',
      defaultTextSize: 'M',
      defaultImageSize: 'large',
      defaultPageSize: 'A4',
    }),
  setSettings(patch: Partial<Settings>) {
    const next = { ...store.getSettings(), ...patch }
    write(KEYS.settings, next)
    return next
  },

  getHistory: () => read<{ url: string; title: string; at: string }[]>(KEYS.history, []),
  pushHistory(url: string, title: string) {
    const h = read<{ url: string; title: string; at: string }[]>(KEYS.history, []).filter((x) => x.url !== url)
    write(KEYS.history, [{ url, title, at: new Date().toISOString() }, ...h].slice(0, 20))
  },
}

export function applyTheme(theme: Settings['theme']) {
  const root = document.documentElement
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
}
