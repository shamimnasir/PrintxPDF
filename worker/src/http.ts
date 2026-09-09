/** Shared HTTP plumbing: the `{error, code}` envelope, JSON helpers, rate limiting, bearer parsing. */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly extra: Record<string, unknown> = {},
    readonly headers: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })
}

export function errorResponse(e: ApiError): Response {
  return json({ error: e.message, code: e.code, ...e.extra }, e.status, e.headers)
}

/** Parse a small JSON object body. Empty bodies yield `{}`; malformed JSON is a 400. */
export async function readJsonBody<T extends object>(req: Request, maxBytes = 16_384): Promise<Partial<T>> {
  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > maxBytes) throw new ApiError(413, 'too_large', 'Request body too large')
  const text = await req.text()
  if (text.length > maxBytes) throw new ApiError(413, 'too_large', 'Request body too large')
  if (!text.trim()) return {}
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ApiError(400, 'bad_json', 'Body must be valid JSON')
  }
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Partial<T>) : {}
}

export function clientIp(req: Request): string {
  return req.headers.get('cf-connecting-ip') ?? '0.0.0.0'
}

export async function enforceRateLimit(limiter: RateLimit, key: string): Promise<void> {
  const { success } = await limiter.limit({ key })
  if (!success) throw new ApiError(429, 'rate_limited', 'Too many requests, slow down', {}, { 'retry-after': '60' })
}

export function bearerToken(req: Request): string | null {
  const header = req.headers.get('authorization')
  if (!header) return null
  const m = /^Bearer\s+(\S+)$/i.exec(header.trim())
  return m ? m[1] : null
}
