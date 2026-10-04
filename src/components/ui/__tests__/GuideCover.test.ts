import { describe, expect, it } from 'vitest'
import { guideClusterArt, guideCoverAlt, guideCoverUrl, guideToolArt } from '../GuideCover'

describe('guide artwork mapping', () => {
  it('uses the same subject artwork for equivalent translations', () => {
    const art = guideToolArt('qr-code')
    expect(art).toBe('qr')
    expect(guideCoverUrl(art)).toContain('qr-print-cover.jpg')
    expect(guideCoverAlt('bn', art)).toContain('QR')
  })

  it('selects subject artwork for English guide clusters', () => {
    expect(guideClusterArt('ocr')).toBe('scan')
    expect(guideClusterArt('privacy')).toBe('privacy')
    expect(guideClusterArt('print')).toBe('print')
  })
})
