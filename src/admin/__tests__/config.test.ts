import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, discardDraft, exportConfig, getConfig, hasDraft, importConfig, merge, updateConfig } from '../config'

beforeEach(() => {
  localStorage.clear()
  discardDraft()
})

describe('merge', () => {
  it('deep-merges objects and replaces arrays and scalars', () => {
    const base = { a: 1, b: { c: 2, d: 3 }, e: [1, 2] }
    const out = merge(base, { b: { c: 9 }, e: [7] })
    expect(out).toEqual({ a: 1, b: { c: 9, d: 3 }, e: [7] })
  })
  it('keeps the base when the patch is undefined', () => {
    expect(merge({ a: 1 }, undefined)).toEqual({ a: 1 })
  })
  it('does not mutate the base', () => {
    const base = { b: { c: 2 } }
    merge(base, { b: { c: 5 } })
    expect(base.b.c).toBe(2)
  })
})

describe('config draft', () => {
  it('starts with no draft and returns defaults', () => {
    expect(hasDraft()).toBe(false)
    expect(getConfig().site.name).toBe(DEFAULT_CONFIG.site.name)
  })

  it('layers a partial update over the defaults without dropping siblings', () => {
    updateConfig({ site: { name: 'Renamed' } as never })
    expect(getConfig().site.name).toBe('Renamed')
    expect(getConfig().site.url).toBe(DEFAULT_CONFIG.site.url)
    expect(hasDraft()).toBe(true)
  })

  it('accumulates several updates', () => {
    updateConfig({ theme: { accent: '#ff0000' } as never })
    updateConfig({ theme: { accentFg: '#000000' } as never })
    expect(getConfig().theme.accent).toBe('#ff0000')
    expect(getConfig().theme.accentFg).toBe('#000000')
    expect(getConfig().theme.ink).toBe(DEFAULT_CONFIG.theme.ink)
  })

  it('discards a draft back to the published config', () => {
    updateConfig({ site: { name: 'Temp' } as never })
    discardDraft()
    expect(hasDraft()).toBe(false)
    expect(getConfig().site.name).toBe(DEFAULT_CONFIG.site.name)
  })

  it('round-trips through export and import', () => {
    updateConfig({ site: { name: 'Exported' } as never, tools: { hidden: ['merge-pdf'] } as never })
    const json = exportConfig()
    discardDraft()
    expect(getConfig().site.name).toBe(DEFAULT_CONFIG.site.name)
    importConfig(json)
    expect(getConfig().site.name).toBe('Exported')
    expect(getConfig().tools.hidden).toEqual(['merge-pdf'])
  })

  it('stamps an updated date on every change', () => {
    updateConfig({ site: { name: 'Dated' } as never })
    expect(getConfig().updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('produces valid JSON on export', () => {
    updateConfig({ code: { css: '.x { color: red }' } as never })
    expect(() => JSON.parse(exportConfig())).not.toThrow()
  })
})
