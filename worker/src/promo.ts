/**
 * Promotion codes, created from the admin panel instead of the Stripe dashboard.
 *
 * A promotion code is entered by a customer on the live checkout page, so a careless one gives the
 * product away. The limits below are deliberate rather than defaults worth tuning:
 *
 *   - every code expires, because a 100%-off code with no end date is a standing liability
 *   - every code is capped on redemptions, so a leak costs a known number of sales
 *   - a code can be restricted to one plan, so a test code for Lifetime cannot also buy API access
 *
 * The Stripe key stays in stripe.ts; this module only describes what to ask it for.
 */
import { ApiError } from './http'
import { stripe, type Param, type StripeList } from './stripe'
import type { Plan } from './token'

export type PromoInput = {
  code: string
  percentOff: number
  maxRedemptions: number
  expiresInDays: number
  plan?: Plan | 'any'
  /** Stripe's own "first order only" restriction, useful for a launch offer. */
  firstTimeOnly?: boolean
}

export type Promo = {
  id: string
  code: string
  percentOff: number | null
  active: boolean
  maxRedemptions: number | null
  timesRedeemed: number
  expiresAt: number | null
  appliesTo: string | null
}

interface StripeCoupon {
  id: string
  percent_off: number | null
  applies_to?: { products: string[] }
}
interface StripePromotionCode {
  id: string
  code: string
  active: boolean
  max_redemptions: number | null
  times_redeemed: number
  expires_at: number | null
  coupon: StripeCoupon
}

/** Stripe uppercases codes anyway; rejecting the rest keeps them typeable over the phone. */
const CODE_SHAPE = /^[A-Z0-9][A-Z0-9._-]{3,39}$/

const LIMITS = {
  percentMin: 1,
  percentMax: 100,
  redemptionsMin: 1,
  redemptionsMax: 1000,
  daysMin: 1,
  daysMax: 365,
}

function validate(input: PromoInput): PromoInput {
  const code = String(input.code || '').trim().toUpperCase()
  if (!CODE_SHAPE.test(code)) {
    throw new ApiError(400, 'bad_promo_code', 'A code is 4 to 40 characters: letters, digits, dot, dash or underscore')
  }
  const percentOff = Number(input.percentOff)
  if (!Number.isFinite(percentOff) || percentOff < LIMITS.percentMin || percentOff > LIMITS.percentMax) {
    throw new ApiError(400, 'bad_promo_percent', `The discount must be between ${LIMITS.percentMin} and ${LIMITS.percentMax} percent`)
  }
  const maxRedemptions = Math.floor(Number(input.maxRedemptions))
  if (!Number.isFinite(maxRedemptions) || maxRedemptions < LIMITS.redemptionsMin || maxRedemptions > LIMITS.redemptionsMax) {
    throw new ApiError(400, 'bad_promo_redemptions', `Redemptions must be between ${LIMITS.redemptionsMin} and ${LIMITS.redemptionsMax}. A code without a cap gives the product away if it leaks.`)
  }
  const expiresInDays = Math.floor(Number(input.expiresInDays))
  if (!Number.isFinite(expiresInDays) || expiresInDays < LIMITS.daysMin || expiresInDays > LIMITS.daysMax) {
    throw new ApiError(400, 'bad_promo_expiry', `An expiry between ${LIMITS.daysMin} and ${LIMITS.daysMax} days is required. Codes that never expire outlive the reason they were made.`)
  }
  return { code, percentOff, maxRedemptions, expiresInDays, plan: input.plan ?? 'any', firstTimeOnly: !!input.firstTimeOnly }
}

function priceFor(env: Env, plan: Plan): string {
  const id = plan === 'pro' ? env.PRICE_PRO : plan === 'lifetime' ? env.PRICE_LIFETIME : env.PRICE_API
  if (!id) throw new ApiError(503, 'price_not_configured', `No price is configured for the ${plan} plan`)
  return id
}

/** The product behind a price, so a coupon can be restricted to one plan. */
async function productFor(env: Env, plan: Plan): Promise<string> {
  const price = await stripe<{ product: string | { id: string } }>(env, 'GET', `/v1/prices/${priceFor(env, plan)}`)
  return typeof price.product === 'string' ? price.product : price.product.id
}

export async function createPromo(env: Env, raw: PromoInput): Promise<Promo> {
  const input = validate(raw)

  const couponParams: Record<string, Param> = {
    percent_off: input.percentOff,
    // 'once' is right for both: a one-time payment has a single invoice, and on a subscription
    // this discounts the first one rather than every renewal forever.
    duration: 'once',
    name: `${input.code} (${input.percentOff}% off${input.plan && input.plan !== 'any' ? `, ${input.plan}` : ''})`,
  }
  if (input.plan && input.plan !== 'any') {
    couponParams['applies_to[products][0]'] = await productFor(env, input.plan)
  }

  const coupon = await stripe<StripeCoupon>(env, 'POST', '/v1/coupons', couponParams)

  const promoParams: Record<string, Param> = {
    coupon: coupon.id,
    code: input.code,
    max_redemptions: input.maxRedemptions,
    expires_at: Math.floor(Date.now() / 1000) + input.expiresInDays * 86_400,
  }
  if (input.firstTimeOnly) promoParams['restrictions[first_time_transaction]'] = true

  const promo = await stripe<StripePromotionCode>(env, 'POST', '/v1/promotion_codes', promoParams)
  return shape(promo)
}

const shape = (p: StripePromotionCode): Promo => ({
  id: p.id,
  code: p.code,
  percentOff: p.coupon?.percent_off ?? null,
  active: p.active,
  maxRedemptions: p.max_redemptions,
  timesRedeemed: p.times_redeemed,
  expiresAt: p.expires_at,
  appliesTo: p.coupon?.applies_to?.products?.[0] ?? null,
})

export async function listPromos(env: Env): Promise<Promo[]> {
  const res = await stripe<StripeList<StripePromotionCode>>(env, 'GET', '/v1/promotion_codes', { limit: 50 })
  return res.data.map(shape)
}

/**
 * Stripe does not delete a promotion code, because deleting one would rewrite the history of any
 * order that used it. Deactivating stops it working from now on, which is what "turn it off" means.
 */
export async function deactivatePromo(env: Env, id: string): Promise<Promo> {
  if (!/^promo_[A-Za-z0-9]+$/.test(id)) throw new ApiError(400, 'bad_promo_id', 'Not a promotion code id')
  return shape(await stripe<StripePromotionCode>(env, 'POST', `/v1/promotion_codes/${id}`, { active: false }))
}
