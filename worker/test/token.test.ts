import { describe, expect, it } from 'vitest'
import { mint, verify } from '../src/token'

const SECRET = 'unit-test-secret-0123456789abcdef'
const claims = { sub: 'cus_TEST123', email: 'user@example.com', plan: 'pro' as const }

describe('token', () => {
  it('mint -> verify roundtrip', async () => {
    const token = await mint(SECRET, claims, 3600)
    expect(token.startsWith('pxp_')).toBe(true)
    expect(token.split('.')).toHaveLength(2)
    const out = await verify(SECRET, token)
    expect(out).not.toBeNull()
    expect(out).toMatchObject({ v: 1, sub: 'cus_TEST123', email: 'user@example.com', plan: 'pro' })
    expect(out!.exp - out!.iat).toBe(3600)
  })

  it('rejects a tampered signature', async () => {
    const token = await mint(SECRET, claims, 3600)
    const [body, sig] = token.split('.')
    const flipped = (sig[0] === 'A' ? 'B' : 'A') + sig.slice(1)
    expect(await verify(SECRET, `${body}.${flipped}`)).toBeNull()
  })

  it('rejects a tampered payload (plan upgrade)', async () => {
    const token = await mint(SECRET, claims, 3600)
    const [body, sig] = token.split('.')
    const raw = atob(body.slice('pxp_'.length).replace(/-/g, '+').replace(/_/g, '/'))
    const forged = btoa(raw.replace('"plan":"pro"', '"plan":"api"')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(await verify(SECRET, `pxp_${forged}.${sig}`)).toBeNull()
  })

  it('rejects an expired token', async () => {
    const token = await mint(SECRET, claims, -1)
    expect(await verify(SECRET, token)).toBeNull()
  })

  it('kmin rejects tokens issued before the revocation floor', async () => {
    const token = await mint(SECRET, claims, 3600)
    const out = await verify(SECRET, token)
    expect(out).not.toBeNull()
    expect(await verify(SECRET, token, out!.iat)).not.toBeNull()
    expect(await verify(SECRET, token, out!.iat + 1)).toBeNull()
  })

  it('rejects the wrong secret', async () => {
    const token = await mint(SECRET, claims, 3600)
    expect(await verify('some-other-secret', token)).toBeNull()
  })

  it('rejects garbage', async () => {
    for (const bad of ['', 'pxp_', 'pxp_abc', 'pxp_abc.', 'pxp_.abc', 'abc.def', 'pxp_!!.??', 'pxp_YQ.YQ']) {
      expect(await verify(SECRET, bad)).toBeNull()
    }
  })
})
