import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchArticle } from '../../lib/fetchArticle'
import { cleanHtml, cleanPastedHtml, type CleanArticle } from '../../lib/readability'
import { store } from '../../lib/store'
import { useToast } from '../../components/ui/Toast'
import { breadcrumbSchema, softwareSchema, useSeo } from '../../lib/seo'
import { Editor } from './Editor'
import { SAMPLES, sampleById } from './samples'
import { POSTS } from '../../pages/blogPosts'
import './editor.css'

type Tab = 'url' | 'paste' | 'file'

function articleFromSample(id: string): CleanArticle | null {
  const s = sampleById(id)
  if (!s) return null
  const wordCount = s.html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
  return { title: s.title, byline: s.byline, siteName: s.site, html: s.html, url: s.url, wordCount }
}

function articleFromPost(slug: string): CleanArticle | null {
  const p = POSTS.find((x) => x.slug === slug)
  if (!p) return null
  const html = p.body.map((t) => `<p>${t.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`).join('')
  return { title: p.title, byline: 'PrintxPDF blog', siteName: 'printxpdf', html, url: '', wordCount: p.body.join(' ').split(/\s+/).length, publishedTime: p.date }
}

export default function WebClipPage() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('url')
  const [url, setUrl] = useState(params.get('url') || '')
  const [paste, setPaste] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [article, setArticle] = useState<CleanArticle | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reqId = useRef(0) // ignore results from a fetch the user has already abandoned
  const history = store.getHistory()

  useSeo({
    title: article ? `${article.title} — PrintxPDF` : 'Print Any Web Page Without Ads',
    description: article
      ? `A clean, printable version of ${article.title}.`.slice(0, 158)
      : 'Paste a URL and get a clean, printable version of any web page. Ads, menus and comment walls removed. Print, save as PDF or email it, free and with no upload.',
    path: '/print',
    keywords: ['print web page', 'printer friendly', 'webpage to pdf', 'remove ads before printing'],
    // the editor view is a working surface for one visitor's URL, not an indexable page
    noindex: !!article,
    schema: article
      ? []
      : [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Print a web page', path: '/print' },
          ]),
          softwareSchema({ name: 'Web page printer', description: 'Strip ads and clutter from any web page, then print it or save it as a PDF.', path: '/print' }),
        ],
  })

  const load = async (target: string) => {
    const id = ++reqId.current
    const stale = () => id !== reqId.current
    setError(null)
    setLoading('Fetching page…')
    try {
      const page = await fetchArticle(target, (m) => !stale() && setLoading(m))
      if (stale()) return
      setLoading('Stripping the clutter…')
      const clean = cleanHtml(page)
      if (clean.wordCount < 30) throw new Error('We fetched the page but could not find readable article text in it. Try pasting the content instead.')
      store.pushHistory(page.finalUrl, clean.title)
      setArticle(clean)
      document.title = `${clean.title} — PrintxPDF`
    } catch (e) {
      if (stale()) return
      setError((e as Error).message)
      setArticle(null)
    } finally {
      if (!stale()) setLoading(null)
    }
  }

  // react to ?url= / ?sample=
  useEffect(() => {
    const u = params.get('url')
    const s = params.get('sample')
    const post = params.get('post')
    if (params.get('paste')) return // article already in state from paste/upload
    if (s || post) {
      const a = s ? articleFromSample(s) : articleFromPost(post!)
      if (a) {
        setArticle(a)
        setError(null)
        document.title = `${a.title} — PrintxPDF`
      }
      return
    }
    if (u) {
      setUrl(u)
      load(u)
    } else {
      setArticle(null)
      document.title = 'Print any web page — PrintxPDF'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const submitUrl = (e: FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return inputRef.current?.focus()
    setParams({ url: url.trim() })
  }
  const submitPaste = () => {
    if (paste.trim().length < 20) return toast('Paste some content first', 'error')
    const a = cleanPastedHtml(paste, pasteTitle.trim() || 'Pasted content')
    setArticle(a)
    setParams({ paste: '1' })
  }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    const text = await f.text()
    const a = cleanPastedHtml(text, f.name.replace(/\.[^.]+$/, ''))
    setArticle(a)
    setParams({ paste: '1' })
  }
  const reset = () => {
    setArticle(null)
    setError(null)
    nav('/print')
  }

  if (article) return <Editor article={article} onReset={reset} />

  return (
    <div className="container clip-hero">
      <div style={{ maxWidth: 820 }}>
        <span className="eyebrow">Web page → clean print</span>
        <h1>
          Paste a link.
          <br />
          <span className="acid-mark">Lose the junk.</span>
        </h1>
        <p className="lead">
          We fetch the page, keep the article, and throw away ads, menus, popups and comment walls. Then you delete
          anything else with a click, and print, PDF or email the result.
        </p>
      </div>

      <div className="tabs" style={{ maxWidth: 820, marginTop: '2rem' }}>
        {(['url', 'paste', 'file'] as Tab[]).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'url' ? 'Web address' : t === 'paste' ? 'Paste HTML or text' : 'Upload .html'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 820, marginTop: '1.25rem' }}>
        {tab === 'url' && (
          <form className="clip-input" onSubmit={submitUrl}>
            <input
              ref={inputRef}
              type="text"
              inputMode="url"
              placeholder="https://example.com/some-long-article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              aria-label="Web address"
            />
            <button type="submit" disabled={!!loading}>
              {loading ? 'Working…' : 'Clean it'}
            </button>
          </form>
        )}
        {tab === 'paste' && (
          <div className="card stack">
            <input className="input" placeholder="Title (optional)" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} />
            <textarea className="textarea" placeholder="Paste the page source (View Source → copy) or just plain text…" value={paste} onChange={(e) => setPaste(e.target.value)} />
            <button className="btn btn-acid" onClick={submitPaste}>
              Clean it
            </button>
          </div>
        )}
        {tab === 'file' && (
          <div className="card stack">
            <p style={{ margin: 0 }}>Save any page from your browser (File → Save Page As → HTML only) and drop it here.</p>
            <input className="input" type="file" accept=".html,.htm,.txt,.md" onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
        )}

        {loading && (
          <div className="loading-big">
            <div className="spin" />
            <div className="badge badge-ink">{loading}</div>
          </div>
        )}
        {error && (
          <div className="card card-alarm" style={{ marginTop: '1.25rem' }}>
            <h4 className="alarm">Could not clean that page</h4>
            <pre className="mono" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', margin: '0 0 1rem' }}>
              {error}
            </pre>
            <div className="row">
              <button className="btn btn-sm" onClick={() => setTab('paste')}>
                Paste the content instead
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => load(url)}>
                Retry
              </button>
            </div>
          </div>
        )}

        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Fetching runs entirely in your browser through public reader proxies, so some sites that block bots will
          refuse. Paste mode always works. <Link to="/api">Self-host the fetcher →</Link>
        </p>
      </div>

      <div className="section-tight" style={{ marginTop: '2rem' }}>
        <span className="eyebrow">No link handy? Try a sample</span>
        <div className="grid grid-3">
          {SAMPLES.map((s) => (
            <Link key={s.id} to={`/print?sample=${s.id}`} className="card card-hover sample-card">
              <span className="badge badge-acid">{s.site}</span>
              <h4 style={{ marginTop: '0.75rem' }}>{s.title}</h4>
              <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                {s.blurb}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="section-tight">
          <span className="eyebrow">Recent</span>
          <div className="stack" style={{ maxWidth: 820 }}>
            {history.slice(0, 5).map((h) => (
              <Link key={h.url} to={`/print?url=${encodeURIComponent(h.url)}`} className="file-row" style={{ textDecoration: 'none' }}>
                <span className="name">{h.title}</span>
                <span className="size">{h.url.replace(/^https?:\/\//, '').slice(0, 50)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
