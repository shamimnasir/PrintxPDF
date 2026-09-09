import { Link } from 'react-router-dom'
import { TOOLS } from '../../features/pdf/toolsMeta'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div>
          <div className="logo" style={{ color: 'var(--paper)', marginBottom: '0.75rem' }}>
            <span className="logo-mark">P</span>
            <span>
              Print<span className="x">x</span>PDF
            </span>
          </div>
          <p style={{ opacity: 0.8, maxWidth: '30ch' }}>
            Strip the ads. Keep the words. Every tool runs in your browser, nothing is uploaded to a server.
          </p>
          <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            Demo project. Not affiliated with any other print or PDF service.
          </p>
        </div>
        <div>
          <h4>PDF tools</h4>
          {TOOLS.slice(0, 9).map((t) => (
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
          <Link to="/blog">Blog</Link>
          <Link to="/account">Account</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
      <div className="container" style={{ marginTop: '2rem', opacity: 0.6, fontSize: '0.8rem' }} >
        © {new Date().getFullYear()} PrintxPDF · Built with pdf-lib, pdf.js, Readability and Tesseract.
      </div>
    </footer>
  )
}
