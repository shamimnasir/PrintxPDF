import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { TOOLS, CATEGORY_LABEL, type ToolCategory } from '../../features/pdf/toolsMeta'
import { useUser } from '../../features/account/useUser'
import { applyTheme, store } from '../../lib/store'

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
  const ref = useRef<HTMLElement>(null)
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')

  useEffect(() => {
    setOpen(null)
    setMenu(false)
  }, [loc.pathname])

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    store.setSettings({ theme: next })
    applyTheme(next)
    setDark(!dark)
  }

  const cats = (Object.keys(CATEGORY_LABEL) as ToolCategory[]).filter((c) => c !== 'more')

  return (
    <header ref={ref} className={`header ${menu ? 'menu-open' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="PrintxPDF home">
          <span className="logo-mark">P</span>
          <span>
            Print<span className="x">x</span>PDF
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          <NavMenu label="PDF Tools" id="tools" open={open} setOpen={setOpen}>
            {cats.map((c) => (
              <div key={c} style={{ breakInside: 'avoid' }}>
                <div className="menu-title">{CATEGORY_LABEL[c]}</div>
                {TOOLS.filter((t) => t.category === c).map((t) => (
                  <Link key={t.slug} to={`/tools/${t.slug}`}>
                    {t.name}
                  </Link>
                ))}
              </div>
            ))}
            <div style={{ breakInside: 'avoid' }}>
              <div className="menu-title">More</div>
              <Link to="/tools/qr-code">QR Code Generator</Link>
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
          <button className="icon-btn burger" onClick={() => setMenu(!menu)} aria-label="Menu">
            ≡
          </button>
        </div>
      </div>
    </header>
  )
}
