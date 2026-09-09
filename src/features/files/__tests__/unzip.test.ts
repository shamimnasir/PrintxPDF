import { describe, expect, it } from 'vitest'
import { deflateRawSync } from 'node:zlib'
import { zipStore } from '../../../lib/zip'
import { ZipError, baseName, crc32, decodeName, listZip, openZip, readZipEntry, sanitizeZipPath } from '../unzip'

const u8 = (s: string) => new TextEncoder().encode(s)
const str = (b: Uint8Array) => new TextDecoder().decode(b)
const bytesOf = async (b: Blob) => new Uint8Array(await b.arrayBuffer())
const hasInflate = typeof DecompressionStream === 'function'

/** Minimal writer used only to produce what zipStore cannot: deflate, flags, comments. */
function buildZip(entries: { name: string; raw: Uint8Array; method: 0 | 8; flags?: number; size?: number }[], comment = '') {
  const enc = new TextEncoder()
  const parts: Uint8Array[] = []
  const cd: Uint8Array[] = []
  let off = 0
  for (const e of entries) {
    const data = e.method === 8 ? new Uint8Array(deflateRawSync(e.raw)) : e.raw
    const name = enc.encode(e.name)
    const crc = crc32(e.raw)
    const flags = e.flags ?? 0x0800
    const size = e.size ?? e.raw.length
    const lh = new DataView(new ArrayBuffer(30))
    lh.setUint32(0, 0x04034b50, true)
    lh.setUint16(4, 20, true)
    lh.setUint16(6, flags, true)
    lh.setUint16(8, e.method, true)
    lh.setUint32(14, crc, true)
    lh.setUint32(18, data.length, true)
    lh.setUint32(22, size, true)
    lh.setUint16(26, name.length, true)
    parts.push(new Uint8Array(lh.buffer), name, data)
    const c = new DataView(new ArrayBuffer(46))
    c.setUint32(0, 0x02014b50, true)
    c.setUint16(4, 20, true)
    c.setUint16(6, 20, true)
    c.setUint16(8, flags, true)
    c.setUint16(10, e.method, true)
    c.setUint32(16, crc, true)
    c.setUint32(20, data.length, true)
    c.setUint32(24, size, true)
    c.setUint16(28, name.length, true)
    c.setUint32(42, off, true)
    cd.push(new Uint8Array(c.buffer), name)
    off += 30 + name.length + data.length
  }
  const cdSize = cd.reduce((n, p) => n + p.length, 0)
  const cmt = enc.encode(comment)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true)
  end.setUint16(8, entries.length, true)
  end.setUint16(10, entries.length, true)
  end.setUint32(12, cdSize, true)
  end.setUint32(16, off, true)
  end.setUint16(20, cmt.length, true)
  const all = [...parts, ...cd, new Uint8Array(end.buffer), cmt]
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of all) {
    out.set(p, o)
    o += p.length
  }
  return out
}

