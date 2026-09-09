import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { isBooted, trackPageview } from './config'
import { useSiteConfig } from './useSiteConfig'
import { DESIGNS, fontHref, isDesignId, type DesignId } from '../design/presets'

/** `?design=paper` previews a preset without publishing it; the choice sticks for the tab. */
export function previewDesign(): DesignId | null {
  try {
    const q = new URLSearchParams(window.location.search).get('design')
    if (q !== null) {
      if (isDesignId(q)) {
        sessionStorage.setItem('pxp:design', q)
        return q
      }
      sessionStorage.removeItem('pxp:design')
      return null
    }
    const s = sessionStorage.getItem('pxp:design')
    return isDesignId(s) ? s : null
  } catch {
    return null
  }
}

/** Sets the html attribute the preset stylesheets key off, and loads that preset's fonts. */
export function applyDesign(id: DesignId) {
  document.documentElement.setAttribute('data-design', id)
  const href = fontHref(id)
  let link = document.getElementById('pxp-design-font') as HTMLLinkElement | null
  if (!href) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.id = 'pxp-design-font'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

/** Relative luminance, used to keep a light "ink" from destroying dark mode. */
function luminance(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 0
  const n = parseInt(m[1], 16)
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255)
}

export const inkIsTooLight = (hex: string) => luminance(hex) > 0.35

/** Debounces a value so typing in an admin textarea does not execute every prefix. */
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/**
 * Applies everything the admin panel controls that lives outside React's tree:
 * theme tokens, injected code, analytics scripts and pageview tracking.
 */
export function RuntimeEffects() {
  const cfg = useSiteConfig()
  const { pathname, search } = useLocation()

  // custom code is executed, so wait until the admin stops typing
  const headHtml = useDebounced(cfg.code.headHtml, 800)
  const bodyHtml = useDebounced(cfg.code.bodyEndHtml, 800)
  const customJs = useDebounced(cfg.code.js, 800)
  const a = cfg.analytics

  // ---------- theme tokens ----------
  useEffect(() => {
    const r = document.documentElement
    const preview = previewDesign()
    const design: DesignId = preview ?? (isDesignId(cfg.theme.design) ? cfg.theme.design : 'blocks')
    // a preview swaps in the preset's own colours and shape; the admin draft is untouched
    const t = preview ? { ...cfg.theme, ...DESIGNS[preview].theme } : cfg.theme
    // before the published config arrives the prerendered attribute is the truth, so leave it
    if (preview || isBooted()) applyDesign(design)
    r.style.setProperty('--acid', t.accent)
    r.style.setProperty('--acid-fg', t.accentFg)
    r.style.setProperty('--alarm', t.alarm)
    r.style.setProperty('--bw', `${t.borderWidth}px`)
    r.style.setProperty('--radius', `${t.radius}px`)
    // dark mode paints its background from --ink; a light ink would make it unreadable,
    // so a light value is used for borders only and dark surfaces keep the default.
    r.style.setProperty('--ink', inkIsTooLight(t.ink) ? '#0b0b0f' : t.ink)
    r.style.setProperty('--line-custom', t.ink)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.accent)
    return () => {
      ;['--acid', '--acid-fg', '--alarm', '--bw', '--radius', '--ink', '--line-custom'].forEach((k) => r.style.removeProperty(k))
    }
  }, [cfg.theme, search])

  // ---------- custom CSS ----------
  useEffect(() => {
    if (!cfg.code.css.trim()) return
    const el = document.createElement('style')
    el.id = 'pxp-custom-css'
    el.textContent = cfg.code.css
    document.head.appendChild(el)
    return () => el.remove()
  }, [cfg.code.css])

  // ---------- custom head / body markup ----------
  const injected = useRef<Node[]>([])
  useEffect(() => {
    const nodes: Node[] = []
    const mount = (html: string, where: HTMLElement) => {
      if (!html.trim()) return
      const holder = document.createElement('template')
      holder.innerHTML = html
      Array.from(holder.content.childNodes).forEach((n) => {
        // <script> created by innerHTML never executes; recreate it so it does
        if (n.nodeName === 'SCRIPT') {
          const src = n as HTMLScriptElement
          const s = document.createElement('script')
          Array.from(src.attributes).forEach((at) => s.setAttribute(at.name, at.value))
          s.textContent = src.textContent
          where.appendChild(s)
          nodes.push(s)
        } else {
          where.appendChild(n)
          nodes.push(n)
        }
      })
    }
    mount(headHtml, document.head)
    mount(bodyHtml, document.body)
    injected.current = nodes
    // tracked by reference, so text and comment nodes are removed too
    return () => nodes.forEach((n) => n.parentNode?.removeChild(n))
  }, [headHtml, bodyHtml])

  // ---------- custom JS ----------
  useEffect(() => {
    if (!customJs.trim()) return
    const s = document.createElement('script')
    s.textContent = customJs
    document.body.appendChild(s)
    return () => s.remove()
  }, [customJs])

  // ---------- verification meta ----------
  useEffect(() => {
    const set = (name: string, content: string) => {
      document.head.querySelector(`meta[name="${name}"]`)?.remove()
      if (!content) return null
      const m = document.createElement('meta')
      m.name = name
      m.content = content
      document.head.appendChild(m)
      return m
    }
    const g = set('google-site-verification', cfg.seo.googleVerification)
    const b = set('msvalidate.01', cfg.seo.bingVerification)
    return () => {
      g?.remove()
      b?.remove()
    }
  }, [cfg.seo.googleVerification, cfg.seo.bingVerification])

  // ---------- third-party analytics ----------
  // keyed on the individual ids, not the settings object, so editing an unrelated field
  // cannot re-inject gtag and log a duplicate page_view
  useEffect(() => {
    const dnt = a.respectDnt && (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1')
    if (dnt) return
    const added: HTMLScriptElement[] = []
    const add = (attrs: Record<string, string>, inline?: string) => {
      const s = document.createElement('script')
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v))
      if (inline) s.textContent = inline
      document.head.appendChild(s)
      added.push(s)
    }
    if (a.ga4Id) {
      add({ async: '', src: `https://www.googletagmanager.com/gtag/js?id=${a.ga4Id}` })
      add({}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${a.ga4Id}');`)
    }
    if (a.plausibleDomain) add({ defer: '', 'data-domain': a.plausibleDomain, src: 'https://plausible.io/js/script.js' })
    if (a.umamiId && a.umamiSrc) add({ defer: '', src: a.umamiSrc, 'data-website-id': a.umamiId })
    return () => added.forEach((s) => s.remove())
  }, [a.ga4Id, a.plausibleDomain, a.umamiId, a.umamiSrc, a.respectDnt])

  // ---------- pageviews ----------
  useEffect(() => {
    trackPageview(pathname + search)
  }, [pathname, search])

  return null
}
