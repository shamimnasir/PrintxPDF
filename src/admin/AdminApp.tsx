import { useState, type FormEvent } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { hasDraft, isUnlocked, lock, unlock } from './config'
import { useSiteConfig } from './useSiteConfig'
import { useSeo } from '../lib/seo'
import { useToast } from '../components/ui/Toast'
import { Analytics, Appearance, Code, Content, Dashboard, Data, General, Pages, Seo, ToolsAdmin } from './sections'
import './admin.css'

const NAV = [
  ['', '▦', 'Dashboard'],
  ['general', '⚙', 'General'],
  ['appearance', '◐', 'Appearance'],
  ['pages', '▤', 'Pages & home'],
  ['content', '✎', 'Blog content'],
  ['tools', '⧉', 'Tools'],
  ['seo', '↗', 'SEO'],
  ['analytics', '▲', 'Analytics'],
  ['code', '<>', 'Custom code'],
  ['data', '⤓', 'Publish & data'],
] as const

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const { toast } = useToast()
  const [pass, setPass] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (unlock(pass)) {
      onUnlock()
      toast('Welcome back')
    } else {
      toast('Wrong passcode', 'error')
    }
  }
  return (
    <div className="container gate">
      <span className="eyebrow">Admin</span>
      <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>Site control panel</h1>
      <form className="card stack" onSubmit={submit}>
        <div>
          <label className="label" htmlFor="pass">
            Passcode
          </label>
          <input id="pass" className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
        </div>
        <button className="btn btn-acid btn-block" type="submit">
          Unlock
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
          Default passcode is <code className="inline">printxpdf</code>. Change it under Publish &amp; data. This gate only
          hides the UI in this browser — it is not a security boundary, because the panel edits a local draft and
          publishing requires access to the repository.
        </p>
      </form>
    </div>
  )
}

export default function AdminApp() {
  const [open, setOpen] = useState(isUnlocked)
  const cfg = useSiteConfig()
  const { pathname } = useLocation()
  const draft = hasDraft()

  useSeo({
    title: 'Admin — PrintxPDF',
    description: 'Site control panel.',
    path: pathname,
    noindex: true,
  })

  if (!open) return <Gate onUnlock={() => setOpen(true)} />

  return (
    <div className="container section" style={{ paddingTop: '2rem' }}>
      <div className="admin-bar">
        <strong>Admin</strong>
        <span className={`dot ${draft ? '' : 'clean'}`} aria-hidden />
        <span style={{ fontSize: '0.85rem' }}>{draft ? 'Unpublished draft in this browser' : 'Matching the published config'}</span>
        <span style={{ flex: 1 }} />
        <NavLink to="/admin/data" className="btn btn-sm btn-acid">
          Publish
        </NavLink>
        <button
          className="btn btn-sm btn-ghost"
          style={{ color: 'var(--paper)' }}
          onClick={() => {
            lock()
            setOpen(false)
          }}
        >
          Lock
        </button>
      </div>

      <div className="admin-shell">
        <nav className="admin-nav" aria-label="Admin sections">
          {NAV.map(([to, icon, label]) => (
            <NavLink key={to} to={to ? `/admin/${to}` : '/admin'} end={!to} className={({ isActive }) => (isActive ? 'on' : '')}>
              <span aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
          <div className="sep" />
          <NavLink to="/" style={{ fontWeight: 600, fontSize: '0.82rem' }}>
            ← Back to site
          </NavLink>
        </nav>

        <div>
          <Routes>
            <Route index element={<Dashboard cfg={cfg} />} />
            <Route path="general" element={<General cfg={cfg} />} />
            <Route path="appearance" element={<Appearance cfg={cfg} />} />
            <Route path="pages" element={<Pages cfg={cfg} />} />
            <Route path="content" element={<Content cfg={cfg} />} />
            <Route path="tools" element={<ToolsAdmin cfg={cfg} />} />
            <Route path="seo" element={<Seo cfg={cfg} />} />
            <Route path="analytics" element={<Analytics cfg={cfg} />} />
            <Route path="code" element={<Code cfg={cfg} />} />
            <Route path="data" element={<Data cfg={cfg} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
