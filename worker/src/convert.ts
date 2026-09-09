/** Conversion endpoints: entitlement, quota, instance leasing, streaming to the container. */
import { getContainer } from '@cloudflare/containers'
import { authenticate, subscriptionStatus } from './billing'
import type { Converter } from './container'
import { ApiError, bearerToken, clientIp, enforceRateLimit, json } from './http'
import { getUsage, incrementUsage, quotaLimit, type EffectivePlan } from './quota'

export const KINDS = ['ppt-to-pdf', 'pdf-to-ppt', 'epub-to-pdf', 'mobi-to-pdf'] as const
export type Kind = (typeof KINDS)[number]

const MAX_INSTANCES = 2 // keep in sync with containers[0].max_instances in wrangler.jsonc
const CONVERT_TIMEOUT_MS = 150_000
const WARM_TIMEOUT_MS = 120_000

export function isKind(v: string): v is Kind {
  return (KINDS as readonly string[]).includes(v)
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function ipSubject(env: Env, ip: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${ip}|${env.ENTITLEMENT_SECRET}`))
  return `ip:${hex(digest).slice(0, 16)}`
}

interface Entitlement {
  subject: string
  plan: EffectivePlan
}

async function entitle(req: Request, env: Env): Promise<Entitlement> {
  const token = bearerToken(req)
  if (!token) return { subject: await ipSubject(env, clientIp(req)), plan: 'free' }
  const claims = await authenticate(env, token)
  if (!claims) throw new ApiError(401, 'invalid_token', 'Token is invalid, expired or revoked')
  const status = await subscriptionStatus(env, claims.sub)
  if (!status.active || !status.plan) throw new ApiError(402, 'subscription_inactive', 'Your subscription is not active')
  return { subject: `c:${claims.sub}`, plan: status.plan }
}

async function acquireInstance(env: Env): Promise<DurableObjectStub<Converter> | null> {
  for (let i = 0; i < MAX_INSTANCES; i++) {
    const name = `conv-${i}`
    const stub = getContainer(env.CONVERTER, name)
    try {
      const res = await stub.fetch('http://converter/_acquire', { method: 'POST' })
      if (res.status === 204) return stub
    } catch (e) {
      console.error('acquire failed', name, String(e))
    }
  }
  return null
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | 'timeout'> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), ms)
  })
  return Promise.race([p, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer)
  })
}

export async function handleConvert(req: Request, env: Env, ctx: ExecutionContext, kind: Kind): Promise<Response> {
  await enforceRateLimit(env.RL_CONVERT, clientIp(req))

  const lengthHeader = req.headers.get('content-length')
  if (!lengthHeader) throw new ApiError(411, 'length_required', 'Content-Length is required')
  const length = Number(lengthHeader)
  if (!Number.isInteger(length) || length <= 0) throw new ApiError(400, 'bad_request', 'Invalid Content-Length')
  const max = Number(env.MAX_UPLOAD_BYTES)
  if (length > max) {
    throw new ApiError(413, 'too_large', `File exceeds the ${Math.floor(max / 1048576)} MB limit`, { limit: max })
  }
  const contentType = (req.headers.get('content-type') ?? '').toLowerCase()
  if (!contentType.startsWith('multipart/form-data') && !contentType.startsWith('application/octet-stream')) {
    throw new ApiError(415, 'unsupported_media_type', 'Send multipart/form-data or application/octet-stream')
  }
  if (!req.body) throw new ApiError(400, 'bad_request', 'Missing request body')

  const { subject, plan } = await entitle(req, env)
  const limit = quotaLimit(env, plan)
  const used = await getUsage(env, subject)
  if (used >= limit) {
    throw new ApiError(
      plan === 'free' ? 402 : 429,
      'quota_exceeded',
      plan === 'free'
        ? `Free limit of ${limit} conversions this month reached`
        : `Monthly limit of ${limit} conversions reached`,
      { used, limit, plan },
    )
  }

  const stub = await acquireInstance(env)
  if (!stub) throw new ApiError(503, 'busy', 'All converters are busy, try again shortly', {}, { 'retry-after': '10' })

  const { readable, writable } = new FixedLengthStream(length)
  const pump = req.body.pipeTo(writable).catch((e: unknown) => console.error('upload pipe failed', String(e)))
  ctx.waitUntil(pump)
  const headers = new Headers({ 'content-type': req.headers.get('content-type') ?? '', 'content-length': String(length) })
  const fileName = req.headers.get('x-file-name')
  if (fileName) headers.set('x-file-name', fileName)
  const upstream = new Request(`http://converter/convert/${kind}`, { method: 'POST', body: readable, headers })

  let res: Response | 'timeout'
  try {
    res = await withTimeout(stub.fetch(upstream), CONVERT_TIMEOUT_MS)
  } catch (e) {
    console.error('converter fetch failed', String(e))
    throw new ApiError(503, 'container_error', 'Converter unavailable, retry shortly', {}, { 'retry-after': '15' })
  }
  if (res === 'timeout') throw new ApiError(504, 'timeout', 'Conversion timed out', {}, { 'retry-after': '30' })

  if (res.ok) {
    ctx.waitUntil(incrementUsage(env, subject).catch((e: unknown) => console.error('quota increment failed', String(e))))
    const out = new Headers({ 'cache-control': 'no-store', 'x-pxp-usage': `${used + 1}/${limit}` })
    for (const name of ['content-type', 'content-length', 'content-disposition']) {
      const v = res.headers.get(name)
      if (v) out.set(name, v)
    }
    return new Response(res.body, { status: 200, headers: out })
  }

  // Pass the container's own {error, code} envelope through.
  const out = new Headers({
    'content-type': res.headers.get('content-type') ?? 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-pxp-usage': `${used}/${limit}`,
  })
  const retryAfter = res.headers.get('retry-after') ?? (res.status === 503 ? '10' : null)
  if (retryAfter) out.set('retry-after', retryAfter)
  return new Response(res.body, { status: res.status, headers: out })
}

export async function handleWarm(req: Request, env: Env): Promise<Response> {
  await enforceRateLimit(env.RL_CONVERT, clientIp(req))
  const stub = getContainer(env.CONVERTER, 'conv-0')
  let res: Response | 'timeout'
  try {
    res = await withTimeout(stub.fetch('http://converter/health'), WARM_TIMEOUT_MS)
  } catch (e) {
    console.error('warm failed', String(e))
    throw new ApiError(503, 'container_error', 'Converter unavailable, retry shortly', {}, { 'retry-after': '15' })
  }
  if (res === 'timeout') throw new ApiError(504, 'timeout', 'Converter did not start in time', {}, { 'retry-after': '30' })
  if (!res.ok) throw new ApiError(503, 'container_error', 'Converter is not ready', {}, { 'retry-after': '15' })
  return json({ ok: true })
}
