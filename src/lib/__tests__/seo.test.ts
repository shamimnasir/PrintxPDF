import { describe, expect, it } from 'vitest'
import { articleSchema, authorPath, authorPerson, orgSchema, profileSchema, SITE_URL, slugify } from '../seo'

const author = { name: 'Nasir Uddin Shamim', title: 'Founder, PrintxPDF', bio: 'Builds the site.', photo: '', links: { linkedin: '', x: '', github: 'https://github.com/shamimnasir', website: '' } }

describe('author attribution', () => {
  it('derives a stable author URL from the name', () => {
    expect(slugify('Nasir Uddin Shamim')).toBe('nasir-uddin-shamim')
    expect(authorPath(author)).toBe('/author/nasir-uddin-shamim')
  })

  it('builds a Person that Article.author and Organization.founder can share', () => {
    const p = authorPerson(author)
    expect(p['@type']).toBe('Person')
    expect(p['@id']).toBe(`${SITE_URL}/author/nasir-uddin-shamim#person`)
    expect(p.name).toBe('Nasir Uddin Shamim')
    expect(p.jobTitle).toBe('Founder, PrintxPDF')
    // empty links must not leak into sameAs
    expect(p.sameAs).toEqual(['https://github.com/shamimnasir'])
    expect(orgSchema(author)).toMatchObject({ founder: { name: 'Nasir Uddin Shamim' } })
  })

  it('credits the author on articles and attaches the founder to the publisher', () => {
    const a = articleSchema({ title: 'T', description: 'D', path: '/blog/x/y', published: '2026-01-01', updated: '2026-02-01', keywords: ['k'], answer: 'A', readMinutes: 3, author }) as { author: { '@type': string; name: string }; publisher: { founder?: { name: string } } }
    expect(a.author['@type']).toBe('Person')
    expect(a.author.name).toBe('Nasir Uddin Shamim')
    expect(a.publisher.founder?.name).toBe('Nasir Uddin Shamim')
  })

  it('falls back to the organisation when no author is supplied', () => {
    const a = articleSchema({ title: 'T', description: 'D', path: '/p', published: '2026-01-01', updated: '2026-02-01', keywords: [], answer: 'A', readMinutes: 1 }) as { author: { '@type': string } }
    expect(a.author['@type']).toBe('Organization')
  })

  it('describes the profile page with the topics the author covers', () => {
    const s = profileSchema(author, ['Merge PDF'])
    expect(s['@type']).toBe('ProfilePage')
    expect(s.mainEntity.knowsAbout).toEqual(['Merge PDF'])
  })
})
