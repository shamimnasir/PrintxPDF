/**
 * PrintxPDF — MV3 background service worker (module).
 *
 * Single purpose: hand the page you are reading to printxpdf.com's print
 * cleaner. Everything here is one of three jobs:
 *   1. put the current tab's URL into https://printxpdf.com/print?url=…
 *   2. put a right-clicked link's URL into the same route
 *   3. copy a selection to the clipboard and open the /print paste box
 *
 * The site is a static, client-side app: it has no ingest API, so a selection
 * travels on the system clipboard rather than through a made-up endpoint.
 *
 * MV3 note: every chrome.*.addListener call in this file is made at the top
 * level, synchronously, so a woken service worker re-registers them before any
 * event is dispatched. Nothing is registered inside a callback or a promise.
 */

const SITE = 'https://printxpdf.com'
const PRINT_URL = `${SITE}/print`

const MENU_ITEMS = [
  { id: 'printxpdf-page', title: 'Clean this page for printing', contexts: ['page'] },
  { id: 'printxpdf-link', title: 'Clean this link', contexts: ['link'] },
  { id: 'printxpdf-selection', title: 'Print just this selection', contexts: ['selection'] },
]

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Only http(s) can be handed to the site. chrome://, edge://, about:, file://,
 * view-source: and the Web Store are all refused here, before anything tries to
 * read them — no extension may touch those pages, and printxpdf.com could not
 * fetch them either.
 */