describe('listZip / readZipEntry with archives from zipStore', () => {
  it('reads names, sizes and byte-exact contents back', async () => {
    const files = [
      { name: 'a.txt', data: u8('hello') },
      { name: 'dir/b.bin', data: new Uint8Array([0, 1, 2, 255, 254, 253]) },
      { name: 'empty.txt', data: new Uint8Array(0) },
    ]
    const bytes = await bytesOf(zipStore(files))
    const { entries, notes } = listZip(bytes)
    expect(entries.map((e) => e.name)).toEqual(['a.txt', 'dir/b.bin', 'empty.txt'])
    expect(entries.map((e) => e.size)).toEqual([5, 6, 0])
    expect(entries.every((e) => e.method === 0 && e.utf8 && !e.encrypted && !e.zip64 && !e.isDir)).toBe(true)
    expect(notes).toEqual([])
    for (let i = 0; i < files.length; i++) {
      const got = await readZipEntry(bytes, entries[i])
      expect(Array.from(got)).toEqual(Array.from(files[i].data))
    }
  })

  it('round-trips a UTF-8 name', async () => {
    const bytes = await bytesOf(zipStore([{ name: 'café-πage-বাংলা.pdf', data: u8('x') }]))
    const { entries } = listZip(bytes)
    expect(entries[0].name).toBe('café-πage-বাংলা.pdf')
    expect(entries[0].utf8).toBe(true)
    expect(entries[0].safeName).toBe('café-πage-বাংলা.pdf')
  })

  it('openZip reads lazily via read()', async () => {
    const z = openZip(await bytesOf(zipStore([{ name: 'q.txt', data: u8('lazy') }])))
    expect(str(await z.read(z.entries[0]))).toBe('lazy')
  })

  it('sanitises traversal names while keeping the raw name for display', async () => {
    const bytes = await bytesOf(zipStore([
      { name: '../../etc/passwd', data: u8('root') },
      { name: '/abs/path.txt', data: u8('a') },
      { name: 'C:\\win\\file.txt', data: u8('w') },
      { name: 'ok/./nested/../file.txt', data: u8('o') },
    ]))
    const { entries, notes } = listZip(bytes)
    expect(entries.map((e) => e.safeName)).toEqual(['etc/passwd', 'abs/path.txt', 'win/file.txt', 'ok/nested/file.txt'])
    expect(entries[0].name).toBe('../../etc/passwd')
    expect(notes.some((n) => /\.\./.test(n))).toBe(true)
    expect(str(await readZipEntry(bytes, entries[0]))).toBe('root')
  })

  it('flags a nested ZIP', async () => {
    const inner = await bytesOf(zipStore([{ name: 'x', data: u8('x') }]))
    const { notes } = listZip(await bytesOf(zipStore([{ name: 'inner.zip', data: inner }])))
    expect(notes.some((n) => /another ZIP/.test(n))).toBe(true)
  })

  it('reports a directory entry', async () => {
    const { entries } = listZip(await bytesOf(zipStore([{ name: 'folder/', data: new Uint8Array(0) }, { name: 'folder/f.txt', data: u8('f') }])))
    expect(entries[0].isDir).toBe(true)
    expect(entries[1].isDir).toBe(false)
  })
})

