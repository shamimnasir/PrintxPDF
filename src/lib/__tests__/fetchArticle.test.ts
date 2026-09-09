import { describe, expect, it } from 'vitest'
import { fetchArticle, markdownToHtml, normalizeUrl } from '../fetchArticle'

const html = `<html><head><title>T</title></head><body><article>${'<p>word </p>'.repeat(60)}</article></body></html>`

describe('normalizeUrl', () => {
  it('adds https and validates', () => {
    expect(normalizeUrl('example.com/a')).toBe('https://example.com/a')
    expect(() => normalizeUrl('')).toThrow()
    expect(() => normalizeUrl('nodots')).toThrow()
  })
})

describe('fetchArticle proxy chain', () => {
  it('falls through failing proxies and returns the first success', async () => {
    const calls: string[] = []
    const fakeFetch = (async (url: string) => {
      calls.push(url)
      if (url.includes('allorigins')) return new Response('nope', { status: 500 })
      if (url.includes('codetabs')) return new Response(html, { status: 200 })
      throw new Error('should not reach')
    }) as unknown as typeof fetch
    const page = await fetchArticle('https://example.com/x', undefined, fakeFetch)
    expect(page.via).toBe('codetabs')
    expect(page.kind).toBe('html')
    expect(calls.length).toBe(2)
  })
  it('throws a helpful error when every proxy fails', async () => {
    const fakeFetch = (async () => new Response('', { status: 503 })) as unknown as typeof fetch
    await expect(fetchArticle('https://example.com', undefined, fakeFetch)).rejects.toThrow(/Paste the page/)
  })
  it('parses allorigins JSON envelope', async () => {
    const fakeFetch = (async (url: string) =>
      url.includes('allorigins') ? new Response(JSON.stringify({ contents: html, status: { http_code: 200 } })) : new Response('', { status: 500 })) as unknown as typeof fetch
    const page = await fetchArticle('example.com', undefined, fakeFetch)
    expect(page.via).toBe('allorigins')
  })
})

describe('markdownToHtml', () => {
  it('converts headings, lists, links and images', () => {
    const { title, html } = markdownToHtml('Title: Hello\n\n# Head\n\n- one\n- two\n\nSee [x](https://x.y) ![alt](https://i.png)')
    expect(title).toBe('Hello')
    expect(html).toContain('<h1>Head</h1>')
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>')
    expect(html).toContain('<a href="https://x.y">x</a>')
    expect(html).toContain('<img alt="alt" src="https://i.png">')
  })
})
