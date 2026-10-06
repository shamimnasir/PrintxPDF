import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ALL_POSTS } from '../../../content'
import { guideCoverAlt, guideCoverUrl } from '../guideCoverUtils'

describe('guide artwork mapping', () => {
  it('gives every English guide a distinct, existing image', () => {
    const urls = ALL_POSTS.map((post) => guideCoverUrl(post.slug))
    expect(new Set(urls).size).toBe(ALL_POSTS.length)
    for (const url of urls) {
      const filename = url.split('/').pop()
      expect(filename).toBeTruthy()
      expect(existsSync(resolve(process.cwd(), 'public/images/guides', filename!))).toBe(true)
    }
  })

  it('keeps the guide alt text in the page language', () => {
    expect(guideCoverAlt('bn', 'qr-code-for-print', 'প্রিন্টের জন্য QR কোড')).toBe('প্রিন্টের জন্য QR কোড')
    expect(guideCoverUrl('qr-code-for-print')).toContain('qr-print-cover.jpg')
  })
})
