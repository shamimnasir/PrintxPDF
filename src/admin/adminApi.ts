// Talks to the admin endpoints on the Worker. The session lives in sessionStorage rather than
// localStorage so closing the tab ends it, and it is the only credential the browser ever holds:
// the token that can write to the repository stays a Worker secret.
import { API_BASE } from '../lib/api'
import type { Cluster } from '../content/types'

const SESSION_KEY = 'pxp:admin:session'

export type AdminSession = { token: string; expiresAt: number }
export type PublishResult = { sha: string; url: string; branch: string; files: string[] }
export type PublishIssue = { rule: string; where: string; message: string }

export class AdminError extends Error {
  status: number
  code: string
  issues: PublishIssue[]
  constructor(status: number, code: string, message: string, issues: PublishIssue[] = []) {
    super(message)
    this.name = 'AdminError'
    this.status = status
    this.code = code
    this.issues = issues
  }
}

export function readSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as AdminSession
    // treat an almost-expired session as gone, so a publish cannot die halfway through
    return s.token && s.expiresAt * 1000 > Date.now() + 60_000 ? s : null
  } catch {
    return null
  }
}

function writeSession(s: AdminSession | null) {
  try {
    if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* private mode; the session simply will not survive a reload */
  }
}

async function call<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const session = auth ? readSession() : null
  if (auth && !session) throw new AdminError(401, 'admin_unauthorized', 'Sign in again')

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(session ? { authorization: `Bearer ${session.token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new AdminError(0, 'offline', 'Could not reach the server. Check your connection.')
  }

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    /* fall through to the status-based message */
  }

  if (!res.ok) {
    const code = typeof data.code === 'string' ? data.code : `http_${res.status}`
    const message = typeof data.error === 'string' ? data.error : `Request failed (${res.status})`
    if (res.status === 401) writeSession(null)
    throw new AdminError(res.status, code, message, Array.isArray(data.issues) ? (data.issues as PublishIssue[]) : [])
  }
  return data as T
}

export const adminApi = {
  async login(password: string): Promise<AdminSession> {
    const s = await call<AdminSession>('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }, false)
    writeSession(s)
    return s
  },

  /** Confirms the session and returns the commit a draft should be published against. */
  me: () => call<{ ok: true; branch: string; headSha: string }>('/admin/me'),

  signOut() {
    writeSession(null)
  },

  signOutEverywhere: () => call<{ ok: true }>('/admin/signout-everywhere', { method: 'POST' }),

  publish: (body: { message: string; clusters?: Record<string, Cluster>; toolSlugs?: string[]; config?: unknown; baseSha?: string }) =>
    call<PublishResult>('/admin/publish', { method: 'POST', body: JSON.stringify(body) }),
}

/** Turns an AdminError into something worth showing a person. */
export function describeAdminError(e: unknown): string {
  if (!(e instanceof AdminError)) return e instanceof Error ? e.message : 'Something went wrong'
  switch (e.code) {
    case 'admin_not_configured':
    case 'publishing_not_configured':
      return 'Publishing is not set up on the server yet. See worker/README.md for the three secrets it needs.'
    case 'bad_password':
      return 'That password is not right.'
    case 'locked_out':
      return 'Too many failed attempts. Try again in about fifteen minutes.'
    case 'admin_unauthorized':
      return 'Your session expired. Sign in again.'
    case 'stale_draft':
      return 'The repository changed since you loaded this panel. Reload, then publish again.'
    case 'content_invalid':
      return 'The content does not pass its own rules, so nothing was published.'
    case 'github_auth':
      return 'The server could not authenticate to GitHub. The publishing token may have expired.'
    case 'rate_limited':
      return 'Too many requests in a row. Wait a minute and try again.'
    default:
      return e.message
  }
}
