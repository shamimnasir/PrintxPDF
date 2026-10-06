const ANNOUNCEMENT_EVENT = 'pxp:announcement-state'

export function subscribeTheme(onChange: () => void) {
  const root = document.documentElement
  const observer = new MutationObserver(onChange)
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

export function getThemeSnapshot() {
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

export function subscribeAnnouncement(onChange: () => void) {
  window.addEventListener(ANNOUNCEMENT_EVENT, onChange)
  return () => window.removeEventListener(ANNOUNCEMENT_EVENT, onChange)
}

export function getAnnouncementSnapshot() {
  try {
    return sessionStorage.getItem('pxp:ann') !== 'closed'
  } catch {
    return true
  }
}

export function dismissAnnouncement() {
  try {
    sessionStorage.setItem('pxp:ann', 'closed')
  } catch {
    // The announcement can still be dismissed for this render if storage is unavailable.
  }
  window.dispatchEvent(new Event(ANNOUNCEMENT_EVENT))
}