function isPrintable(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

function cleanUrlFor(target) {
  return `${PRINT_URL}?url=${encodeURIComponent(target)}`
}

async function preferNewTab() {
  try {
    const { openInNewTab } = await chrome.storage.sync.get({ openInNewTab: true })
    return openInNewTab !== false
  } catch {
    return true // storage unavailable: the safe default never destroys the current tab
  }
}

async function openTarget(url, tab) {
  if (!(await preferNewTab()) && tab?.id != null) {
    try {
      await chrome.tabs.update(tab.id, { url })
      return
    } catch {
      /* the tab went away mid-click: fall through and open a new one */
    }
  }
  await chrome.tabs.create({ url, index: typeof tab?.index === 'number' ? tab.index + 1 : undefined })
}

/**
 * activeTab hands us tab.url for the tab the user just acted on. If the event's
 * tab object arrived without it, re-read the active tab — the same activeTab
 * grant covers that query, so no `tabs` permission and no injection is needed.
 */
async function resolveTabUrl(tab) {
  if (isPrintable(tab?.url)) return tab.url
  try {
    const [active] = await chrome.tabs.query({ active: true, currentWindow: true })
    return isPrintable(active?.url) ? active.url : null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* injected into the page (isolated world, no persistent content script) */
/* ------------------------------------------------------------------ */

/**
 * Serialises the current selection as HTML and puts it on the clipboard, then
 * shows a short-lived notice. Runs inside the page, so it may not close over
 * anything from this module.
 */
async function captureSelection(pageTitle, pageUrl) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const notify = (message, tone) => {
    try {
      const el = document.createElement('div')
      el.textContent = message
      const s = el.style
      s.position = 'fixed'
      s.zIndex = '2147483647'
      s.top = '16px'
      s.right = '16px'
      s.maxWidth = '320px'
      s.padding = '12px 14px'
      s.borderRadius = '12px'
      s.background = tone === 'error' ? '#b42318' : '#0f172a'
      s.color = '#ffffff'
      s.font = '500 13px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif'
      s.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.28)'
      s.pointerEvents = 'none'
      document.documentElement.appendChild(el)
      setTimeout(() => el.remove(), 4000)
    } catch {
      /* a page that refuses the node is not worth failing over */
    }
  }

  const selection = window.getSelection()
  const text = selection ? selection.toString().trim() : ''
  if (!selection || selection.rangeCount === 0 || !text) {
    notify('PrintxPDF: nothing is selected on this page.', 'error')
    return { ok: false, reason: 'empty', chars: 0 }
  }

  // Prefer markup: the paste box parses HTML, so headings, lists and images survive.
  let payload = text
  try {
    const holder = document.createElement('div')
    for (let i = 0; i < selection.rangeCount; i++) holder.appendChild(selection.getRangeAt(i).cloneContents())
    // cloneContents keeps the page's ownerDocument, so .src/.href read back absolute
    for (const node of holder.querySelectorAll('[src]')) {
      if (node.src) node.setAttribute('src', node.src)
      node.removeAttribute('srcset')
    }
    for (const node of holder.querySelectorAll('[href]')) if (node.href) node.setAttribute('href', node.href)
    for (const node of holder.querySelectorAll('script, style, noscript, iframe, object, embed')) node.remove()
    const body = holder.innerHTML.trim()
    if (body) {
      payload = `<h1>${esc(pageTitle || document.title || 'Selection')}</h1>\n<p><a href="${esc(pageUrl)}">${esc(pageUrl)}</a></p>\n${body}`
    }
  } catch {
    /* fall back to the plain text we already have */
  }

  let copied = false
  try {
    await navigator.clipboard.writeText(payload)
    copied = true
  } catch {
    // The async Clipboard API is refused on some pages (an http: origin, a
    // permissions-policy that blocks clipboard-write). The classic path still
    // works there, and the clipboardWrite permission is what allows it.
    try {
      const box = document.createElement('textarea')
      box.value = payload
      box.setAttribute('readonly', '')
      box.style.position = 'fixed'
      box.style.top = '-1000px'
      box.style.opacity = '0'
      document.documentElement.appendChild(box)
      box.select()
      copied = document.execCommand('copy')
      box.remove()
    } catch {
      copied = false
    }
  }

  notify(
    copied
      ? 'PrintxPDF: selection copied. On the tab that just opened, choose "Paste HTML or text" and press Cmd/Ctrl+V.'
      : 'PrintxPDF: this page blocked the clipboard. Copy the selection yourself, then paste it on printxpdf.com.',
    copied ? 'ok' : 'error',
  )
  return { ok: copied, reason: copied ? 'copied' : 'blocked', chars: payload.length }
}

/* ------------------------------------------------------------------ */
/* actions                                                            */
/* ------------------------------------------------------------------ */

async function cleanCurrentPage(tab) {
  const url = await resolveTabUrl(tab)
  // A chrome://, file:// or Web Store tab cannot be read by any extension;
  // opening the tool's own entry point is the honest fallback.
  await openTarget(url ? cleanUrlFor(url) : PRINT_URL, tab)
}

async function cleanLink(linkUrl, tab) {
  await openTarget(isPrintable(linkUrl) ? cleanUrlFor(linkUrl) : PRINT_URL, tab)
}

async function cleanSelection(tab) {
  let result = { ok: false, reason: 'unavailable', chars: 0 }
  // Restricted pages refuse injection outright; skip the attempt and its error.
  if (tab?.id != null && isPrintable(tab?.url)) {
    try {
      const [hit] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: captureSelection,
        args: [tab.title || '', tab.url || ''],
      })
      if (hit?.result) result = hit.result
    } catch {
      /* injection refused (restricted page): the popup hint still explains the flow */
    }
  }
  try {
    await chrome.storage.local.set({ lastSelection: { at: Date.now(), ...result } })
  } catch {
    /* a missing breadcrumb is not worth aborting the tab open */
  }
  if (result.reason === 'empty') return // nothing to paste; the page already said so
  await openTarget(`${PRINT_URL}?paste=1`, tab)
}

/* ------------------------------------------------------------------ */
/* wiring — top level only                                            */
/* ------------------------------------------------------------------ */

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const item of MENU_ITEMS) chrome.contextMenus.create(item)
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const run =
    info.menuItemId === 'printxpdf-link'
      ? cleanLink(info.linkUrl, tab)
      : info.menuItemId === 'printxpdf-selection'
        ? cleanSelection(tab)
        : info.menuItemId === 'printxpdf-page'
          ? cleanCurrentPage(tab)
          : null
  if (run) run.catch((err) => console.error('PrintxPDF:', err))
})

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== 'clean-current-page') return
  cleanCurrentPage(tab).catch((err) => console.error('PrintxPDF:', err))
})

// The popup does its own tab work; it only calls in for the shared open rules.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'open') return false
  openTarget(message.url, message.tab)
    .then(() => sendResponse({ ok: true }))
    .catch((err) => sendResponse({ ok: false, error: String(err) }))
  return true // async response
})
