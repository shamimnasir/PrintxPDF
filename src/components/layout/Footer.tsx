import { Link } from 'react-router-dom'
import { useVisibleTools } from '../../features/pdf/useTools'
import { useSiteConfig } from '../../admin/useSiteConfig'
import { Wordmark, initial } from './Wordmark'
import { authorPath } from '../../lib/seo'

export function Footer() {
  const cfg = useSiteConfig()
  const tools = useVisibleTools()
  return (
    <footer className="footer">
      <div className="container grid grid-4">
        <div>
          <div className="logo" style={{ color: 'var(--footer-fg)', marginBottom: '0.75rem' }}>
            <span className="logo-mark">{initial(cfg.site.name)}</span>
            <Wordmark name={cfg.site.name} />
          </div>
          <p style={{ opacity: 0.8, maxWidth: '30ch' }}>
            {cfg.site.description}
          </p>
          <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            {cfg.site.footerNote}
          </p>
          <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
            Founded by{' '}
            <Link to={authorPath(cfg.author)} style={{ color: 'inherit' }}>
              {cfg.author.name}
            </Link>
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
          <Link to="/api">For developers (API)</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/extensions/chrome">Chrome extension</Link>
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
        © {new Date().getFullYear()} {cfg.site.name} · Built with open source tools.
      </div>
    </footer>
  )
}
