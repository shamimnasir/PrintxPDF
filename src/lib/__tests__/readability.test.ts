import { describe, expect, it } from 'vitest'
import { cleanHtml, cleanPastedHtml } from '../readability'

const page = `<html><head><title>Big Story</title><meta property="og:site_name" content="Daily"></head><body>
<nav><a href="/">Home</a><a href="/x">Other</a></nav>
<div class="ad">BUY NOW</div>
<article><h1>Big Story</h1>${'<p>Readable sentence number with enough words to count as content. </p>'.repeat(20)}
<img src="/img/photo.jpg" alt="p"><a href="/rel">rel</a><script>alert(1)</script></article>
<aside>sidebar junk</aside><footer>footer</footer></body></html>`

describe('cleanHtml', () => {
  it('keeps the article, drops nav/ads/scripts, absolutizes urls', () => {
    const out = cleanHtml({ html: page, finalUrl: 'https://daily.example/story', via: 'test', kind: 'html' })
    expect(out.title).toBe('Big Story')
    expect(out.siteName).toBe('Daily')
    expect(out.html).not.toContain('BUY NOW')
    expect(out.html).not.toContain('sidebar junk')
    expect(out.html).not.toContain('<script')
    expect(out.html).toContain('https://daily.example/img/photo.jpg')
    expect(out.html).toContain('https://daily.example/rel')
    expect(out.wordCount).toBeGreaterThan(100)
  })
  it('handles plain-text paste', () => {
    const out = cleanPastedHtml('Line one\n\nLine two with <b>tag</b> text', 'My paste')
    expect(out.title).toBe('My paste')
    expect(out.html).toContain('<p>Line one</p>')
    expect(out.html).toContain('&lt;b&gt;')
    expect(out.html).toContain('<p>Line two')
  })
})
