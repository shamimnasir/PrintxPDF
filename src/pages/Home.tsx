import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TOOLS } from '../features/pdf/toolsMeta'
import '../features/pdf/tools.css'

const LOGOS = ['Northwind Post', 'Kestrel Labs', 'Harbor Health', 'Meridian U', 'Tabula Legal', 'Orbit Studio', 'Bluebell Schools', 'Fjord Bank']

export default function Home() {
  const nav = useNavigate()
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
          <span className="eyebrow">Free · No uploads · Works offline once loaded</span>
          <h1 style={{ maxWidth: '14ch', margin: '0 auto 1rem' }}>
            Cut the <span className="acid-mark">clutter.</span>
            <br />
            Own your <span className="alarm">PDFs.</span>
          </h1>
          <p className="lead" style={{ margin: '0 auto 2.5rem' }}>
            Strip ads and menus from any web page before you print. Then merge, split, sign, compress and convert PDFs,
            all inside your browser. Nothing is uploaded, ever.
          </p>

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
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>Work with a file</h3>
              <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                Compress, sign, convert, merge, organize
              </p>
              <span className="btn btn-sm btn-ink" style={{ alignSelf: 'flex-start' }}>
                Drop a file or click to browse
              </span>
              <input type="file" hidden onChange={(e) => onFile(e.target.files)} />
              <div className="mono muted" style={{ fontSize: '0.7rem', marginTop: '0.75rem' }}>
                PDF · WORD · EXCEL · IMAGES · HTML
              </div>
            </label>

            <form className="card" style={{ minHeight: 230, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} onSubmit={go}>
              <div style={{ fontSize: '2.2rem' }}>⌘</div>
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>Print or PDF a web page</h3>
              <p className="muted" style={{ margin: '0 0 0.75rem' }}>
                Paste a URL, we strip the ads and clutter
              </p>
              <div className="clip-input" style={{ boxShadow: 'none' }}>
                <input type="text" inputMode="url" placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} aria-label="URL" />
                <button type="submit">Go</button>
              </div>
              <div className="mono muted" style={{ fontSize: '0.7rem', marginTop: '0.75rem' }}>
                Or try a <Link to="/print?sample=sourdough">sample page</Link> · even faster with the{' '}
                <Link to="/extensions/chrome">extension</Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[...LOGOS, ...LOGOS].map((l, i) => (
            <span key={i} style={{ padding: '0 2rem' }}>
              {l} ✦
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row between" style={{ alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span className="eyebrow">Popular PDF tools</span>
              <h2 style={{ margin: 0 }}>
                Everything you do to a PDF,
                <br />
                in one loud place.
              </h2>
            </div>
            <Link to="/tools" className="btn">
              All {TOOLS.length} tools →
            </Link>
          </div>
          <div className="grid grid-4">
            {TOOLS.filter((t) => t.status === 'real')
              .slice(0, 12)
              .map((t) => (
                <Link key={t.slug} to={`/tools/${t.slug}`} className="card card-hover tool-card">
                  <div className="tool-icon">{t.icon}</div>
                  <div>
                    <h4>{t.name}</h4>
                    <p className="muted">{t.short}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ink)', color: 'var(--paper)', borderTop: 'var(--bw) solid var(--line)', borderBottom: 'var(--bw) solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--acid-dim)' }}>
            How the web printer works
          </span>
          <div className="grid grid-3" style={{ marginTop: '1rem' }}>
            {[
              ['01', 'Paste a link', 'We fetch the page in your browser through a reader proxy and run Mozilla\'s Readability on it. Menus, sidebars, popups and comment sections never make it through.'],
              ['02', 'Delete what is left', 'Hover any paragraph, image or table and click to remove it. Drag to sweep whole sections. Undo is one key away. Resize text, shrink or drop images.'],
              ['03', 'Print, PDF, email', 'Print with your browser for crisp text, download a PDF, save a PNG screenshot, or email it to yourself. Nothing touches a server.'],
            ].map(([n, h, p]) => (
              <div key={n} style={{ borderTop: '3px solid var(--acid-dim)', paddingTop: '1rem' }}>
                <div className="mono" style={{ color: 'var(--acid-dim)', fontSize: '2rem', fontWeight: 600 }}>{n}</div>
                <h3 style={{ color: 'var(--paper)' }}>{h}</h3>
                <p style={{ opacity: 0.85 }}>{p}</p>
              </div>
            ))}
          </div>
          <Link to="/print" className="btn btn-acid btn-lg" style={{ marginTop: '1rem' }}>
            Try it on a page →
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Everything PrintxPDF does</span>
          <h2>Four products. One idea: cleaner documents, less waste.</h2>
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            {[
              ['PDF tools', 'Create, edit, organize and convert PDFs from the web and your files. Merge, split, sign, watermark, number, compress, OCR. Every one runs locally.', '/tools', 'Start using PDF tools'],
              ['Browser extension', 'A one-click button in Chrome, Firefox, Safari and Edge that sends the page you are reading straight to the cleaner, no copy-pasting.', '/extensions', 'Get the extension'],
              ['WordPress plugin', 'Give your readers a Print / PDF / Email button on every post. Installs from the admin, respects your theme, works with WooCommerce.', '/wordpress', 'Explore the plugin'],
              ['Electronic signatures', 'Draw or type a signature, drop it on any page, add today\'s date, download. Signatures can be saved to your account for next time.', '/tools/sign-pdf', 'Start signing'],
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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="card card-acid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>Privacy is not a feature. It is the architecture.</h2>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600 }}>
                This site is plain static files. There is no upload endpoint to leak from. Your PDFs are processed in
                memory by your own browser using pdf-lib, pdf.js and Tesseract. Close the tab and they are gone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
