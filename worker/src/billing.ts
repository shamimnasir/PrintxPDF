/** Stripe Checkout / Portal / subscription status, plus token issuance and rotation. */
import { ApiError, bearerToken, clientIp, enforceRateLimit, json, readJsonBody } from './http'
import { getCachedSub, getMinIat, getUsage, putCachedSub, quotaLimit, setMinIat, type EffectivePlan, type SubStatus } from './quota'
import {
  requireStripe,
  stripe,
  type StripeCheckoutSession,
  type StripeList,
  type StripePortalSession,
  type StripeSubscription,
} from './stripe'
import { isPlan, mint, now, verify, type Claims, type Plan } from './token'

const TOKEN_TTL: Record<Plan, number> = { pro: 30 * 86400, api: 365 * 86400, lifetime: 365 * 86400 }
const REFRESH_WINDOW = 7 * 86400
const ACTIVE = new Set(['active', 'trialing'])
const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]+$/
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/

function siteUrl(env: Env, origin: string | null): string {
  return origin ?? env.SITE_URL
}

function priceFor(env: Env, plan: Plan): string {
  const id = plan === 'pro' ? env.PRICE_PRO : plan === 'lifetime' ? env.PRICE_LIFETIME : env.PRICE_API
  if (!/^price_[A-Za-z0-9]+$/.test(id) || id === 'price_REPLACE_ME') {
    throw new ApiError(503, 'billing_not_configured', `The ${plan} plan price is not configured yet`)
  }
  return id
}

function planForPrice(env: Env, priceId: string): Plan | null {
  if (priceId === env.PRICE_PRO) return 'pro'
  if (priceId === env.PRICE_API) return 'api'
  return null
}

function customerId(v: string | { id: string } | null | undefined): string | null {
  if (typeof v === 'string') return v
  return v && typeof v.id === 'string' ? v.id : null
}

function periodEnd(sub: StripeSubscription): number | null {
  return sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end ?? null
}

function planOf(env: Env, sub: StripeSubscription, fallback?: string): Plan | null {
  for (const item of sub.items?.data ?? []) {
    const plan = planForPrice(env, item.price?.id ?? '')
    if (plan) return plan
  }
  if (isPlan(fallback)) return fallback
  if (isPlan(sub.metadata?.plan)) return sub.metadata.plan
  return null
}

/** Verify signature/expiry and the per-customer revocation floor set by `/billing/rotate`. */
export async function authenticate(env: Env, token: string): Promise<Claims | null> {
  const claims = await verify(env.ENTITLEMENT_SECRET, token)
  if (!claims) return null
  if (claims.iat < (await getMinIat(env, claims.sub))) return null
  return claims
}

export async function requireAuth(env: Env, req: Request, bodyToken?: string): Promise<Claims> {
  const token = bearerToken(req) ?? bodyToken ?? null
  if (!token) throw new ApiError(401, 'invalid_token', 'Missing bearer token')
  const claims = await authenticate(env, token)
  if (!claims) throw new ApiError(401, 'invalid_token', 'Token is invalid, expired or revoked')
  return claims
}

/** Effective plan from Stripe (1 h KV cache), never from the token alone. */
export async function subscriptionStatus(env: Env, customer: string): Promise<SubStatus> {
  const cached = await getCachedSub(env, customer)
  if (cached) return cached
  const list = await stripe<StripeList<StripeSubscription>>(env, 'GET', '/v1/subscriptions', { customer, limit: 10 })
  const matching = list.data.filter((s) => planOf(env, s) !== null)
  const best = matching.find((s) => ACTIVE.has(s.status)) ?? matching[0]
  const status: SubStatus = best
    ? {
        plan: planOf(env, best),
        active: ACTIVE.has(best.status),
        currentPeriodEnd: periodEnd(best),
        cancelAtPeriodEnd: Boolean(best.cancel_at_period_end),
      }
    : { plan: null, active: false, currentPeriodEnd: null, cancelAtPeriodEnd: false }
  await putCachedSub(env, customer, status)
  return status
}

export async function checkout(req: Request, env: Env, origin: string | null): Promise<Response> {
  await enforceRateLimit(env.RL_BILLING, clientIp(req))
  requireStripe(env)
  const body = await readJsonBody<{ plan: string; email: string }>(req)
  if (!isPlan(body.plan)) throw new ApiError(400, 'bad_request', "plan must be 'pro', 'api' or 'lifetime'")
  const plan = body.plan
  const price = priceFor(env, plan)
  const site = siteUrl(env, origin)
  const email = typeof body.email === 'string' && EMAIL.test(body.email.trim()) ? body.email.trim() : undefined
  // lifetime is bought once, so it is a payment session, not a subscription one
  const lifetime = plan === 'lifetime'
  const session = await stripe<StripeCheckoutSession>(env, 'POST', '/v1/checkout/sessions', {
    mode: lifetime ? 'payment' : 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${site}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_email: email,
    metadata: { plan },
    // a payment session has no subscription to hang metadata on, and needs a customer record
    // so the entitlement has a stable subject to key on
    ...(lifetime ? { customer_creation: 'always', payment_intent_data: { metadata: { plan } } } : { subscription_data: { metadata: { plan } } }),
  })
  if (!session.url) throw new ApiError(502, 'stripe_error', 'Checkout session has no URL')
  return json({ url: session.url, id: session.id })
}

