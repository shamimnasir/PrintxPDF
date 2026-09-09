// Fetch a remote page from the browser. Static hosts can't proxy, so we walk a chain of
// public CORS-friendly readers and take the first that answers. Each one is rate-limited
// and occasionally down, hence the chain. A self-hosted Worker (see /worker) is tried first
// when VITE_FETCH_PROXY is configured.

export type FetchedPage = { html: string; finalUrl: string; via: string; kind: 'html' | 'markdown' }

type Proxy = { name: string; build: (url: string) => string; kind: 'html' | 'markdown' | 'json-contents' }

const SELF_HOSTED = import.meta.env.VITE_FETCH_PROXY as string | undefined

const PROXIES: Proxy[] = [
  ...(SELF_HOSTED ? [{ name: 'self-hosted', build: (u: string) => `${SELF_HOSTED}?url=${encodeURIComponent(u)}`, kind: 'html' as const }] : []),
  { name: 'allorigins', build: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`, kind: 'json-contents' },
  { name: 'codetabs', build: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`, kind: 'html' },
  { name: 'corsproxy', build: (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`, kind: 'html' },
  { name: 'jina-reader', build: (u) => `https://r.jina.ai/${u}`, kind: 'markdown' },
]

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

export async function fetchArticle(
  input: string,
  onProgress?: (msg: string) => void,
  fetchImpl: typeof fetch = fetch,
): Promise<FetchedPage> {
  const url = normalizeUrl(input)
  const errors: string[] = []

  for (const proxy of PROXIES) {
    onProgress?.(`Trying ${proxy.name}…`)
    try {
      const res = await withTimeout(fetchImpl(proxy.build(url), { headers: proxy.kind === 'markdown' ? { Accept: 'text/plain' } : {} }), 15_000)
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
    } catch (e) {
      errors.push(`${proxy.name}: ${(e as Error).message}`)
    }
  }
  throw new Error(
    `Could not fetch that page from the browser (the site may block readers). ` +
      `Paste the page's HTML instead, or try again in a minute.\n\n${errors.join('\n')}`,
  )
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
  return { title, html: out.join('\n') }
}
