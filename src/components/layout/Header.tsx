import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { TOOLS, CATEGORY_LABEL, type ToolCategory } from '../../features/pdf/toolsMeta'
import { useUser } from '../../features/account/useUser'
import { applyTheme, store } from '../../lib/store'
import { safeStorage } from '../../admin/config'
import { Wordmark, initial } from './Wordmark'
import { useSiteConfig } from '../../admin/useSiteConfig'

function NavMenu({ label, children, id, open, setOpen }: { label: string; id: string; children: React.ReactNode; open: string | null; setOpen: (v: string | null) => void }) {
  const isOpen = open === id
  return (
    <div
      className={`nav-item ${isOpen ? 'open' : ''}`}
      onMouseEnter={() => setOpen(id)}
      onMouseLeave={() => setOpen(null)}
    >
      <button className="nav-btn" onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
        {label} <span aria-hidden>▾</span>
      </button>
      <div className="nav-menu wide" style={id !== 'tools' ? { columns: 1, minWidth: 260 } : undefined}>
        {children}
      </div>
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState<string | null>(null)
  const [menu, setMenu] = useState(false)
  const user = useUser()
  const loc = useLocation()
  const ref = useRef<HTMLDivElement>(null)
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const cfg = useSiteConfig()
  const [annOpen, setAnnOpen] = useState(() => safeStorage('session')?.getItem('pxp:ann') !== 'closed')
  const ann = cfg.announcement

  useEffect(() => {
    setOpen(null)
    setMenu(false)
  }, [loc.pathname])

  // sticky offsets (editor toolbar, article sidebar, heading anchors) depend on the real
  // header height, which changes when the announcement bar is shown or the nav wraps
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => document.documentElement.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ann.enabled, annOpen])

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    store.setSettings({ theme: next })
    applyTheme(next)
    setDark(!dark)
  }

  const cats = (Object.keys(CATEGORY_LABEL) as ToolCategory[]).filter((c) => c !== 'more')
  const visible = TOOLS.filter((t) => !cfg.tools.hidden.includes(t.slug))

  return (
    <div className="header-stack" ref={ref}>
      {ann.enabled && annOpen && (
        <div className="announce">
          <div className="container row" style={{ gap: '0.6rem', justifyContent: 'center' }}>
            <span>{ann.text}</span>
            {ann.linkText && (
              <Link to={ann.linkUrl} style={{ fontWeight: 900, textDecoration: 'underline' }}>
                {ann.linkText} →
              </Link>
            )}
            {ann.dismissible && (
              <button
                className="announce-x"
                aria-label="Dismiss"
                onClick={() => {
                  safeStorage('session')?.setItem('pxp:ann', 'closed')
                  setAnnOpen(false)
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
      <header className={`header ${menu ? 'menu-open' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label={`${cfg.site.name} home`}>
          <span className="logo-mark">{initial(cfg.site.name)}</span>
          <Wordmark name={cfg.site.name} />
        </Link>

        <nav id="main-nav" className="nav" aria-label="Main">
          <NavMenu label="PDF Tools" id="tools" open={open} setOpen={setOpen}>
            {cats.map((c) => {
              const inCat = visible.filter((t) => t.category === c)
              if (!inCat.length) return null
              return (
                <div key={c} style={{ breakInside: 'avoid' }}>
                  <div className="menu-title">{CATEGORY_LABEL[c]}</div>
                  {inCat.map((t) => (
                    <Link key={t.slug} to={`/tools/${t.slug}`}>
                      {t.name}
                    </Link>
                  ))}
                </div>
              )
            })}
            <div style={{ breakInside: 'avoid' }}>
              <div className="menu-title">More</div>
              {visible.some((t) => t.category === 'more') &&
                visible
                  .filter((t) => t.category === 'more')
                  .map((t) => (
                    <Link key={t.slug} to={`/tools/${t.slug}`}>
                      {t.name}
                    </Link>
                  ))}
              <Link to="/blog">Guides</Link>
              <Link to="/tools">All tools →</Link>
            </div>
          </NavMenu>
          <NavMenu label="Website Tools" id="site" open={open} setOpen={setOpen}>
            <Link to="/print">Print any web page</Link>
            <Link to="/website-button">Print & PDF button for your site</Link>
            <Link to="/wordpress">WordPress plugin</Link>
            <Link to="/api">PDF API</Link>
          </NavMenu>
          <NavMenu label="Extensions" id="ext" open={open} setOpen={setOpen}>
            <Link to="/extensions/chrome">Chrome</Link>
            <Link to="/extensions/firefox">Firefox</Link>
            <Link to="/extensions/safari">Safari</Link>
            <Link to="/extensions/edge">Edge</Link>
          </NavMenu>
          <NavLink to="/pricing" className="nav-btn">
            Pricing
          </NavLink>
        </nav>

        <div className="header-right">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle theme">
            {dark ? '☀' : '☾'}
          </button>
          {user ? (
            <>
              <Link to="/account" className="btn btn-sm hide-mobile">
                {user.name}
                {user.plan !== 'free' && (
                  <span className="badge badge-acid" style={{ marginLeft: '0.4rem' }}>
                    {user.plan === 'api' ? 'API' : 'Pro'}
                  </span>
                )}
              </Link>
              <button
                className="btn btn-sm btn-ghost hide-mobile"
                onClick={() => store.signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn btn-sm btn-ghost hide-mobile">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-sm btn-acid">
                Sign up
              </Link>
            </>
          )}
          <button className="icon-btn burger" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu} aria-controls="main-nav">
            ≡
          </button>
        </div>
      </div>
      </header>
    </div>
  )
}
