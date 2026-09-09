/** Public read-only HTML fetch proxy for the web-page cleaner (CORS `*`, SSRF-guarded). */
import { ApiError, clientIp, enforceRateLimit } from './http'

const MAX_BYTES = 5 * 1024 * 1024
const TIMEOUT_MS = 15_000
const USER_AGENT = 'Mozilla/5.0 (compatible; PrintxPDF/1.0; +https://printxpdf.com)'
const PUBLIC_CORS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
}

function isPrivateIPv4(host: string): boolean {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (!m) return false
  const a = Number(m[1])
  const b = Number(m[2])
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isBlockedHost(raw: string): boolean {
  const host = raw.toLowerCase().replace(/\.$/, '')
  if (!host || host === 'localhost' || host.endsWith('.localhost')) return true
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.arpa')) return true
  if (host.startsWith('[')) {
    const v6 = host.slice(1, -1)
    return (
      v6 === '::' ||
      v6 === '::1' ||
      v6.startsWith('::ffff:') ||
      v6.startsWith('fc') ||
      v6.startsWith('fd') ||
      /^fe[89ab]/.test(v6)
    )
  }
  return isPrivateIPv4(host)
}

export function validateTarget(raw: string | null): URL {
  if (!raw) throw new ApiError(400, 'bad_request', 'Missing url parameter', {}, PUBLIC_CORS)
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new ApiError(400, 'bad_request', 'Invalid url', {}, PUBLIC_CORS)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ApiError(400, 'bad_request', 'Only http(s) URLs are allowed', {}, PUBLIC_CORS)
  }
  if (url.username || url.password) throw new ApiError(400, 'bad_request', 'Credentials in URLs are not allowed', {}, PUBLIC_CORS)
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new ApiError(400, 'bad_request', 'Only ports 80 and 443 are allowed', {}, PUBLIC_CORS)
  }
  if (isBlockedHost(url.hostname)) throw new ApiError(400, 'bad_request', 'That host is not allowed', {}, PUBLIC_CORS)
  return url
}

async function readCapped(body: ReadableStream<Uint8Array> | null, cap: number): Promise<Uint8Array> {
  if (!body) return new Uint8Array(0)
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > cap) {
      await reader.cancel().catch(() => undefined)
      throw new ApiError(413, 'too_large', 'Page exceeds the 5 MB limit', {}, PUBLIC_CORS)
    }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.byteLength
  }
  return out
}

function decodeHtml(bytes: Uint8Array, contentType: string | null): string {
  const label = /charset=["']?([\w.:-]+)/i.exec(contentType ?? '')?.[1]
  if (label) {
    try {
      return new TextDecoder(label).decode(bytes)
    } catch {
      /* unknown label: fall through to UTF-8 */
    }
  }
  return new TextDecoder('utf-8').decode(bytes)
}

export async function handleFetch(req: Request, env: Env, url: URL): Promise<Response> {
  try {
    await enforceRateLimit(env.RL_CONVERT, clientIp(req))
  } catch (e) {
    if (e instanceof ApiError) throw new ApiError(e.status, e.code, e.message, e.extra, { ...e.headers, ...PUBLIC_CORS })
    throw e
  }
  const target = validateTarget(url.searchParams.get('url'))

  let upstream: Response
  try {
    upstream = await fetch(target.toString(), {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cf: { cacheTtl: 300, cacheEverything: true },
    })
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'TimeoutError'
    throw new ApiError(
      502,
      timedOut ? 'timeout' : 'fetch_failed',
      timedOut ? 'The page took too long to respond' : 'Could not fetch that page',
      {},
      PUBLIC_CORS,
    )
  }

  if (Number(upstream.headers.get('content-length') ?? '0') > MAX_BYTES) {
    await upstream.body?.cancel().catch(() => undefined)
    throw new ApiError(413, 'too_large', 'Page exceeds the 5 MB limit', {}, PUBLIC_CORS)
  }
  const html = decodeHtml(await readCapped(upstream.body, MAX_BYTES), upstream.headers.get('content-type'))
  return new Response(html, {
    status: upstream.status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', ...PUBLIC_CORS },
  })
}
