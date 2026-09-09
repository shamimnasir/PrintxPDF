import { describe, expect, it } from 'vitest'
import { zipStore, zipBlobs } from '../zip'

const u8 = (s: string) => new TextEncoder().encode(s)
const read = async (b: Blob) => new Uint8Array(await b.arrayBuffer())
const u16 = (d: DataView, o: number) => d.getUint16(o, true)
const u32 = (d: DataView, o: number) => d.getUint32(o, true)

describe('zipStore', () => {
  it('writes the local header, central directory and end record', async () => {
    const bytes = await read(zipStore([{ name: 'a.txt', data: u8('hello') }]))
    const d = new DataView(bytes.buffer)
    expect(u32(d, 0)).toBe(0x04034b50) // local file header
    expect(u16(d, 8)).toBe(0) // stored, not deflated
    expect(u32(d, 18)).toBe(5) // compressed size
    expect(u32(d, 22)).toBe(5) // uncompressed size

    // end-of-central-directory is the last 22 bytes
    const end = new DataView(bytes.buffer, bytes.length - 22)
    expect(u32(end, 0)).toBe(0x06054b50)
    expect(u16(end, 8)).toBe(1) // entries on this disk
    expect(u16(end, 10)).toBe(1) // total entries
  })

  it('stores file contents verbatim so an extractor gets the original bytes', async () => {
    const payload = 'the quick brown fox'
    const bytes = await read(zipStore([{ name: 'f.txt', data: u8(payload) }]))
    const nameLen = u16(new DataView(bytes.buffer), 26)
    const start = 30 + nameLen
    expect(new TextDecoder().decode(bytes.slice(start, start + payload.length))).toBe(payload)
  })

  it('records every entry and points the central directory at the right offsets', async () => {
    const files = [
      { name: 'one.txt', data: u8('1') },
      { name: 'two.txt', data: u8('22') },
      { name: 'three.txt', data: u8('333') },
    ]
    const bytes = await read(zipStore(files))
    const end = new DataView(bytes.buffer, bytes.length - 22)
    expect(u16(end, 10)).toBe(3)

    const cdOffset = u32(end, 16)
    const cd = new DataView(bytes.buffer, cdOffset)
    expect(u32(cd, 0)).toBe(0x02014b50)
    // the first central record must point at a real local header
    const localOffset = u32(cd, 42)
    expect(u32(new DataView(bytes.buffer, localOffset), 0)).toBe(0x04034b50)
  })

  it('marks filenames as UTF-8 and preserves non-ASCII names', async () => {
    const bytes = await read(zipStore([{ name: 'café-πage.pdf', data: u8('x') }]))
    const d = new DataView(bytes.buffer)
    expect(u16(d, 6) & 0x0800).toBe(0x0800) // language encoding flag
    const nameLen = u16(d, 26)
    expect(new TextDecoder().decode(bytes.slice(30, 30 + nameLen))).toBe('café-πage.pdf')
  })

  it('renames duplicates instead of silently dropping them', async () => {
    const bytes = await read(zipStore([
      { name: 'page.pdf', data: u8('a') },
      { name: 'page.pdf', data: u8('b') },
    ]))
    const text = new TextDecoder().decode(bytes)
    expect(text).toContain('page.pdf')
    expect(text).toContain('page (2).pdf')
    const end = new DataView(bytes.buffer, bytes.length - 22)
    expect(u16(end, 10)).toBe(2)
  })

  it('produces a distinct CRC per entry', async () => {
    const bytes = await read(zipStore([{ name: 'a', data: u8('aaaa') }, { name: 'b', data: u8('bbbb') }]))
    const d = new DataView(bytes.buffer)
    const crcA = u32(d, 14)
    const second = 30 + 1 + 4
    const crcB = u32(d, second + 14)
    expect(crcA).not.toBe(crcB)
    expect(crcA).toBeGreaterThan(0)
  })

  it('zips blobs end to end', async () => {
    const blob = await zipBlobs([{ name: 'x.pdf', blob: new Blob(['pdf-bytes']) }])
    expect(blob.type).toBe('application/zip')
    const bytes = await read(blob)
    expect(new DataView(bytes.buffer).getUint32(0, true)).toBe(0x04034b50)
  })

  it('handles an empty archive without corrupting the end record', async () => {
    const bytes = await read(zipStore([]))
    expect(bytes.length).toBe(22)
    const end = new DataView(bytes.buffer)
    expect(u32(end, 0)).toBe(0x06054b50)
    expect(u16(end, 10)).toBe(0)
  })
})
