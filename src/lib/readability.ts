import { Readability } from '@mozilla/readability'
import DOMPurify from 'dompurify'
import { markdownToHtml, type FetchedPage } from './fetchArticle'

export type CleanArticle = {
  title: string
  byline: string
  siteName: string
  excerpt: string
  html: string
  url: string
  wordCount: number
  publishedTime?: string
}

const NOISE_SELECTORS = [
  'script',
  'style',
  'noscript',
  'iframe',
  'form',
  'nav',
  'aside',
  'footer',
  'header nav',
  '[role="navigation"]',
  '[role="banner"]',
  '[role="complementary"]',
  '.ad',
  '.ads',
  '.advert',
  '.advertisement',
  '[class*="cookie"]',
  '[id*="cookie"]',
  '[class*="newsletter"]',
  '[class*="share"]',
  '[class*="social"]',
  '[class*="sidebar"]',
  '[class*="related"]',
  '[class*="comment"]',
  '[class*="popup"]',
  '[class*="modal"]',
  '.mw-editsection',
  '.reference',
  '.navbox',
  '.infobox',
  '.sistersitebox',
  'sup.reference',
]

function absolutize(doc: Document, base: string) {
  const fix = (el: Element, attr: string) => {
    const v = el.getAttribute(attr)
    if (!v || /^(data:|blob:|#|javascript:)/i.test(v)) return
    try {
      el.setAttribute(attr, new URL(v, base).toString())
    } catch {
      /* ignore */
    }
  }
  doc.querySelectorAll('img[src]').forEach((el) => fix(el, 'src'))
  doc.querySelectorAll('img[data-src]').forEach((el) => {
    const ds = el.getAttribute('data-src')
    if (ds) el.setAttribute('src', ds)
    fix(el, 'src')
  })
  doc.querySelectorAll('img[srcset]').forEach((el) => el.removeAttribute('srcset'))
  doc.querySelectorAll('a[href]').forEach((el) => fix(el, 'href'))
}

export function cleanHtml(page: FetchedPage): CleanArticle {
  let title = ''
  let body = ''
  let byline = ''
  let siteName = ''
  let excerpt = ''
  let publishedTime: string | undefined

  if (page.kind === 'markdown') {
    const md = markdownToHtml(page.html)
    title = md.title
    body = md.html
  } else {
    const doc = new DOMParser().parseFromString(page.html, 'text/html')
    // <base> lets Readability + our absolutizer resolve relative links
    const base = doc.createElement('base')
    base.href = page.finalUrl
    doc.head.prepend(base)
    absolutize(doc, page.finalUrl)
    NOISE_SELECTORS.forEach((sel) => {
      try {
        doc.querySelectorAll(sel).forEach((el) => {
          // never nuke the main content container just because a class matched
          if (el.matches('article, main, [role="main"]')) return
          el.remove()
        })
      } catch {
        /* invalid selector in this browser */
      }
    })
    const meta = (name: string) =>
      doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.getAttribute('content') || ''
    siteName = meta('og:site_name')
    publishedTime = meta('article:published_time') || meta('date') || undefined

    const article = new Readability(doc, { charThreshold: 200, keepClasses: false }).parse()
    if (article && article.content) {
      title = article.title || ''
      body = article.content
      byline = article.byline || ''
      excerpt = article.excerpt || ''
      siteName = siteName || article.siteName || ''
    } else {
      title = doc.title
      body = doc.body?.innerHTML || ''
    }
  }

  if (!siteName) {
    try {
      siteName = new URL(page.finalUrl).hostname.replace(/^www\./, '')
    } catch {
      /* local paste */
    }
  }

  const safe = DOMPurify.sanitize(body, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'button', 'svg', 'video', 'audio', 'object', 'embed'],
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'class', 'id', 'width', 'height', 'srcset', 'sizes', 'loading'],
    ADD_ATTR: ['target'],
  })

  // final structural tidy on the sanitized fragment
  const frag = new DOMParser().parseFromString(`<div id="root">${safe}</div>`, 'text/html')
  const root = frag.getElementById('root')!
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || ''
    if (!src || src.startsWith('data:image/gif') || /1x1|pixel|spacer|tracking/i.test(src)) img.remove()
    else {
      img.setAttribute('loading', 'eager')
      img.setAttribute('referrerpolicy', 'no-referrer')
    }
  })
  root.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank')
    a.setAttribute('rel', 'noopener')
  })
  // drop empty wrappers
  root.querySelectorAll('div, span, p, section').forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector('img, table, figure')) el.remove()
  })
  const html = root.innerHTML
  const wordCount = (root.textContent || '').trim().split(/\s+/).filter(Boolean).length

  return { title: title || 'Untitled page', byline, siteName, excerpt, html, url: page.finalUrl, wordCount, publishedTime }
}

export function cleanPastedHtml(input: string, title = 'Pasted content'): CleanArticle {
  // only treat input as markup when it has block structure; a stray <b> in plain text stays text
  const isHtml = /<(!doctype|html|body|div|p|article|main|section|h[1-6]|table|ul|ol|blockquote|pre|figure|img)\b/i.test(input)
  const html = isHtml
    ? input
    : `<article>${input
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`)
        .join('')}</article>`
  const wrapped = isHtml && !/<body/i.test(html) ? `<html><head><title>${title}</title></head><body><article>${html}</article></body></html>` : html
  const page: FetchedPage = { html: wrapped, finalUrl: 'https://pasted.local/', via: 'paste', kind: 'html' }
  const out = cleanHtml(page)
  if (!isHtml || out.title === 'Untitled page' || out.title === 'pasted.local') out.title = title
  out.siteName = ''
  out.url = ''
  return out
}
