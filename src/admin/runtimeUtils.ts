import { fontHref, isDesignId, type DesignId } from '../design/presets'

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
