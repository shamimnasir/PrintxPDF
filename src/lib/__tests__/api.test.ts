import { describe, expect, it } from 'vitest'
import { ApiError, convertRemote, decodeToken, describeError, outputName, type Transport } from '../api'

const respond =
  (status: number, body: string | Blob, headers: Record<string, string> = {}): Transport =>
  async () => ({ status, headers: new Headers(headers), blob: typeof body === 'string' ? new Blob([body], { type: 'application/json' }) : body })
const busy = () => ({ status: 503, headers: new Headers({ 'retry-after': '0' }), blob: new Blob([JSON.stringify({ code: 'busy', error: 'busy' })]) })
const deck = new File([new Uint8Array([1, 2, 3])], 'deck.pptx')

describe('convertRemote', () => {
  it('names the output after the input with the target extension', () => {
    expect(outputName('ppt-to-pdf', 'Q3 deck.pptx')).toBe('Q3 deck.pdf')
    expect(outputName('pdf-to-ppt', 'a.b.pdf')).toBe('a.b.pptx')
  })

  it('returns the converted blob and parses the usage header', async () => {
    const r = await convertRemote('ppt-to-pdf', deck, { transport: respond(200, new Blob(['%PDF-1.4'], { type: 'application/pdf' }), { 'x-pxp-usage': '3/5' }) })
    expect(r.name).toBe('deck.pdf')
    expect(await r.blob.text()).toBe('%PDF-1.4')
    expect(r.usage).toEqual({ used: 3, limit: 5 })
  })

  it('throws a typed error carrying the server code and data', async () => {
    await expect(convertRemote('ppt-to-pdf', deck, { transport: respond(402, JSON.stringify({ error: 'x', code: 'quota_exceeded', used: 5, limit: 5 })) })).rejects.toMatchObject({
      status: 402,
      code: 'quota_exceeded',
      data: { used: 5, limit: 5 },
    })
  })

  it('retries while the converter is busy, then succeeds', async () => {
    let n = 0
    const t: Transport = async () => (++n < 3 ? busy() : { status: 200, headers: new Headers(), blob: new Blob(['ok']) })
    const r = await convertRemote('epub-to-pdf', deck, { transport: t })
    expect(n).toBe(3)
    expect(await r.blob.text()).toBe('ok')
  })

  it('gives up after the retry budget', async () => {
    await expect(convertRemote('epub-to-pdf', deck, { transport: async () => busy(), retries: 1 })).rejects.toMatchObject({ code: 'busy' })
  })

  it('sends the bearer token and an encoded file name', async () => {
    let seen: Record<string, string> = {}
    const t: Transport = async (req) => {
      seen = req.headers
      return { status: 200, headers: new Headers(), blob: new Blob(['ok']) }
    }
    await convertRemote('mobi-to-pdf', new File(['x'], 'my book.mobi'), { token: 'pxp_abc.def', transport: t })
    expect(seen.authorization).toBe('Bearer pxp_abc.def')
    expect(seen['x-file-name']).toBe('my%20book.mobi')
  })
})

describe('describeError', () => {
  it('maps free-tier quota exhaustion to an upgrade prompt', () => {
    const d = describeError(new ApiError(402, 'quota_exceeded', 'x', { used: 5, limit: 5 }))
    expect(d.upgrade).toBe(true)
    expect(d.message).toContain('5')
  })
  it('points expired keys at the account page', () => {
    expect(describeError(new ApiError(401, 'invalid_token', 'x')).account).toBe(true)
  })
  it('passes unknown errors through', () => {
    expect(describeError(new Error('boom')).message).toBe('boom')
  })
})

describe('decodeToken', () => {
  it('reads plan and customer from the payload without verifying it', () => {
    const payload = btoa(JSON.stringify({ v: 1, sub: 'cus_1', email: 'a@b.c', plan: 'pro', iat: 1, exp: 2 })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect(decodeToken(`pxp_${payload}.sig`)).toMatchObject({ sub: 'cus_1', plan: 'pro', email: 'a@b.c' })
  })
  it('rejects anything that is not a key', () => {
    expect(decodeToken('nope')).toBeNull()
    expect(decodeToken('pxp_!!!.x')).toBeNull()
  })
})
