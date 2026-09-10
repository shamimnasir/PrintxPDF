/**
 * Entitlement tokens: `pxp_<base64url(JSON payload)>.<base64url(HMAC-SHA256)>`.
 * Pure Web Crypto, no env access, so it is unit-testable under Node. Never log tokens.
 */

export type Plan = 'pro' | 'api' | 'lifetime'

export interface Claims {
  v: 1
  sub: string
  email: string
  plan: Plan
  /** Lifetime only: the paid Checkout Session, re-verified against Stripe on use. */
  cs?: string
  iat: number
  exp: number
}

const PREFIX = 'pxp_'
const enc = new TextEncoder()
const dec = new TextDecoder()

export const now = (): number => Math.floor(Date.now() / 1000)

export function isPlan(v: unknown): v is Plan {
  return v === 'pro' || v === 'api' || v === 'lifetime'
}

function b64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) throw new Error('bad base64url')
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage])
}

export async function mint(
  secret: string,
  claims: { sub: string; email: string; plan: Plan; cs?: string },
  ttlSec: number,
): Promise<string> {
  const iat = now()
  const payload: Claims = { v: 1, sub: claims.sub, email: claims.email, plan: claims.plan, iat, exp: iat + ttlSec }
  if (claims.cs) payload.cs = claims.cs
  const body = b64url(enc.encode(JSON.stringify(payload)))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), enc.encode(body))
  return `${PREFIX}${body}.${b64url(new Uint8Array(sig))}`
}

/** Constant-time signature check, then v / plan / exp / iat >= minIat. Returns null on any failure. */
export async function verify(secret: string, token: string, minIat = 0): Promise<Claims | null> {
  if (typeof token !== 'string' || !token.startsWith(PREFIX) || token.length > 4096) return null
  const rest = token.slice(PREFIX.length)
  const dot = rest.indexOf('.')
  if (dot <= 0 || dot === rest.length - 1) return null
  const body = rest.slice(0, dot)
  let sig: Uint8Array<ArrayBuffer>
  try {
    sig = fromB64url(rest.slice(dot + 1))
  } catch {
    return null
  }
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret, 'verify'), sig, enc.encode(body))
  if (!ok) return null

  let claims: Partial<Claims>
  try {
    claims = JSON.parse(dec.decode(fromB64url(body))) as Partial<Claims>
  } catch {
    return null
  }
  if (!claims || typeof claims !== 'object') return null
  if (claims.v !== 1) return null
  if (typeof claims.sub !== 'string' || !claims.sub.startsWith('cus_')) return null
  if (typeof claims.email !== 'string') return null
  if (!isPlan(claims.plan)) return null
  if (typeof claims.iat !== 'number' || typeof claims.exp !== 'number') return null
  const t = now()
  if (claims.exp <= t) return null
  if (claims.iat < minIat) return null
  return claims as Claims
}
