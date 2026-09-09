import { describe, expect, it } from 'vitest'
import { TOOL_CONTENT, isFilled } from '../tools'
import { TOOLS } from '../../features/pdf/toolsMeta'

describe('tool page content', () => {
  it('has an entry for every registered tool and none for ghosts', () => {
    const slugs = TOOLS.map((t) => t.slug).sort()
    expect(Object.keys(TOOL_CONTENT).sort()).toEqual(slugs)
  })

  it('is complete wherever it has been written', () => {
    for (const c of Object.values(TOOL_CONTENT)) {
      if (!isFilled(c)) continue
      const words = c.answer.trim().split(/\s+/).length
      expect(words, `${c.slug} answer words`).toBeGreaterThanOrEqual(25)
      expect(words, `${c.slug} answer words`).toBeLessThanOrEqual(60)
      expect(c.what.length, `${c.slug} what`).toBeGreaterThanOrEqual(1)
      expect(c.why.length, `${c.slug} why`).toBeGreaterThanOrEqual(3)
      expect(c.how.length, `${c.slug} how`).toBeGreaterThanOrEqual(3)
      expect(c.faqs.length, `${c.slug} faqs`).toBeGreaterThanOrEqual(3)
      expect(c.entities.length, `${c.slug} entities`).toBeGreaterThanOrEqual(3)
      expect(c.keywords.length, `${c.slug} keywords`).toBeGreaterThanOrEqual(3)
      if (c.metaTitle) expect(c.metaTitle.length, `${c.slug} title length`).toBeLessThanOrEqual(65)
      if (c.metaDescription) {
        expect(c.metaDescription.length, `${c.slug} meta min`).toBeGreaterThanOrEqual(120)
        expect(c.metaDescription.length, `${c.slug} meta max`).toBeLessThanOrEqual(160)
      }
      const text = JSON.stringify(c)
      expect(text, `${c.slug} em dash`).not.toContain('—')
      expect(text.toLowerCase(), `${c.slug} names a competitor`).not.toMatch(/printfriendly|ilovepdf|smallpdf|cloudconvert/)
    }
  })
})
