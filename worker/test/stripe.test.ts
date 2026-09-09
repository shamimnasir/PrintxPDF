import { describe, expect, it } from 'vitest'
import { formEncode, stripeUrl } from '../src/stripe'

describe('formEncode', () => {
  it('serialises nested params the way Stripe expects', () => {
    const q = formEncode({
      mode: 'subscription',
      line_items: [{ price: 'price_1', quantity: 1 }],
      expand: ['subscription'],
      subscription_data: { metadata: { plan: 'pro' } },
      allow_promotion_codes: true,
      customer_email: undefined,
      success_url: 'https://printxpdf.com/account?session_id={CHECKOUT_SESSION_ID}',
    })
    const decoded = decodeURIComponent(q)
    expect(decoded).toContain('line_items[0][price]=price_1')
    expect(decoded).toContain('line_items[0][quantity]=1')
    expect(decoded).toContain('expand[0]=subscription')
    expect(decoded).toContain('subscription_data[metadata][plan]=pro')
    expect(decoded).toContain('allow_promotion_codes=true')
    expect(decoded).toContain('success_url=https://printxpdf.com/account?session_id={CHECKOUT_SESSION_ID}')
    expect(q).not.toContain('customer_email')
  })
})

describe('stripeUrl', () => {
  it('builds the documented Stripe path exactly once', () => {
    expect(stripeUrl('POST', '/v1/checkout/sessions')).toBe('https://api.stripe.com/v1/checkout/sessions')
    expect(stripeUrl('POST', '/v1/billing_portal/sessions')).toBe('https://api.stripe.com/v1/billing_portal/sessions')
  })

  it('never doubles the version prefix, however the path is written', () => {
    const want = 'https://api.stripe.com/v1/checkout/sessions'
    for (const p of ['/v1/checkout/sessions', '/checkout/sessions', 'checkout/sessions', '//v1/checkout/sessions']) {
      expect(stripeUrl('POST', p), p).toBe(want)
    }
  })

  it('keeps interpolated ids intact', () => {
    expect(stripeUrl('GET', '/v1/checkout/sessions/cs_test_abc123')).toBe('https://api.stripe.com/v1/checkout/sessions/cs_test_abc123')
  })

  it('appends the query only for GET', () => {
    expect(stripeUrl('GET', '/v1/subscriptions', 'customer=cus_1&limit=10')).toBe('https://api.stripe.com/v1/subscriptions?customer=cus_1&limit=10')
    expect(stripeUrl('POST', '/v1/checkout/sessions', 'mode=subscription')).toBe('https://api.stripe.com/v1/checkout/sessions')
  })
})
