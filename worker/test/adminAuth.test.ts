import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword, storedHashProblem, mintSession, verifySession, now, MAX_PBKDF2_ITERATIONS } from '../src/adminAuth'
import { mint } from '../src/token'

const SECRET = 'admin-test-secret-0123456789abcdef'
const OTHER = 'a-different-secret-0123456789abcd'

describe('admin password', () => {
  it('accepts the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse battery staple')
    expect(await verifyPassword('correct horse battery staple', stored)).toBe(true)
    expect(await verifyPassword('correct horse battery stapl', stored)).toBe(false)
    expect(await verifyPassword('', stored)).toBe(false)
  })

  it('salts, so the same password hashes differently every time', async () => {
    const a = await hashPassword('same password')
    const b = await hashPassword('same password')
    expect(a).not.toBe(b)
    expect(await verifyPassword('same password', a)).toBe(true)
    expect(await verifyPassword('same password', b)).toBe(true)
  })

  it('never stores the password itself', async () => {
    const stored = await hashPassword('hunter2-hunter2')
    expect(stored).not.toContain('hunter2')
  })

  it('stays within the iteration count this runtime allows', async () => {
    // Workers reject PBKDF2 above 100k. Node does not, so without this assertion the mismatch
    // only shows up in production as a 500 on every login.
    expect(MAX_PBKDF2_ITERATIONS).toBeLessThanOrEqual(100_000)
    const stored = await hashPassword('a password')
    expect(Number(stored.split('$')[1])).toBeLessThanOrEqual(100_000)
    expect(storedHashProblem(stored)).toBeNull()
  })

  it('reports an unusable stored hash rather than failing inside crypto', async () => {
    expect(storedHashProblem(`pbkdf2$200000$c2FsdA==$aGFzaA==`)).toMatch(/above the 100000/)
    expect(storedHashProblem('nonsense')).toMatch(/not in the expected format/)
    expect(storedHashProblem('pbkdf2$5$c2FsdA==$aGFzaA==')).toMatch(/invalid iteration count/)
    // and it is still refused by the comparison itself, not merely reported
    expect(await verifyPassword('anything', 'pbkdf2$200000$c2FsdA==$aGFzaA==')).toBe(false)
  })

  it('refuses a malformed or hostile stored hash instead of throwing', async () => {
    for (const bad of ['', 'nonsense', 'pbkdf2$x$y$z', 'pbkdf2$200000$!!!$!!!', 'md5$1$a$b', 'pbkdf2$1$a$b', 'pbkdf2$200000$c2FsdA==$aGFzaA==']) {
      expect(await verifyPassword('anything', bad), bad).toBe(false)
    }
  })
})

describe('admin session', () => {
  it('mint -> verify roundtrip', async () => {
    const token = await mintSession(SECRET)
    expect(token.startsWith('pxa_')).toBe(true)
    const claims = await verifySession(SECRET, token)
    expect(claims?.sub).toBe('admin')
    expect(claims?.v).toBe(1)
  })

  it('rejects a token signed with another secret', async () => {
    expect(await verifySession(OTHER, await mintSession(SECRET))).toBeNull()
  })

  it('rejects a tampered payload', async () => {
    const token = await mintSession(SECRET)
    const [body, sig] = token.slice(4).split('.')
    const forged = `pxa_${body.slice(0, -2)}XY.${sig}`
    expect(await verifySession(SECRET, forged)).toBeNull()
  })

  it('rejects an expired session', async () => {
    expect(await verifySession(SECRET, await mintSession(SECRET, -1))).toBeNull()
  })

  it('rejects every session issued before the revocation watermark', async () => {
    const token = await mintSession(SECRET)
    expect(await verifySession(SECRET, token, now() - 60)).not.toBeNull()
    expect(await verifySession(SECRET, token, now() + 60)).toBeNull()
  })

  it('will not accept a customer entitlement as an admin session', async () => {
    // The whole point of the separate prefix and secret: paying for Pro must never be a way in.
    const entitlement = await mint(SECRET, { sub: 'cus_X', email: 'a@b.c', plan: 'pro' }, 3600)
    expect(await verifySession(SECRET, entitlement)).toBeNull()
  })

  it('rejects junk without throwing', async () => {
    for (const bad of ['', 'pxa_', 'pxa_.', 'pxa_abc', 'nope', `pxa_${'x'.repeat(5000)}.y`]) {
      expect(await verifySession(SECRET, bad), bad).toBeNull()
    }
  })
})
