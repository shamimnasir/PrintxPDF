import { Link } from 'react-router-dom'
import { useVisibleTools } from '../../features/pdf/useTools'
import { useSiteConfig } from '../../admin/useSiteConfig'

function Wordmark({ name }: { name: string }) {
  // highlight the "x" when the name contains one (PrintxPDF); otherwise render it plainly
  const m = name.match(/^(.*?)x(pdf.*)$/i)
  if (!m) return <span>{name}</span>
  return (
    <span>
      {m[1]}
      <span className="x">x</span>
      {m[2]}
    </span>
  )
}

export function Footer() {
  const cfg = useSiteConfig()
  const tools = useVisibleTools()
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div>
          <div className="logo" style={{ color: 'var(--paper)', marginBottom: '0.75rem' }}>
            <span className="logo-mark">{cfg.site.name.charAt(0).toUpperCase()}</span>
            <Wordmark name={cfg.site.name} />
          </div>
          <p style={{ opacity: 0.8, maxWidth: '30ch' }}>
            {cfg.site.description}
          </p>
          <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            {cfg.site.footerNote}
          </p>
        </div>
        <div>
          <h4>PDF tools</h4>
          {tools.slice(0, 9).map((t) => (
            <Link key={t.slug} to={`/tools/${t.slug}`}>
              {t.name}
            </Link>
          ))}
          <Link to="/tools">All tools →</Link>
        </div>
        <div>
          <h4>Website tools</h4>
          <Link to="/print">Print any web page</Link>
          <Link to="/website-button">Print & PDF button</Link>
          <Link to="/wordpress">WordPress plugin</Link>
          <Link to="/api">PDF API</Link>
          <Link to="/pricing">Pricing</Link>
          <h4 style={{ marginTop: '1rem' }}>Extensions</h4>
          <Link to="/extensions/chrome">Chrome</Link>
          <Link to="/extensions/firefox">Firefox</Link>
          <Link to="/extensions/safari">Safari</Link>
          <Link to="/extensions/edge">Edge</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/blog">Guides</Link>
          <Link to="/account">Account</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
      <div className="container" style={{ marginTop: '2rem', opacity: 0.6, fontSize: '0.8rem' }} >
        © {new Date().getFullYear()} {cfg.site.name} · Built with pdf-lib, pdf.js, Readability and Tesseract.
      </div>
    </footer>
  )
}
