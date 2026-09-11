import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToolCard } from '../features/pdf/ToolCard'
import { useVisibleTools } from '../features/pdf/useTools'
import { useSiteConfig } from '../admin/useSiteConfig'
import { breadcrumbSchema, softwareSchema, useSeo } from '../lib/seo'
import '../features/pdf/tools.css'

/** Splits a headline like "Print only what matters." into "Print only what " + "matters." so only the last word is emphasised. */
function lastWord(text: string): [string, string] {
  const t = text.trim()
  if (!t) return ['', '']
  const i = t.lastIndexOf(' ')
  return i === -1 ? ['', t] : [t.slice(0, i + 1), t.slice(i + 1)]
}

export default function Home() {
  const nav = useNavigate()
  const cfg = useSiteConfig()
  const tools = useVisibleTools()
  const [h1Lead, h1Last] = lastWord(cfg.home.headline1)
  const [h2Lead, h2Last] = lastWord(cfg.home.headline2)
  useSeo({
    title: `${cfg.site.name} | ${cfg.site.tagline}`,
    description: cfg.site.description,
    path: '/',
    keywords: cfg.seo.keywords,
    noindex: cfg.seo.noindexAll,
    schema: [
      breadcrumbSchema([{ name: 'Home', path: '/' }]),
      softwareSchema({ name: cfg.site.name, description: cfg.site.description, path: '/' }),
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: cfg.site.name,
        url: cfg.site.url,
        description: cfg.site.description,
        potentialAction: { '@type': 'SearchAction', target: `${cfg.site.url}/tools?q={q}`, 'query-input': 'required name=q' },
      },
    ],
  })
  const [url, setUrl] = useState('')
  const [drag, setDrag] = useState(false)

  const go = (e: FormEvent) => {
    e.preventDefault()
    nav(url.trim() ? `/print?url=${encodeURIComponent(url.trim())}` : '/print')
  }
  const onFile = (files: FileList | null) => {
    if (!files?.[0]) return
    const f = files[0]
    const ext = f.name.split('.').pop()?.toLowerCase()
    const target = ext === 'pdf' ? 'organize-pdf' : ext === 'docx' ? 'word-to-pdf' : ext === 'xlsx' || ext === 'csv' ? 'excel-to-pdf' : ext === 'html' ? 'html-to-pdf' : 'jpg-to-pdf'
    nav(`/tools/${target}`)
  }

  return (
    <>
      <section className="section" style={{ paddingBottom: '2rem' }}>
        <div className="container center">
          <span className="eyebrow">{cfg.home.eyebrow.replace('{count}', String(tools.length))}</span>
          <h1 style={{ maxWidth: '14ch', margin: '0 auto 1rem' }}>
            {h1Lead}
            {h1Last && <span className="acid-mark">{h1Last}</span>}
            <br />
            {h2Lead}
            {h2Last && <span className="alarm">{h2Last}</span>}
          </h1>
          <p className="lead" style={{ margin: '0 auto 2.5rem' }}>{cfg.home.lead}</p>

          <div className="grid grid-2" style={{ maxWidth: 980, margin: '0 auto', textAlign: 'left' }}>
            <label
              className={`card ${drag ? 'card-acid' : ''}`}
              style={{ cursor: 'pointer', minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              onDragOver={(e) => {
                e.preventDefault()
                setDrag(true)
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDrag(false)
                onFile(e.dataTransfer.files)
              }}
            >
              <div style={{ fontSize: '2.2rem' }}>⬆</div>
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>{cfg.home.fileCardTitle}</h3>
              <p className="muted" style={{ margin: '0 0 0.75rem' }}>{cfg.home.fileCardText.replace('{count}', String(tools.length))}</p>
              <span className="btn btn-sm btn-ink" style={{ alignSelf: 'flex-start' }}>
                Drop a file or click to browse
              </span>
              <input type="file" hidden onChange={(e) => onFile(e.target.files)} />
              <div className="mono muted" style={{ fontSize: '0.7rem', marginTop: '0.75rem' }}>
                PDF · WORD · EXCEL · IMAGES · HTML
              </div>
            </label>

            {/* action/method/name make this a working GET form on its own, so a visitor who hits
                Go before the JavaScript has loaded still lands on /print?url=… instead of nothing */}
            <form className="card" style={{ minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} action="/print" method="get" onSubmit={go}>
              <div style={{ fontSize: '2.2rem' }}>⌘</div>
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>{cfg.home.urlCardTitle}</h3>
              <p className="muted" style={{ margin: '0 0 0.75rem' }}>{cfg.home.urlCardText}</p>
              <div className="clip-input" style={{ boxShadow: 'none' }}>
                <input type="text" name="url" inputMode="url" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="URL" />
                <button type="submit">Go</button>
              </div>
              <div className="mono muted" style={{ fontSize: '0.7rem', marginTop: '0.75rem' }}>
                Or try a <Link to="/print?sample=sourdough">sample page</Link> · even faster with the{' '}
                <Link to="/extensions/chrome">extension</Link>
              </div>
            </form>
          </div>

          {/* The three objections a first-time visitor actually has, answered before they scroll.
              Billing conduct is the wedge: it is where this category is weakest. */}
          <ul className="promise-row">
            <li>
              <strong>Free tools stay free.</strong> No account, no card, no watermark on anything you make.
            </li>
            <li>
              <strong>No trial that turns into a charge.</strong> There is no trial. Paid plans start only when you pick one.
            </li>
            <li>
              <strong>Cancel in one click.</strong> No email to send, nobody talking you out of it, full refund inside 14 days, 30 on Lifetime.
            </li>
          </ul>
        </div>
      </section>

      {cfg.home.showMarquee && cfg.home.marquee.length > 0 && (
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...cfg.home.marquee, ...cfg.home.marquee].map((l, i) => (
            <span key={i} style={{ padding: '0 2rem' }}>
              {l} ✦
            </span>
          ))}
        </div>
      </div>
      )}

      <section className="section">
        <div className="container">
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span className="eyebrow">Popular PDF tools</span>
              <h2 style={{ margin: 0 }}>
                {tools.length} tools.
                <br />
                One tab. No account.
              </h2>
            </div>
            <Link to="/tools" className="btn">
              All {tools.length} tools →
            </Link>
          </div>
          <div className="grid grid-4">
            {tools.filter((t) => t.status === 'real')
              .slice(0, 12)
              .map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
          </div>
        </div>
      </section>

      {cfg.home.showHowItWorks && (
      <section className="section band-ink">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--footer-accent)' }}>
            How the page cleaner works
          </span>
          <div className="grid grid-3" style={{ marginTop: '1rem' }}>
            {[
              ['01', 'Paste a link', 'We load the page and keep only the article, right in your browser. Menus, sidebars, pop-ups and comment threads are gone before you see it.'],
              ['02', 'Keep what you want', 'Click any paragraph, image or table to remove it, or drag across a whole section. Resize the text, shrink the images, undo with one key.'],
              ['03', 'Print, save or send', 'Print it with crisp text, save it as a PDF or an image, or email it to yourself. Nothing is uploaded.'],
            ].map(([n, h, p]) => (
              <div key={n} style={{ borderTop: '3px solid var(--footer-accent)', paddingTop: '1rem' }}>
                <div className="mono" style={{ color: 'var(--footer-accent)', fontSize: '2rem', fontWeight: 600 }}>{n}</div>
                <h3 style={{ color: 'inherit' }}>{h}</h3>
                <p style={{ opacity: 0.85 }}>{p}</p>
              </div>
            ))}
          </div>
          <Link to="/print" className="btn btn-acid btn-lg" style={{ marginTop: '1rem' }}>
            Clean a page now →
          </Link>
        </div>
      </section>
      )}

      {cfg.home.showProducts && (
      <section className="section">
        <div className="container">
          <span className="eyebrow">Beyond the website</span>
          <h2>Take it wherever you work.</h2>
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            {[
              ['PDF tools', 'Everything a document needs: create, edit, fill in, organize, protect, black out private details, compare, convert. Browser tools never upload your file.', '/tools', 'Open the tools'],
              ['Chrome extension', 'One click on any page opens it in the page cleaner. Right-click a link or some highlighted text to send just that. It reads nothing until you click.', '/extensions/chrome', 'Get the extension'],
              ['WordPress plugin', 'Print, PDF and Email buttons on every post from one small free add-on. No account, no key, and it never contacts anyone.', '/wordpress', 'See the plugin'],
              ['Signatures', 'Draw or type a signature, place it on any page, add the date, download. Save it for next time.', '/tools/sign-pdf', 'Sign a PDF'],
            ].map(([h, p, to, cta]) => (
              <div key={h} className="card">
                <h3>{h}</h3>
                <p>{p}</p>
                <Link to={to} className="btn btn-sm btn-acid">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {cfg.home.showPrivacy && (
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card card-acid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>Privacy is not a feature. It is how the site is built.</h2>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>
                Every browser tool works on your PDF inside your browser, on your own computer. Nothing is uploaded. Close the
                tab and the file is gone. The few jobs that need our server say so on their page, send the file over a secure
                connection, and delete it the moment they finish.
              </p>
            </div>
          </div>
        </div>
      </section>
      )}
    </>
  )
}
