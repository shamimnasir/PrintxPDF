import { describe, expect, it } from 'vitest'
import { formEncode } from '../src/stripe'

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