describe('hand-built archives', () => {
  it('parses an EOCD followed by a comment', async () => {
    const bytes = buildZip([{ name: 'c.txt', raw: u8('commented'), method: 0 }], 'made by a test, with a signature-free comment')
    const { entries, comment } = listZip(bytes)
    expect(comment).toBe('made by a test, with a signature-free comment')
    expect(str(await readZipEntry(bytes, entries[0]))).toBe('commented')
  })

  it('falls back to Latin-1 for names without the UTF-8 flag and says so', () => {
    const latin = new Uint8Array([0x63, 0x61, 0x66, 0xe9]) // "café" in Latin-1, invalid UTF-8
    expect(decodeName(latin, false)).toEqual({ name: 'café', fallback: true })
    expect(decodeName(u8('café'), false)).toEqual({ name: 'café', fallback: false })
    const bytes = buildZip([{ name: 'plain.txt', raw: u8('p'), method: 0, flags: 0 }])
    // patch the stored name bytes in both headers to Latin-1 "café.txt" (same length as plain.txt = 9)
    const target = new Uint8Array([0x63, 0x61, 0x66, 0xe9, 0x2e, 0x74, 0x78, 0x74, 0x21])
    for (let i = 0; i + 9 <= bytes.length; i++) if (str(bytes.subarray(i, i + 9)) === 'plain.txt') bytes.set(target, i)
    const { entries, notes } = listZip(bytes)
    expect(entries[0].name).toBe('café.txt!')
    expect(entries[0].utf8).toBe(false)
    expect(notes.some((n) => /Latin-1/.test(n))).toBe(true)
  })

  const deflateTest = hasInflate ? it : it.skip
  deflateTest('inflates a deflate entry through DecompressionStream', async () => {
    const text = 'deflate '.repeat(500)
    const bytes = buildZip([{ name: 'big.txt', raw: u8(text), method: 8 }])
    const { entries } = listZip(bytes)
    expect(entries[0].method).toBe(8)
    expect(entries[0].compressedSize).toBeLessThan(entries[0].size)
    expect(str(await readZipEntry(bytes, entries[0]))).toBe(text)
  })
  if (!hasInflate) it.skip('deflate: DecompressionStream is not available in this test environment', () => {})

  it('rejects an encrypted entry with a clear message', async () => {
    const bytes = buildZip([{ name: 'secret.txt', raw: u8('s'), method: 0, flags: 0x0801 }])
    const { entries } = listZip(bytes)
    expect(entries[0].encrypted).toBe(true)
    await expect(readZipEntry(bytes, entries[0])).rejects.toThrow(/password-protected/)
  })

  it('rejects an unsupported method', async () => {
    const bytes = buildZip([{ name: 'bz.txt', raw: u8('s'), method: 0 }])
    const { entries } = listZip(bytes)
    const bogus = { ...entries[0], method: 12 }
    await expect(readZipEntry(bytes, bogus)).rejects.toThrow(/method 12/)
  })

  it('rejects ZIP64 markers instead of returning garbage', () => {
    const bytes = buildZip([{ name: 'x', raw: u8('x'), method: 0 }])
    const dv = new DataView(bytes.buffer)
    dv.setUint32(bytes.length - 22 + 16, 0xffffffff, true) // CD offset = ZIP64 sentinel
    expect(() => listZip(bytes)).toThrow(ZipError)
    expect(() => listZip(bytes)).toThrow(/ZIP64/)
  })

  it('marks an entry with a ZIP64 size sentinel and refuses to read it', async () => {
    const bytes = buildZip([{ name: 'huge', raw: u8('h'), method: 0, size: 0xffffffff }])
    const { entries } = listZip(bytes)
    expect(entries[0].zip64).toBe(true)
    await expect(readZipEntry(bytes, entries[0])).rejects.toThrow(/ZIP64/)
  })

  it('detects a CRC mismatch', async () => {
    const bytes = buildZip([{ name: 'c', raw: u8('abc'), method: 0 }])
    bytes[30 + 1] = 0x7a // corrupt the first data byte ('a' -> 'z')
    const { entries } = listZip(bytes)
    await expect(readZipEntry(bytes, entries[0])).rejects.toThrow(/CRC/)
  })
})

describe('bad input', () => {
  it('throws cleanly on a truncated buffer', async () => {
    const full = await bytesOf(zipStore([{ name: 'a.txt', data: u8('hello world') }]))
    expect(() => listZip(full.subarray(0, full.length - 5))).toThrow(ZipError)
    expect(() => listZip(full.subarray(0, full.length - 5))).toThrow(/truncated|end of this ZIP/)
    expect(() => listZip(full.subarray(0, 10))).toThrow(/too small/)
  })

  it('throws not-zip for random bytes', () => {
    const junk = new Uint8Array(64).fill(0x41)
    try {
      listZip(junk)
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(ZipError)
      expect((e as ZipError).code).toBe('not-zip')
    }
  })

  it('throws when the data section is cut off even though the directory survived', async () => {
    const full = await bytesOf(zipStore([{ name: 'a.txt', data: u8('0123456789') }]))
    const { entries } = listZip(full)
    // lie about the compressed size so the read runs past the buffer
    await expect(readZipEntry(full, { ...entries[0], compressedSize: 10_000 })).rejects.toThrow(/past the end/)
  })
})

describe('helpers', () => {
  it('sanitizeZipPath', () => {
    expect(sanitizeZipPath('../../x')).toBe('x')
    expect(sanitizeZipPath('/etc/passwd')).toBe('etc/passwd')
    expect(sanitizeZipPath('a\\b\\c.txt')).toBe('a/b/c.txt')
    expect(sanitizeZipPath('..')).toBe('unnamed')
    expect(sanitizeZipPath('')).toBe('unnamed')
    expect(sanitizeZipPath('we:ird?.txt')).toBe('we_ird_.txt')
  })
  it('baseName', () => {
    expect(baseName('a/b/c.txt')).toBe('c.txt')
    expect(baseName('c.txt')).toBe('c.txt')
  })
  it('crc32 matches the known vector', () => {
    expect(crc32(u8('123456789'))).toBe(0xcbf43926)
  })
})
