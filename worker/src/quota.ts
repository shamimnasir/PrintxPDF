/** KV-backed monthly quota, subscription cache and token revocation floor. */
import type { Plan } from './token'

export type EffectivePlan = Plan | 'free'

export interface SubStatus {
  plan: Plan | null
  active: boolean
  currentPeriodEnd: number | null
  cancelAtPeriodEnd: boolean
}

const QUOTA_TTL = 40 * 86400
const SUB_TTL = 3600

export function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function quotaKey(subject: string): string {
  return `q:${monthKey()}:${subject}`
}

export function quotaLimit(env: Env, plan: EffectivePlan): number {
  const raw = plan === 'api' ? env.QUOTA_API : plan === 'pro' ? env.QUOTA_PRO : env.QUOTA_FREE
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}

export async function getUsage(env: Env, subject: string): Promise<number> {
  const n = Number((await env.KV.get(quotaKey(subject))) ?? 0)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Read-modify-write; a lost update under a race only under-counts, which is acceptable here. */
export async function incrementUsage(env: Env, subject: string): Promise<number> {
  const next = (await getUsage(env, subject)) + 1
  await env.KV.put(quotaKey(subject), String(next), { expirationTtl: QUOTA_TTL })
  return next
}

export async function getCachedSub(env: Env, customerId: string): Promise<SubStatus | null> {
  return env.KV.get<SubStatus>(`sub:${customerId}`, 'json')
}

export async function putCachedSub(env: Env, customerId: string, status: SubStatus): Promise<void> {
  await env.KV.put(`sub:${customerId}`, JSON.stringify(status), { expirationTtl: SUB_TTL })
}

/** Tokens issued before this unix time are rejected for the customer (`/billing/rotate`). */
export async function getMinIat(env: Env, customerId: string): Promise<number> {
  const n = Number((await env.KV.get(`kmin:${customerId}`)) ?? 0)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export async function setMinIat(env: Env, customerId: string, ts: number): Promise<void> {
  await env.KV.put(`kmin:${customerId}`, String(ts))
}
