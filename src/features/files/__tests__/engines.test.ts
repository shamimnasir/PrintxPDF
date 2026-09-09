import { describe, expect, it } from 'vitest'
import { fitWithin, formatDelta, formatOf, isHeic, isImageFile, isSvg, outName, pickSmaller } from '../engines'

const f = (name: string, type = '') => ({ name, type })

describe('formatDelta', () => {
  it('describes a reduction', () => {
    expect(formatDelta(2.4 * 1024 * 1024, 310 * 1024)).toBe('2.40 MB → 310.0 KB, 87% smaller')
  })
  it('describes growth', () => {
    expect(formatDelta(100, 150)).toBe('100 B → 150 B, 50% larger')
  })
  it('handles same size and zero input', () => {
    expect(formatDelta(500, 500)).toBe('500 B → 500 B, same size')
    expect(formatDelta(0, 10)).toBe('0 B → 10 B')
  })
})

describe('pickSmaller (never make a file bigger)', () => {
  it('returns the candidate when it is smaller', () => {
    const r = pickSmaller({ size: 100 }, { size: 60 })
    expect(r.kept).toBe(false)
    expect(r.blob.size).toBe(60)
    expect(r.note).toBeUndefined()
  })
  it('keeps the original and explains when the candidate is larger', () => {
    const r = pickSmaller({ size: 100 }, { size: 130 })
    expect(r.kept).toBe(true)
    expect(r.blob.size).toBe(100)
    expect(r.note).toMatch(/30% larger/)
    expect(r.note).toMatch(/original was kept/)
  })
  it('keeps the original on a tie', () => {
    expect(pickSmaller({ size: 100 }, { size: 100 }).kept).toBe(true)
  })
})

describe('name and extension mapping', () => {
  it('outName swaps the extension', () => {
    expect(outName('IMG_0001.HEIC', 'jpg')).toBe('IMG_0001.jpg')
    expect(outName('logo.svg', 'png')).toBe('logo.png')
    expect(outName('archive.tar.gz', 'webp')).toBe('archive.tar.webp')
    expect(outName('noext', 'png')).toBe('noext.png')
  })
  it('isHeic by type or extension', () => {
    expect(isHeic(f('a.heic'))).toBe(true)
    expect(isHeic(f('a.HEIF'))).toBe(true)
    expect(isHeic(f('a.bin', 'image/heic'))).toBe(true)
    expect(isHeic(f('a.jpg', 'image/jpeg'))).toBe(false)
  })
  it('isSvg', () => {
    expect(isSvg(f('x.svg'))).toBe(true)
    expect(isSvg(f('x', 'image/svg+xml'))).toBe(true)
    expect(isSvg(f('x.png', 'image/png'))).toBe(false)
  })
  it('isImageFile rejects non-images that drag-and-drop lets through', () => {
    expect(isImageFile(f('doc.pdf', 'application/pdf'))).toBe(false)
    expect(isImageFile(f('notes.txt', 'text/plain'))).toBe(false)
    expect(isImageFile(f('p.png', 'image/png'))).toBe(true)
    expect(isImageFile(f('p.heic', ''))).toBe(true)
  })
  it('formatOf maps to a re-encodable format', () => {
    expect(formatOf(f('a.png', 'image/png'))).toBe('png')
    expect(formatOf(f('a.JPEG', ''))).toBe('jpg')
    expect(formatOf(f('a.webp', 'image/webp'))).toBe('webp')
    expect(formatOf(f('a.gif', 'image/gif'))).toBeNull()
  })
})

describe('fitWithin', () => {
  it('scales down along the longest side and never up', () => {
    expect(fitWithin(4000, 3000, 1920)).toEqual({ w: 1920, h: 1440 })
    expect(fitWithin(3000, 4000, 800)).toEqual({ w: 600, h: 800 })
    expect(fitWithin(640, 480, 1920)).toEqual({ w: 640, h: 480 })
    expect(fitWithin(640, 480, null)).toEqual({ w: 640, h: 480 })
    expect(fitWithin(640, 480, 0)).toEqual({ w: 640, h: 480 })
  })
})
