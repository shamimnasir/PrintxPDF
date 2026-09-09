/**
 * PrintxPDF popup.
 *
 * No network calls, no remote code, no analytics: it reads the active tab's
 * URL (granted by activeTab when you click the icon) and hands it to
 * https://printxpdf.com/print, where the cleaning and exporting happen.
 */

const SITE = 'https://printxpdf.com'
const PRINT_URL = `${SITE}/print`

const el = {
  target: document.getElementById('target'),
  clean: document.getElementById('clean'),
  pdf: document.getElementById('pdf'),
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

/* ------------------------------------------------------------------ */
/* startup                                                            */
/* ------------------------------------------------------------------ */

async function readActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  activeTab = tab || null
  if (isPrintable(tab?.url)) return tab.url
  if (tab?.id == null) return null
  // activeTab also covers this injection; it only ever reads location.href.
  try {
    const [hit] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => location.href })
    return isPrintable(hit?.result) ? hit.result : null
  } catch {
    return null
  }
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
  el.target.textContent = 'Chrome blocks extensions on this page'
  el.target.title = 'Browser pages (chrome://, the Web Store, the new tab page) cannot be read by any extension.'
  el.target.classList.add('blocked')
  el.copy.disabled = true
  el.clean.textContent = 'Open PrintxPDF'
  el.pdf.disabled = true
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

el.pdf.addEventListener('click', async () => {
  if (!pageUrl) return
  // Same route: the site cleans the page, then its Save PDF button exports it.
  await openTab(cleanUrlFor(pageUrl))
  window.close()
})

el.copy.addEventListener('click', async () => {
  if (!pageUrl) return
  const link = cleanUrlFor(pageUrl)
  let copied = false
  try {
    await navigator.clipboard.writeText(link)
    copied = true
  } catch {
    try {
      const box = document.createElement('textarea')
      box.value = link
      document.body.appendChild(box)
      box.select()
      copied = document.execCommand('copy')
      box.remove()
    } catch {
      copied = false
    }
  }
  say(copied ? 'Clean link copied to the clipboard.' : 'Could not reach the clipboard.', copied ? 'ok' : 'error')
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
