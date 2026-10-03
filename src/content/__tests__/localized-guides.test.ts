import { describe, expect, it } from 'vitest'
import { LANGUAGE_PACKS, localizedContentIssues } from '../localizedGuides'
import { TOOLS } from '../../features/pdf/toolsMeta'

describe('localized guide pilot', () => {
  it('has complete, substantial translated guides with unique URLs and aligned topics', () => {
    expect(localizedContentIssues()).toEqual([])
  })

  it('links every localized guide to an existing tool', () => {
    const slugs = new Set(TOOLS.map((tool) => tool.slug))
    for (const pack of LANGUAGE_PACKS) {
      for (const guide of pack.guides) expect(slugs.has(guide.tool), `${pack.locale}: ${guide.tool}`).toBe(true)
    }
  })
})