export async function session(req: Request, env: Env, url: URL): Promise<Response> {
  await enforceRateLimit(env.RL_BILLING, clientIp(req))
  requireStripe(env)
  const id = url.searchParams.get('id') ?? ''
  if (id.length > 128 || !SESSION_ID.test(id)) throw new ApiError(400, 'bad_request', 'Invalid session id')
  const s = await stripe<StripeCheckoutSession>(env, 'GET', `/v1/checkout/sessions/${id}`, { expand: ['subscription'] })
  if (s.status !== 'complete') throw new ApiError(402, 'checkout_incomplete', 'Checkout has not completed')

  if (s.mode === 'payment') {
    if (s.payment_status !== 'paid') throw new ApiError(402, 'payment_incomplete', 'This purchase has not been paid')
    const cusOnce = customerId(s.customer)
    if (!cusOnce) throw new ApiError(502, 'stripe_error', 'Session has no customer')
    const emailOnce = s.customer_details?.email ?? s.customer_email ?? ''
    const tokenOnce = await mint(env.ENTITLEMENT_SECRET, { sub: cusOnce, email: emailOnce, plan: 'lifetime', cs: s.id }, TOKEN_TTL.lifetime)
    await putCachedSub(env, cusOnce, { plan: 'lifetime', active: true, currentPeriodEnd: null, cancelAtPeriodEnd: false })
    return json({ token: tokenOnce, email: emailOnce, plan: 'lifetime', customerId: cusOnce, currentPeriodEnd: null })
  }
  if (s.mode !== 'subscription') throw new ApiError(400, 'bad_session', 'Not a subscription or payment checkout')
  const sub = s.subscription && typeof s.subscription === 'object' ? s.subscription : null
  if (!sub || !ACTIVE.has(sub.status)) throw new ApiError(402, 'subscription_inactive', 'Subscription is not active')
  const cus = customerId(s.customer) ?? customerId(sub.customer)
  if (!cus) throw new ApiError(502, 'stripe_error', 'Session has no customer')
  const plan = planOf(env, sub, s.metadata?.plan)
  if (!plan) throw new ApiError(400, 'unknown_plan', 'Could not determine the plan for this session')
  const email = s.customer_details?.email ?? s.customer_email ?? ''
  const currentPeriodEnd = periodEnd(sub)
  const token = await mint(env.ENTITLEMENT_SECRET, { sub: cus, email, plan }, TOKEN_TTL[plan])
  await putCachedSub(env, cus, { plan, active: true, currentPeriodEnd, cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end) })
  return json({ token, email, plan, customerId: cus, currentPeriodEnd })
}

export async function portal(req: Request, env: Env, origin: string | null): Promise<Response> {
  await enforceRateLimit(env.RL_BILLING, clientIp(req))
  const body = bearerToken(req) ? {} : await readJsonBody<{ token: string }>(req)
  const claims = await requireAuth(env, req, typeof body.token === 'string' ? body.token : undefined)
  requireStripe(env)
  const p = await stripe<StripePortalSession>(env, 'POST', '/v1/billing_portal/sessions', {
    customer: claims.sub,
    return_url: `${siteUrl(env, origin)}/account`,
  })
  return json({ url: p.url })
}

/**
 * A lifetime buyer has no subscription, so the proof is the Checkout Session recorded in the
 * token: it is re-fetched from Stripe (cached for an hour like a subscription) and must still
 * read as paid. Refunding a lifetime purchase does not flip payment_status, so a refund also
 * needs the entitlement revoked with /billing/rotate.
 */
async function lifetimeStatus(env: Env, customer: string, sessionId: string): Promise<SubStatus> {
  const cached = await getCachedSub(env, customer)
  if (cached) return cached
  let paid = false
  try {
    const s = await stripe<StripeCheckoutSession>(env, 'GET', `/v1/checkout/sessions/${sessionId}`)
    paid = s.status === 'complete' && s.payment_status === 'paid'
  } catch {
    paid = false
  }
  const status: SubStatus = { plan: paid ? 'lifetime' : null, active: paid, currentPeriodEnd: null, cancelAtPeriodEnd: false }
  await putCachedSub(env, customer, status)
  return status
}

export async function me(req: Request, env: Env): Promise<Response> {
  await enforceRateLimit(env.RL_BILLING, clientIp(req))
  const claims = await requireAuth(env, req)
  const status =
    claims.plan === 'lifetime' && claims.cs
      ? await lifetimeStatus(env, claims.sub, claims.cs)
      : await subscriptionStatus(env, claims.sub)
  const effective: EffectivePlan = status.active && status.plan ? status.plan : 'free'
  const used = await getUsage(env, `c:${claims.sub}`)
  const out: Record<string, unknown> = {
    plan: status.plan,
    active: status.active,
    currentPeriodEnd: status.currentPeriodEnd,
    cancelAtPeriodEnd: status.cancelAtPeriodEnd,
    email: claims.email,
    usage: { used, limit: quotaLimit(env, effective) },
  }
  if (status.active && status.plan && claims.exp - now() < REFRESH_WINDOW) {
    out.token = await mint(env.ENTITLEMENT_SECRET, { sub: claims.sub, email: claims.email, plan: status.plan, cs: claims.cs }, TOKEN_TTL[status.plan])
  }
  return json(out)
}

export async function rotate(req: Request, env: Env): Promise<Response> {
  await enforceRateLimit(env.RL_BILLING, clientIp(req))
  const claims = await requireAuth(env, req)
  await setMinIat(env, claims.sub, now())
  const token = await mint(env.ENTITLEMENT_SECRET, { sub: claims.sub, email: claims.email, plan: claims.plan, cs: claims.cs }, TOKEN_TTL[claims.plan])
  return json({ token })
}
