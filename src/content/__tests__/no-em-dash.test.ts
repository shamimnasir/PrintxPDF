import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

/** House style: no em dashes anywhere a visitor or a crawler can read. */
const files = [
  ...globSync('src/content/**/*.ts'), ...globSync('src/pages/**/*.tsx'), ...globSync('src/features/**/*.{ts,tsx}'), ...globSync('src/admin/**/*.{ts,tsx}'),
  ...globSync('src/components/**/*.tsx'), ...globSync('src/lib/**/*.ts'), ...globSync('scripts/*.mjs'), 'public/site-config.json', 'index.html',
].filter((f) => !f.includes('__tests__'))

describe('copy style', () => {
  it('never uses an em dash', () => {
    const offenders = files.filter((f) => readFileSync(f, 'utf8').includes('—')).map((f) => `${f}`)
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})
