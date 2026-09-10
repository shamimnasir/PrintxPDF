// Fetch a remote page from the browser. Our own Worker proxy (VITE_FETCH_PROXY, see /worker)
// is asked first and alone, so the address a reader pastes normally reaches nobody else. Only
// if ours fails or stalls do we fall back to public CORS readers, which are rate-limited and
// often down, so those are raced against each other rather than tried one by one.

export type FetchedPage = { html: string; finalUrl: string; via: string; kind: 'html' | 'markdown' }

type Proxy = { name: string; build: (url: string) => string; kind: 'html' | 'markdown' | 'json-contents' }

const SELF_HOSTED = import.meta.env.VITE_FETCH_PROXY as string | undefined

const PROXIES: Proxy[] = [
  ...(SELF_HOSTED ? [{ name: 'self-hosted', build: (u: string) => `${SELF_HOSTED}?url=${encodeURIComponent(u)}`, kind: 'html' as const }] : []),
  { name: 'allorigins', build: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, kind: 'json-contents' },
  { name: 'codetabs', build: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`, kind: 'html' },
  { name: 'jina-reader', build: (u) => `https://r.jina.ai/${u}`, kind: 'markdown' },
]

// how long to keep waiting for a full-HTML proxy after the markdown reader has already answered
const HTML_GRACE_MS = 2500
const PROXY_TIMEOUT_MS = 14_000
// our own proxy answers in about a second; past this we stop waiting and use the public chain
const SELF_TIMEOUT_MS = 7_000

export function normalizeUrl(input: string) {
  let u = input.trim()
  if (!u) throw new Error('Enter a URL first.')
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u
  const parsed = new URL(u) // throws on garbage
  if (!parsed.hostname.includes('.')) throw new Error('That does not look like a public URL.')
  return parsed.toString()
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, rej) => {
    t = setTimeout(() => rej(new Error('timeout')), ms)
  })
  try {
    return await Promise.race([p, timeout])
  } finally {
    clearTimeout(t!)
  }
}

async function tryProxy(proxy: Proxy, url: string, fetchImpl: typeof fetch): Promise<FetchedPage> {
  const res = await withTimeout(fetchImpl(proxy.build(url), { headers: proxy.kind === 'markdown' ? { Accept: 'text/plain' } : {} }), PROXY_TIMEOUT_MS)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  let text: string
  if (proxy.kind === 'json-contents') {
    const j = (await res.json()) as { contents?: string; status?: { http_code?: number } }
    if (!j.contents || (j.status?.http_code && j.status.http_code >= 400)) throw new Error('empty')
    text = j.contents
  } else {
    text = await res.text()
  }
  if (text.length < 200) throw new Error('too short')
  if (proxy.kind !== 'markdown' && !/<[a-z][\s\S]*>/i.test(text)) throw new Error('not html')
  return { html: text, finalUrl: url, via: proxy.name, kind: proxy.kind === 'markdown' ? 'markdown' : 'html' }
}

/**
 * The public readers are queried at once. The first full-HTML answer wins; a markdown answer is
 * used only if no HTML proxy succeeds within a short grace period (or at all). Public proxies
 * stall for 20s+ when overloaded, so waiting on them one by one made every fetch feel broken.
 */
function raceProxies(
  url: string,
  proxies: Proxy[],
  errors: string[],
  onProgress: ((msg: string) => void) | undefined,
  fetchImpl: typeof fetch,
): Promise<FetchedPage> {
  return new Promise<FetchedPage>((resolve, reject) => {
    let settled = false
    let pending = proxies.length
    let markdown: FetchedPage | null = null
    let graceTimer: ReturnType<typeof setTimeout> | null = null
    const done = (page: FetchedPage) => {
      if (settled) return
      settled = true
      if (graceTimer) clearTimeout(graceTimer)
      resolve(page)
    }
    const fail = () => {
      if (settled) return
      if (markdown) return done(markdown)
      settled = true
      reject(
        new Error(
          `Could not fetch that page from the browser (the site may block readers). ` +
            `Paste the page's HTML instead, or try again in a minute.\n\n${errors.join('\n')}`,
        ),
      )
    }
    for (const proxy of proxies) {
      tryProxy(proxy, url, fetchImpl)
        .then((page) => {
          if (page.kind === 'html') return done(page)
          markdown = markdown || page
          onProgress?.('Got a text version, waiting briefly for a richer one…')
          if (pending - 1 <= 0) return done(page)
          graceTimer = graceTimer || setTimeout(() => done(markdown!), HTML_GRACE_MS)
        })
        .catch((e) => errors.push(`${proxy.name}: ${(e as Error).message}`))
        .finally(() => {
          pending -= 1
          if (pending === 0) fail()
        })
    }
  })
}

