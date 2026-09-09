/** CORS for the allow-listed site origins. Requests without a matching Origin get no CORS headers. */

const ALLOW_METHODS = 'GET, POST, OPTIONS'
const ALLOW_HEADERS = 'authorization, content-type, x-file-name'
const EXPOSE_HEADERS = 'content-disposition, x-pxp-usage, retry-after'
const MAX_AGE = '86400'

export function allowedOrigins(env: Env): string[] {
  return env.SITE_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** The request's Origin when it is on the allow-list, otherwise null. */
export function matchOrigin(req: Request, env: Env): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  return allowedOrigins(env).includes(origin) ? origin : null
}

export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {}
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': ALLOW_METHODS,
    'access-control-allow-headers': ALLOW_HEADERS,
    'access-control-expose-headers': EXPOSE_HEADERS,
    'access-control-max-age': MAX_AGE,
    vary: 'Origin',
  }
}

export function preflight(origin: string | null): Response {
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

/** Add CORS headers unless the handler already set its own (the public /fetch proxy uses `*`). */
export function withCors(res: Response, origin: string | null): Response {
  if (!origin || res.headers.has('access-control-allow-origin')) return res
  const out = new Response(res.body, res)
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    if (k === 'vary') out.headers.append(k, v)
    else out.headers.set(k, v)
  }
  return out
}
