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
  it('asks every proxy and returns the HTML success', async () => {
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
    expect(calls.length).toBe(3) // every proxy is asked concurrently
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

describe('fetchArticle concurrency', () => {
  it('prefers an HTML proxy that answers within the grace window over a faster markdown one', async () => {
    const fakeFetch = (async (url: string) => {
      if (url.includes('r.jina.ai')) return new Response('Title: T\n\n' + 'word '.repeat(100))
      if (url.includes('codetabs')) {
        await new Promise((r) => setTimeout(r, 300))
        return new Response(html)
      }
      return new Response('', { status: 500 })
    }) as unknown as typeof fetch
    const page = await fetchArticle('https://example.com', undefined, fakeFetch)
    expect(page.kind).toBe('html')
  })
  it('falls back to markdown when every HTML proxy fails', async () => {
    const fakeFetch = (async (url: string) => (url.includes('r.jina.ai') ? new Response('Title: T\n\n' + 'word '.repeat(100)) : new Response('', { status: 500 }))) as unknown as typeof fetch
    const page = await fetchArticle('https://example.com', undefined, fakeFetch)
    expect(page.kind).toBe('markdown')
  })
})

describe('markdownToHtml extras', () => {
  it('handles pipe tables, footnote refs and spaced italics', () => {
    const { html } = markdownToHtml('| a | b |\n| --- | --- |\n| 1 | 2 |\n\nText[[1]](https://x) and _ The Times _ said.')
    expect(html).toContain('<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>')
    expect(html).toContain('<sup>[1]</sup>')
    expect(html).toContain('<em>The Times</em>')
  })
})
