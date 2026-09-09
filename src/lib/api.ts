// Client for api.printxpdf.com — the only server this site talks to. It handles billing
// (Stripe Checkout and the customer portal, via the Worker) and the four conversions that
// need a real layout engine. Everything else on the site runs in the browser.
import { stripExt } from './download'
import type { Output } from '../components/ui/ResultList'

export const API_BASE = ((import.meta.env.VITE_API_BASE as string | undefined) || 'https://api.printxpdf.com').replace(/\/$/, '')

export type Plan = 'free' | 'pro' | 'api'
export type PaidPlan = Exclude<Plan, 'free'>
/** What the Worker hands back after a paid checkout. The token is the user's access key. */
export type Entitlement = { token: string; plan: PaidPlan; email: string; customerId: string; currentPeriodEnd: number }
export type Me = {
  plan: Plan
  active: boolean
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
  usage: { used: number; limit: number }
  /** a refreshed key, present only when the current one is close to expiry */
  token?: string
}

export class ApiError extends Error {
  status: number
  code: string
  data: Record<string, unknown>
  constructor(status: number, code: string, message: string, data: Record<string, unknown> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
  }
}

const STATUS_TEXT: Record<number, string> = {
  0: 'Could not reach the PrintxPDF server',
  413: 'File too large',
  429: 'Too many requests',
  500: 'Server error',
  502: 'Upstream error',
  503: 'Service unavailable',
  504: 'Timed out',
}

const toError = (status: number, json: Record<string, unknown> | null) =>
  new ApiError(status, String(json?.code || `http_${status}`), String(json?.error || STATUS_TEXT[status] || `Request failed (${status})`), json || {})

const parseJson = (text: string): Record<string, unknown> | null => {
  try {
    return text ? (JSON.parse(text) as Record<string, unknown>) : null
  } catch {
    return null
  }
}

async function call<T>(path: string, init: RequestInit = {}, fetchImpl: typeof fetch = fetch): Promise<T> {
  let res: Response
  try {
    res = await fetchImpl(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiError(0, 'network', STATUS_TEXT[0])
  }
  const json = parseJson(await res.text())
  if (!res.ok) throw toError(res.status, json)
  return json as T
}

const bearer = (token: string) => ({ authorization: `Bearer ${token}` })
const post = (body?: unknown, headers: Record<string, string> = {}): RequestInit =>
  body === undefined ? { method: 'POST', headers } : { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }

export const billing = {
  /** Starts Stripe Checkout; the caller redirects to `url`. Works signed-out — Checkout collects the email. */
  checkout: (plan: PaidPlan, email?: string) => call<{ url: string; id: string }>('/billing/checkout', post({ plan, email: email || undefined })),
  /** Exchanges a completed checkout session for the entitlement. Idempotent, so a page refresh is safe. */
  session: (id: string) => call<Entitlement>(`/billing/session?id=${encodeURIComponent(id)}`),
  me: (token: string) => call<Me>('/billing/me', { headers: bearer(token) }),
  portal: (token: string) => call<{ url: string }>('/billing/portal', post(undefined, bearer(token))),
  rotate: (token: string) => call<{ token: string }>('/billing/rotate', post(undefined, bearer(token))),
}

/** The key's payload is plain base64url JSON; only the signature is secret. Never trust it for access — the server does. */
export function decodeToken(token: string): { sub: string; email: string; plan: PaidPlan; exp: number } | null {
  try {
    if (!token.startsWith('pxp_')) return null
    const payload = token.slice(4).split('.')[0]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '='))
    const c = JSON.parse(json) as { sub?: unknown; email?: unknown; plan?: unknown; exp?: unknown }
    return typeof c.sub === 'string' && (c.plan === 'pro' || c.plan === 'api')
      ? { sub: c.sub, email: String(c.email || ''), plan: c.plan, exp: Number(c.exp || 0) }
      : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------- conversions

export const CONVERT_KINDS = ['ppt-to-pdf', 'pdf-to-ppt', 'epub-to-pdf', 'mobi-to-pdf', 'protect-pdf', 'unlock-pdf', 'pdf-to-pdfa', 'ebook-converter'] as const
export type ConvertKind = (typeof CONVERT_KINDS)[number]
export const isConvertKind = (s: string): s is ConvertKind => (CONVERT_KINDS as readonly string[]).includes(s)
const OUT_EXT: Record<ConvertKind, string> = { 'ppt-to-pdf': 'pdf', 'pdf-to-ppt': 'pptx', 'epub-to-pdf': 'pdf', 'mobi-to-pdf': 'pdf', 'protect-pdf': 'pdf', 'unlock-pdf': 'pdf', 'pdf-to-pdfa': 'pdf', 'ebook-converter': 'epub' }
const OUT_SUFFIX: Partial<Record<ConvertKind, string>> = { 'protect-pdf': '-protected', 'unlock-pdf': '-unlocked', 'pdf-to-pdfa': '-pdfa' }
/** The ebook converter's extension is whatever target the user picked; every other kind is fixed. */
export const outputName = (kind: ConvertKind, input: string, fields?: Record<string, string>) =>
  `${stripExt(input)}${OUT_SUFFIX[kind] || ''}.${kind === 'ebook-converter' && fields?.to ? fields.to.replace(/^\./, '') : OUT_EXT[kind]}`

/** Wakes the container so the first real request does not pay the cold start. Fire and forget. */
export const warmConverter = () => fetch(`${API_BASE}/convert/warm`, { method: 'POST' }).catch(() => undefined)

export type Phase = 'upload' | 'convert'
export type TransportRequest = { url: string; body: FormData; headers: Record<string, string>; onProgress?: (fraction: number, phase: Phase) => void }
export type TransportResponse = { status: number; headers: Headers; blob: Blob }
export type Transport = (req: TransportRequest) => Promise<TransportResponse>

function parseHeaders(raw: string) {
  const h = new Headers()
  raw
    .trim()
    .split(/\r?\n/)
    .forEach((line) => {
      const i = line.indexOf(':')
      if (i > 0) h.append(line.slice(0, i).trim(), line.slice(i + 1).trim())
    })
  return h
}

/** XMLHttpRequest rather than fetch, because only XHR reports upload progress. */
export const xhrTransport: Transport = (req) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', req.url)
    xhr.responseType = 'blob'
    xhr.timeout = 200_000
    Object.entries(req.headers).forEach(([k, v]) => xhr.setRequestHeader(k, v))
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) req.onProgress?.(e.loaded / e.total, 'upload')
    }
    xhr.upload.onload = () => req.onProgress?.(0, 'convert')
    xhr.onload = () => resolve({ status: xhr.status, headers: parseHeaders(xhr.getAllResponseHeaders()), blob: xhr.response as Blob })
    xhr.onerror = () => reject(new ApiError(0, 'network', STATUS_TEXT[0]))
    xhr.ontimeout = () => reject(new ApiError(504, 'timeout', 'The conversion took too long'))
    xhr.send(req.body)
  })

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const parseUsage = (v: string | null) => {
  const m = /^(\d+)\/(\d+)$/.exec(v || '')
  return m ? { used: Number(m[1]), limit: Number(m[2]) } : undefined
}

