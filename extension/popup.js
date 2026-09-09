/**
 * PrintxPDF popup.
 *
 * No network calls, no remote code, no analytics: it reads the active tab's
 * URL (granted by activeTab when you click the icon) and hands it to
 * https://printxpdf.com/print, where the cleaning and exporting happen.
 *
 * Every handler is attached with addEventListener; there is no inline script
 * and no inline event attribute anywhere in popup.html, so the strict MV3
 * extension-page CSP is satisfied without a single relaxation.
 */

const SITE = 'https://printxpdf.com'
const PRINT_URL = `${SITE}/print`
const PASTE_URL = `${PRINT_URL}?paste=1`

const el = {
  target: document.getElementById('target'),
  clean: document.getElementById('clean'),
  paste: document.getElementById('paste'),
  copy: document.getElementById('copy'),
  status: document.getElementById('status'),
  newtab: document.getElementById('newtab'),
  shortcut: document.getElementById('shortcut'),
}

let activeTab = null
let pageUrl = null

const isPrintable = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)
const cleanUrlFor = (target) => `${PRINT_URL}?url=${encodeURIComponent(target)}`

function say(message, tone) {
  el.status.textContent = message
  el.status.classList.toggle('error', tone === 'error')
  el.status.hidden = !message
}

/** hostname + a trimmed path, so a 300px popup never wraps. */
function pretty(url) {
  try {
    const u = new URL(url)
    const tail = u.pathname === '/' ? '' : u.pathname
    const label = `${u.hostname.replace(/^www\./, '')}${tail}`
    return label.length > 44 ? `${label.slice(0, 43)}…` : label
  } catch {
    return url
  }
}

/**
 * Says, in plain words, why this particular tab cannot be cleaned. Chrome
 * refuses extensions on its own pages and on the Web Store; file:// pages are
 * local to the machine, so printxpdf.com could not fetch them either.
 */
function whyBlocked(url) {
  const u = String(url || '')
  if (/^(chrome|edge|brave|opera|vivaldi|arc):/i.test(u)) return 'Chrome does not let any extension read its own pages.'
  if (/^about:/i.test(u)) return 'This is a browser page, which no extension may read.'
  if (/^(chrome-extension|moz-extension):/i.test(u)) return 'This is an extension page, which no extension may read.'
  if (/^view-source:/i.test(u)) return 'View-source tabs cannot be handed to a web page. Open the page itself instead.'
  if (/^file:/i.test(u)) return 'Local files are not on the web, so printxpdf.com cannot fetch this one. Use Paste text instead.'
  if (/^(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/i.test(u.replace(/^https?:\/\//i, ''))) {
    return 'Chrome blocks every extension on the Web Store.'
  }
  if (/^data:/i.test(u)) return 'A data: URL has no address printxpdf.com could open.'
  return 'This tab has no web address that printxpdf.com can open.'
}

/* ------------------------------------------------------------------ */
/* startup                                                            */
/* ------------------------------------------------------------------ */

/**
 * activeTab is granted the moment this popup opens, which is what makes
 * tab.url readable here. No `tabs` permission and no script injection: for the
 * URL case chrome.tabs.query is the narrowest thing that works.
 */
async function readActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    activeTab = tab || null
  } catch {
    activeTab = null
  }
  return isPrintable(activeTab?.url) ? activeTab.url : null
}

async function restorePreference() {
  try {
    const { openInNewTab } = await chrome.storage.sync.get({ openInNewTab: true })
    el.newtab.checked = openInNewTab !== false
  } catch {
    el.newtab.checked = true
  }
}

async function showShortcut() {
  try {
    const commands = await chrome.commands.getAll()
    const command = commands.find((c) => c.name === 'clean-current-page')
    el.shortcut.textContent = command?.shortcut || 'Set a shortcut'
    el.shortcut.title = command?.shortcut
      ? 'Keyboard shortcut for "Clean this page" — click to change it'
      : 'No shortcut assigned — click to set one'
  } catch {
    el.shortcut.textContent = ''
  }
}

/** A selection copied from the context menu in the last few minutes. */
async function showSelectionHint() {
  try {
    const { lastSelection } = await chrome.storage.local.get('lastSelection')
    if (!lastSelection || Date.now() - lastSelection.at > 5 * 60 * 1000) return
    if (lastSelection.ok) {
      say('Your selection is on the clipboard. On printxpdf.com/print, open "Paste HTML or text" and press Cmd/Ctrl+V.')
    } else if (lastSelection.reason === 'blocked') {
      say('That page blocked the clipboard, so the selection was not copied. Copy it by hand, then paste it on printxpdf.com.', 'error')
    }
  } catch {
    /* the hint is a nicety, never a blocker */
  }
}

async function init() {
  await Promise.all([restorePreference(), showShortcut(), showSelectionHint()])
  pageUrl = await readActiveTab()
  if (pageUrl) {
    el.target.textContent = pretty(pageUrl)
    el.target.title = pageUrl
    return
  }
  // Degrade honestly: say which page this is and leave the paths that still work.
  const reason = whyBlocked(activeTab?.url)
  el.target.textContent = reason
  el.target.title = reason
  el.target.classList.add('blocked')
  el.copy.disabled = true
  el.clean.textContent = 'Open PrintxPDF'
}

/* ------------------------------------------------------------------ */
/* actions                                                            */
/* ------------------------------------------------------------------ */

/** The service worker owns the "new tab vs this tab" rule; fall back locally. */
async function openTab(url) {
  try {
    const res = await chrome.runtime.sendMessage({
      type: 'open',
      url,
      tab: activeTab ? { id: activeTab.id, index: activeTab.index } : null,
    })
    if (res?.ok) return
  } catch {
    /* worker unreachable: open it here instead */
  }
  await chrome.tabs.create({ url })
}

el.clean.addEventListener('click', async () => {
  await openTab(pageUrl ? cleanUrlFor(pageUrl) : PRINT_URL)
  window.close()
})

el.paste.addEventListener('click', async () => {
  // Works on every tab, including the ones Chrome keeps extensions away from.
  await openTab(PASTE_URL)
  window.close()
})

el.copy.addEventListener('click', async () => {
  if (!pageUrl) return
  const link = cleanUrlFor(pageUrl)
  try {
    await navigator.clipboard.writeText(link)
    say('Clean link copied to the clipboard.')
  } catch {
    // No silent failure and no second clipboard path to justify: show the link
    // so it can be selected and copied by hand.
    say(`Could not reach the clipboard. The link is: ${link}`, 'error')
  }
})

el.newtab.addEventListener('change', async () => {
  try {
    await chrome.storage.sync.set({ openInNewTab: el.newtab.checked })
  } catch {
    say('Could not save that preference.', 'error')
  }
})

el.shortcut.addEventListener('click', async () => {
  await chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })
  window.close()
})

init()
