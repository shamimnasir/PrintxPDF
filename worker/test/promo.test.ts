import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPromo, deactivatePromo } from '../src/promo'

// A promotion code is typed in by customers on the live checkout page, so the guard rails are the
// point of this module. Each one gets a test that tries to get past it.

const env = { STRIPE_SECRET_KEY: 'sk_test_fake', PRICE_LIFETIME: 'price_life', PRICE_PRO: 'price_pro', PRICE_API: 'price_api' } as unknown as Env

type Sent = { url: string; body: Record<string, string> }

function mockStripe() {
  const sent: Sent[] = []
  vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    const body = Object.fromEntries(new URLSearchParams(String(init?.body ?? '')))
    sent.push({ url, body })
    const reply = (d: unknown) => new Response(JSON.stringify(d), { status: 200 })
    if (url.includes('/v1/prices/')) return reply({ product: 'prod_lifetime' })
    if (url.endsWith('/v1/coupons')) return reply({ id: 'co_1', percent_off: 100 })
    if (url.includes('/v1/promotion_codes/')) return reply({ id: 'promo_1', code: 'X', active: false, max_redemptions: 1, times_redeemed: 0, expires_at: null, coupon: { id: 'co_1', percent_off: 100 } })
    if (url.endsWith('/v1/promotion_codes')) return reply({ id: 'promo_1', code: body.code, active: true, max_redemptions: Number(body.max_redemptions), times_redeemed: 0, expires_at: Number(body.expires_at), coupon: { id: 'co_1', percent_off: 100 } })
    return reply({})
  })
  return sent
}

const good = { code: 'LAUNCH-TEST', percentOff: 100, maxRedemptions: 1, expiresInDays: 7 }

afterEach(() => vi.unstubAllGlobals())

describe('createPromo', () => {
  it('creates a coupon then a code, and returns what was made', async () => {
    const sent = mockStripe()
    const out = await createPromo(env, good)
    expect(out).toMatchObject({ code: 'LAUNCH-TEST', percentOff: 100, maxRedemptions: 1, active: true })
    expect(sent.map((s) => s.url.replace('https://api.stripe.com', ''))).toEqual(['/v1/coupons', '/v1/promotion_codes'])
  })

  it('always sets an expiry, because a standing 100%-off code is a liability', async () => {
    const sent = mockStripe()
    await createPromo(env, good)
    const expires = Number(sent[1].body.expires_at)
    const days = (expires - Math.floor(Date.now() / 1000)) / 86_400
    expect(days).toBeGreaterThan(6.9)
    expect(days).toBeLessThan(7.1)
  })

  it('discounts once rather than every renewal', async () => {
    const sent = mockStripe()
    await createPromo(env, { ...good, plan: 'pro' })
    expect(sent.find((s) => s.url.endsWith('/v1/coupons'))!.body.duration).toBe('once')
  })

  it('restricts to one plan when asked, so a Lifetime code cannot buy API access', async () => {
    const sent = mockStripe()
    await createPromo(env, { ...good, plan: 'lifetime' })
    expect(sent.find((s) => s.url.endsWith('/v1/coupons'))!.body['applies_to[products][0]']).toBe('prod_lifetime')
  })

  it('leaves the coupon unrestricted when no plan is named', async () => {
    const sent = mockStripe()
    await createPromo(env, { ...good, plan: 'any' })
    expect(sent.find((s) => s.url.endsWith('/v1/coupons'))!.body['applies_to[products][0]']).toBeUndefined()
  })

  it('uppercases the code, since that is how a customer will type it', async () => {
    const sent = mockStripe()
    const out = await createPromo(env, { ...good, code: 'launch-test' })
    expect(out.code).toBe('LAUNCH-TEST')
    expect(sent[1].body.code).toBe('LAUNCH-TEST')
  })

  it('refuses a code that is not safely typeable', async () => {
    mockStripe()
    for (const code of ['', 'ab', 'has space', 'emoji🎉', 'semi;colon', 'a'.repeat(41)]) {
      await expect(createPromo(env, { ...good, code }), code).rejects.toMatchObject({ code: 'bad_promo_code' })
    }
  })

  it('refuses a discount outside 1 to 100 percent', async () => {
    mockStripe()
    for (const percentOff of [0, -10, 101, NaN]) {
      await expect(createPromo(env, { ...good, percentOff }), String(percentOff)).rejects.toMatchObject({ code: 'bad_promo_percent' })
    }
  })

  it('refuses an uncapped code', async () => {
    mockStripe()
    for (const maxRedemptions of [0, -1, 1001, NaN]) {
      await expect(createPromo(env, { ...good, maxRedemptions }), String(maxRedemptions)).rejects.toMatchObject({ code: 'bad_promo_redemptions' })
    }
  })

  it('refuses a code that never expires', async () => {
    mockStripe()
    for (const expiresInDays of [0, -1, 366, NaN]) {
      await expect(createPromo(env, { ...good, expiresInDays }), String(expiresInDays)).rejects.toMatchObject({ code: 'bad_promo_expiry' })
    }
  })

  it('passes the first-order-only restriction through only when asked', async () => {
    let sent = mockStripe()
    await createPromo(env, good)
    expect(sent[1].body['restrictions[first_time_transaction]']).toBeUndefined()
    vi.unstubAllGlobals()
    sent = mockStripe()
    await createPromo(env, { ...good, firstTimeOnly: true })
    expect(sent[1].body['restrictions[first_time_transaction]']).toBe('true')
  })
})

describe('deactivatePromo', () => {
  it('deactivates rather than deletes, so past orders keep their history', async () => {
    const sent = mockStripe()
    const out = await deactivatePromo(env, 'promo_1')
    expect(out.active).toBe(false)
    expect(sent[0].body.active).toBe('false')
  })

  it('refuses anything that is not a promotion code id', async () => {
    mockStripe()
    for (const id of ['', 'co_1', '../../v1/customers', 'promo_1/../x']) {
      await expect(deactivatePromo(env, id), id).rejects.toMatchObject({ code: 'bad_promo_id' })
    }
  })
})