export type ConvertOptions = { token?: string; onProgress?: (fraction: number, phase: Phase) => void; transport?: Transport; retries?: number; /** extra multipart fields, e.g. the password for protect-pdf. Never logged. */ fields?: Record<string, string> }
export type ConvertResult = Output & { usage?: { used: number; limit: number } }

/**
 * Uploads one file and returns the converted one. A 503 means the converter is busy or
 * still waking up, so it waits and tries again a few times before giving up.
 */
export async function convertRemote(kind: ConvertKind, file: File, { token, onProgress, transport = xhrTransport, retries = 3, fields }: ConvertOptions = {}): Promise<ConvertResult> {
  const headers: Record<string, string> = { 'x-file-name': encodeURIComponent(file.name) }
  if (token) headers.authorization = `Bearer ${token}`
  for (let attempt = 0; ; attempt++) {
    const body = new FormData()
    body.append('file', file, file.name)
    if (fields) for (const [k, v] of Object.entries(fields)) body.append(k, v)
    const res = await transport({ url: `${API_BASE}/convert/${kind}`, body, headers, onProgress })
    if (res.status >= 200 && res.status < 300) {
      return { name: outputName(kind, file.name, fields), blob: res.blob, usage: parseUsage(res.headers.get('x-pxp-usage')) }
    }
    const err = toError(res.status, parseJson(await res.blob.text()))
    if (res.status === 503 && attempt < retries) {
      const ra = res.headers.get('retry-after')
      const wait = ra !== null && Number.isFinite(Number(ra)) ? Math.min(15, Number(ra)) : 5
      onProgress?.(0, 'convert')
      await sleep(wait * 1000)
      continue
    }
    throw err
  }
}

/** Turns an API failure into something a person can act on. */
export function describeError(e: unknown): { message: string; upgrade?: boolean; account?: boolean } {
  if (!(e instanceof ApiError)) return { message: e instanceof Error ? e.message : 'Something went wrong' }
  const used = e.data.used as number | undefined
  const limit = e.data.limit as number | undefined
  switch (e.code) {
    case 'network':
      return { message: 'Could not reach the converter. Check your connection and try again.' }
    case 'quota_exceeded':
      return e.status === 402
        ? { message: `You have used all ${limit ?? 5} free server conversions this month. Pro includes 300 a month for $5.`, upgrade: true }
        : { message: `Monthly limit reached (${used ?? '?'} of ${limit ?? '?'}). It resets on the 1st.`, account: true }
    case 'subscription_inactive':
      return { message: 'Your subscription is not active. Manage it from your account.', account: true }
    case 'invalid_token':
      return { message: 'Your access key has expired or is invalid. Open your account to refresh it.', account: true }
    case 'too_large':
      return { message: 'That file is over the 100 MB limit.' }
    case 'drm_protected':
      return { message: 'This ebook is DRM-protected, so it cannot be converted.' }
    case 'wrong_password':
      return { message: 'That password did not open the file. Check it and try again.' }
    case 'password_required':
      return { message: 'This PDF is password-protected. Enter the password to unlock it.' }
    case 'already_encrypted':
      return { message: 'This PDF is already password-protected. Unlock it first, then set a new password.' }
    case 'unsupported_media_type':
      return { message: 'This file type is not supported for this conversion.' }
    case 'rate_limited':
      return { message: 'Too many requests. Wait a minute and try again.' }
    case 'busy':
    case 'container_error':
      return { message: 'The converter is busy or still waking up. Try again in a few seconds.' }
    case 'timeout':
      return { message: 'The conversion took too long (over two minutes). Try a smaller file.' }
    case 'conversion_failed':
      return { message: `The converter could not process this file.${e.data.detail ? ` (${String(e.data.detail).slice(-160)})` : ''}` }
    case 'billing_not_configured':
      return { message: 'Billing is not switched on yet. Try again soon.' }
    default:
      return { message: e.message }
  }
}
