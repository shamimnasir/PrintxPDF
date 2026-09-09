import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview } from './config'
import { useSiteConfig } from './useSiteConfig'

/**
 * Applies everything the admin panel controls that lives outside React's tree:
 * theme tokens, injected code, analytics scripts and pageview tracking.
 */
export function RuntimeEffects() {
  const cfg = useSiteConfig()
  const { pathname, search } = useLocation()

  // theme tokens
  useEffect(() => {
    const r = document.documentElement
    const t = cfg.theme
    r.style.setProperty('--acid', t.accent)
    r.style.setProperty('--acid-fg', t.accentFg)
    r.style.setProperty('--ink', t.ink)
    r.style.setProperty('--alarm', t.alarm)
    r.style.setProperty('--bw', `${t.borderWidth}px`)
    r.style.setProperty('--radius', `${t.radius}px`)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.accent)
  }, [cfg.theme])

  // custom CSS
  useEffect(() => {
    const id = 'pxp-custom-css'
    document.getElementById(id)?.remove()
    if (!cfg.code.css.trim()) return
    const el = document.createElement('style')
    el.id = id
    el.textContent = cfg.code.css
    document.head.appendChild(el)
    return () => el.remove()
  }, [cfg.code.css])

  // custom head / body markup
  useEffect(() => {
    const mk = (html: string, where: HTMLElement, marker: string) => {
      document.querySelectorAll(`[data-pxp-inject="${marker}"]`).forEach((n) => n.remove())
      if (!html.trim()) return
      const holder = document.createElement('div')
      holder.innerHTML = html
      Array.from(holder.childNodes).forEach((n) => {
        // <script> nodes created by innerHTML never execute; recreate them so they do
        if (n.nodeName === 'SCRIPT') {
          const src = n as HTMLScriptElement
          const s = document.createElement('script')
          Array.from(src.attributes).forEach((a) => s.setAttribute(a.name, a.value))
          s.textContent = src.textContent
          s.dataset.pxpInject = marker
          where.appendChild(s)
        } else {
          if (n instanceof HTMLElement) n.dataset.pxpInject = marker
          where.appendChild(n)
        }
      })
    }
    mk(cfg.code.headHtml, document.head, 'head')
    mk(cfg.code.bodyEndHtml, document.body, 'body')
  }, [cfg.code.headHtml, cfg.code.bodyEndHtml])

  // custom JS
  useEffect(() => {
    if (!cfg.code.js.trim()) return
    const s = document.createElement('script')
    s.dataset.pxpInject = 'js'
    s.textContent = cfg.code.js
    document.body.appendChild(s)
    return () => s.remove()
  }, [cfg.code.js])

  // verification meta tags
  useEffect(() => {
    const set = (name: string, content: string) => {
      const sel = `meta[name="${name}"]`
      document.head.querySelector(sel)?.remove()
      if (!content) return
      const m = document.createElement('meta')
      m.name = name
      m.content = content
      document.head.appendChild(m)
    }
    set('google-site-verification', cfg.seo.googleVerification)
    set('msvalidate.01', cfg.seo.bingVerification)
  }, [cfg.seo.googleVerification, cfg.seo.bingVerification])

  // third-party analytics
  useEffect(() => {
    document.querySelectorAll('[data-pxp-analytics]').forEach((n) => n.remove())
    const a = cfg.analytics
    const dnt = a.respectDnt && (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1')
    if (dnt) return
    const add = (attrs: Record<string, string>, inline?: string) => {
      const s = document.createElement('script')
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
      s.dataset.pxpAnalytics = 'true'
      if (inline) s.textContent = inline
      document.head.appendChild(s)
    }
    if (a.ga4Id) {
      add({ async: '', src: `https://www.googletagmanager.com/gtag/js?id=${a.ga4Id}` })
      add({}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${a.ga4Id}');`)
    }
    if (a.plausibleDomain) add({ defer: '', 'data-domain': a.plausibleDomain, src: 'https://plausible.io/js/script.js' })
    if (a.umamiId && a.umamiSrc) add({ defer: '', src: a.umamiSrc, 'data-website-id': a.umamiId })
  }, [cfg.analytics])

  // pageviews
  useEffect(() => {
    trackPageview(pathname + search)
  }, [pathname, search])

  return null
}