/**
 * Our own proxy first, alone, so a reader's address is not handed to third parties on every
 * fetch. Only when ours fails or stalls past SELF_TIMEOUT_MS do the public readers see the URL.
 */
export async function fetchArticle(
  input: string,
  onProgress?: (msg: string) => void,
  fetchImpl: typeof fetch = fetch,
  proxies: Proxy[] = PROXIES,
): Promise<FetchedPage> {
  const url = normalizeUrl(input)
  const errors: string[] = []
  const own = proxies.find((p) => p.name === 'self-hosted')
  const rest = proxies.filter((p) => p.name !== 'self-hosted')

  if (own) {
    onProgress?.('Fetching the page…')
    try {
      return await withTimeout(tryProxy(own, url, fetchImpl), SELF_TIMEOUT_MS)
    } catch (e) {
      errors.push(`${own.name}: ${(e as Error).message}`)
    }
    if (!rest.length) throw new Error(`Could not fetch that page.\n\n${errors.join('\n')}`)
    onProgress?.('Our reader could not fetch it, trying public readers…')
  } else {
    onProgress?.(`Asking ${rest.length} readers at once…`)
  }
  return raceProxies(url, rest, errors, onProgress, fetchImpl)
}

// Very small markdown → HTML for the jina fallback (headings, paragraphs, images, links, lists, bold/italic, code)
export function markdownToHtml(md: string): { title: string; html: string } {
  let title = ''
  const titleMatch = md.match(/^Title:\s*(.+)$/m)
  if (titleMatch) title = titleMatch[1].trim()
  const body = md.replace(/^(Title|URL Source|Published Time|Markdown Content):.*$/gm, '').trim()

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const inline = (s: string) =>
    esc(s)
      .replace(/\[\[(\d+)\]\]\([^)]*\)/g, '<sup>[$1]</sup>')
      .replace(/(^|\s)_\s*([^_]+?)\s*_(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '<img alt="$1" src="$2">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')

  const lines = body.split('\n')
  const out: string[] = []
  let para: string[] = []
  let list: string[] = []
  let listType = ''
  let inCode = false
  let code: string[] = []
  let table: string[][] = []
  const flushTable = () => {
    if (!table.length) return
    const [head, ...rows] = table
    const cells = (r: string[], tag: string) => r.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')
    const hasHead = head.some((c) => c.trim())
    out.push(
      `<table>${hasHead ? `<thead><tr>${cells(head, 'th')}</tr></thead>` : ''}<tbody>${(hasHead ? rows : table)
        .map((r) => `<tr>${cells(r, 'td')}</tr>`)
        .join('')}</tbody></table>`,
    )
    table = []
  }
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`)
    para = []
  }
  const flushList = () => {
    if (list.length) out.push(`<${listType}>${list.map((l) => `<li>${inline(l)}</li>`).join('')}</${listType}>`)
    list = []
    listType = ''
  }
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')
    if (line.startsWith('```')) {
      if (inCode) {
        out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`)
        code = []
        inCode = false
      } else {
        flushPara()
        flushList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      code.push(line)
      continue
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushPara()
      flushList()
      if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) continue // separator row
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim())
      if (cells.some((c) => c)) table.push(cells)
      continue
    }
    flushTable()
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushPara()
      flushList()
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      continue
    }
    const li = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.*)$/)
    if (li) {
      flushPara()
      const t = /^\s*\d+\./.test(line) ? 'ol' : 'ul'
      if (listType && listType !== t) flushList()
      listType = t
      list.push(li[1])
      continue
    }
    if (line.startsWith('>')) {
      flushPara()
      flushList()
      out.push(`<blockquote><p>${inline(line.replace(/^>\s?/, ''))}</p></blockquote>`)
      continue
    }
    if (!line.trim()) {
      flushPara()
      flushList()
      continue
    }
    flushList()
    para.push(line)
  }
  flushPara()
  flushList()
  flushTable()
  // tables with a single empty-ish cell are layout junk from the source page
  return { title, html: out.filter((b) => !/^<table><tbody>(<tr>(<td><\/td>)*<\/tr>)*<\/tbody><\/table>$/.test(b)).join('\n') }
}
