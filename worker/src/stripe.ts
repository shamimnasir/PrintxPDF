/** Minimal Stripe client over plain fetch (no SDK). The secret key never leaves this module. */
import { ApiError } from './http'

const API = 'https://api.stripe.com'

/**
 * Builds a Stripe request URL. Call sites write the path exactly as Stripe's docs do
 * ('/v1/checkout/sessions'), and a missing or doubled '/v1' is normalised away, so the base
 * and the path can never disagree — a doubled prefix produced a 404 that only appeared once a
 * real key was in place, because every earlier test stopped at 'billing not configured'.
 */
export function stripeUrl(method: 'GET' | 'POST', path: string, encoded = ''): string {
  const url = `${API}/v1/${path.replace(/^\/*(?:v1\/)?/, '')}`
  return method === 'GET' && encoded ? `${url}?${encoded}` : url
}
const STRIPE_VERSION = '2026-08-26.dahlia'

export class StripeError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'StripeError'
  }
}

export interface StripePrice {
  id: string
}
export interface StripeSubscriptionItem {
  id: string
  price: StripePrice
  current_period_end?: number
}
export interface StripeSubscription {
  id: string
  customer: string | { id: string }
  status: string
  cancel_at_period_end?: boolean
  current_period_end?: number
  items: { data: StripeSubscriptionItem[] }
  metadata?: Record<string, string>
}
export interface StripeCheckoutSession {
  id: string
  url: string | null
  mode: string
  status: string | null
  customer: string | { id: string } | null
  customer_email: string | null
  customer_details: { email: string | null } | null
  subscription: string | StripeSubscription | null
  payment_status?: string
  payment_intent?: string | { id: string; status: string } | null
  metadata?: Record<string, string>
}
export interface StripeList<T> {
  data: T[]
  has_more: boolean
}
export interface StripePortalSession {
  url: string
}

export function hasStripe(env: Env): boolean {
  return typeof env.STRIPE_SECRET_KEY === 'string' && env.STRIPE_SECRET_KEY.length > 0
}

/** 503 `billing_not_configured` until the STRIPE_SECRET_KEY secret exists. */
export function requireStripe(env: Env): string {
  if (!hasStripe(env)) throw new ApiError(503, 'billing_not_configured', 'Billing is not configured yet')
  return env.STRIPE_SECRET_KEY as string
}

export type Param = string | number | boolean | null | undefined | Param[] | { [key: string]: Param }

/** Stripe's bracket form encoding: `line_items[0][price]`, `expand[0]`, `subscription_data[metadata][plan]`. */
export function formEncode(params: Record<string, Param>): string {
  const pairs: string[] = []
  const walk = (key: string, value: Param): void => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(`${key}[${i}]`, item))
      return
    }
    if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(`${key}[${k}]`, v)
      return
    }
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  }
  for (const [k, v] of Object.entries(params)) walk(k, v)
  return pairs.join('&')
}

export async function stripe<T>(
  env: Env,
  method: 'GET' | 'POST',
  path: string,
  params: Record<string, Param> = {},
): Promise<T> {
  const key = requireStripe(env)
  const encoded = formEncode(params)
  const url = stripeUrl(method, path, encoded)
  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    'stripe-version': STRIPE_VERSION,
    accept: 'application/json',
  }
  if (method === 'POST') headers['content-type'] = 'application/x-www-form-urlencoded'
  const res = await fetch(url, { method, headers, body: method === 'POST' ? encoded : undefined })
  const text = await res.text()
  let data: unknown = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; type?: string; message?: string } } | null)?.error
    throw new StripeError(res.status, err?.code ?? err?.type ?? `http_${res.status}`, err?.message ?? 'Stripe request failed')
  }
  if (data === null) throw new StripeError(502, 'bad_response', 'Stripe returned a non-JSON response')
  return data as T
}
