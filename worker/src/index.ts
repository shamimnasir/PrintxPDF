/** printxpdf-api: router, CORS, and the error envelope. Handlers live in the sibling modules. */
import * as admin from './admin'
import * as billing from './billing'
import { Converter } from './container'
import { matchOrigin, preflight, withCors } from './cors'
import { handleConvert, handleWarm, isKind } from './convert'
import { handleFetch, handleImage } from './fetchProxy'
import { ApiError, errorResponse, json } from './http'
import { StripeError } from './stripe'

export { Converter }

declare global {
  interface Env {
    /** Set with `wrangler secret put STRIPE_SECRET_KEY`; billing returns 503 until then. */
    STRIPE_SECRET_KEY?: string
    /** Admin panel. Publishing returns 503 until all of these exist. */
    ADMIN_PASSWORD_HASH?: string
    ADMIN_SECRET?: string
    GITHUB_TOKEN?: string
  }
}

const VERSION = '1.0.0'

function methodNotAllowed(allow: string): never {
  throw new ApiError(405, 'method_not_allowed', `Use ${allow}`, {}, { allow })
}

async function route(req: Request, env: Env, ctx: ExecutionContext, url: URL, origin: string | null): Promise<Response> {
  const { pathname } = url
  const method = req.method

  if (pathname === '/' || pathname === '/health') {
    return method === 'GET' || method === 'HEAD' ? json({ ok: true, version: VERSION }) : methodNotAllowed('GET')
  }
  if (pathname === '/billing/checkout') return method === 'POST' ? billing.checkout(req, env, origin) : methodNotAllowed('POST')
  if (pathname === '/billing/session') return method === 'GET' ? billing.session(req, env, url) : methodNotAllowed('GET')
  if (pathname === '/billing/portal') return method === 'POST' ? billing.portal(req, env, origin) : methodNotAllowed('POST')
  if (pathname === '/billing/me') return method === 'GET' ? billing.me(req, env) : methodNotAllowed('GET')
  if (pathname === '/billing/rotate') return method === 'POST' ? billing.rotate(req, env) : methodNotAllowed('POST')
  if (pathname === '/convert/warm') return method === 'POST' ? handleWarm(req, env) : methodNotAllowed('POST')

  const conv = /^\/convert\/([a-z0-9-]+)$/.exec(pathname)
  if (conv) {
    const kind = conv[1]
    if (!isKind(kind)) throw new ApiError(404, 'not_found', `Unknown conversion '${kind}'`)
    return method === 'POST' ? handleConvert(req, env, ctx, kind) : methodNotAllowed('POST')
  }
  if (pathname === '/admin/login') return method === 'POST' ? admin.login(req, env) : methodNotAllowed('POST')
  if (pathname === '/admin/me') return method === 'GET' ? admin.me(req, env) : methodNotAllowed('GET')
  if (pathname === '/admin/publish') return method === 'POST' ? admin.publish(req, env) : methodNotAllowed('POST')
  if (pathname === '/admin/promos') {
    if (method === 'GET') return admin.promosList(req, env)
    if (method === 'POST') return admin.promoCreate(req, env)
    methodNotAllowed('GET, POST')
  }
  if (pathname === '/admin/promos/deactivate') return method === 'POST' ? admin.promoDeactivate(req, env) : methodNotAllowed('POST')
  if (pathname === '/admin/signout-everywhere') return method === 'POST' ? admin.signOutEverywhere(req, env) : methodNotAllowed('POST')

  if (pathname === '/fetch') return method === 'GET' ? handleFetch(req, env, url) : methodNotAllowed('GET')
  if (pathname === '/image') return method === 'GET' ? handleImage(req, env, url) : methodNotAllowed('GET')

  throw new ApiError(404, 'not_found', 'Not found')
}

export default {
  async fetch(req, env, ctx): Promise<Response> {
    const url = new URL(req.url)
    const origin = matchOrigin(req, env)
    if (req.method === 'OPTIONS') return preflight(origin)
    try {
      return withCors(await route(req, env, ctx, url, origin), origin)
    } catch (e) {
      if (e instanceof ApiError) return withCors(errorResponse(e), origin)
      if (e instanceof StripeError) {
        // Stripe's own message names the offending resource ('No such price: …'), which is the
        // only way to tell a mode mismatch from a permissions gap. It never contains the key.
        console.error('stripe error', e.status, e.code, e.message, 'keyMode=', env.STRIPE_SECRET_KEY?.includes('_live_') ? 'live' : 'test')
        return withCors(json({ error: 'Payment provider error, try again shortly', code: 'stripe_error' }, 502), origin)
      }
      console.error('unhandled error', e instanceof Error ? (e.stack ?? e.message) : String(e))
      return withCors(json({ error: 'Internal error', code: 'internal' }, 500), origin)
    }
  },
} satisfies ExportedHandler<Env>
