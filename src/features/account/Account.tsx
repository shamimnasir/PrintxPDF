import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { applyTheme, genApiKey, store, type SavedDoc, type Settings, type Signature } from '../../lib/store'
import { useUser } from './useUser'
import { useToast } from '../../components/ui/Toast'
import { downloadBlob } from '../../lib/download'
import { useSeo } from '../../lib/seo'
import { Seg } from '../../components/ui/Seg'

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const NAV = [
  ['', 'Overview'],
  ['documents', 'Saved documents'],
  ['signatures', 'Saved signatures'],
  ['api-key', 'API key'],
  ['settings', 'Settings'],
  ['billing', 'Billing history'],
  ['domains', 'Manage domains'],
]

function Overview() {
  const user = useUser()!
  const docs = store.getDocs()
  const sigs = store.getSignatures()
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Account overview</h2>
      <div className="grid grid-3">
        {[
          ['Email', user.email],
          ['Plan', user.plan === 'pro' ? 'Pro (demo)' : 'Free'],
          ['Member since', new Date(user.createdAt).toLocaleDateString()],
          ['Saved documents', String(docs.length)],
          ['Saved signatures', String(sigs.length)],
          ['Pages cleaned', String(store.getHistory().length)],
        ].map(([k, v]) => (
          <div key={k} className="card card-flat">
            <div className="label">{k}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', wordBreak: 'break-all' }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="row">
        <Link to="/pricing" className="btn btn-sm btn-acid">
          {user.plan === 'pro' ? 'Manage plan' : 'Upgrade'}
        </Link>
        <button className="btn btn-sm btn-ghost" onClick={() => store.signOut()}>
          Sign out
        </button>
      </div>
    </div>
  )
}

function Documents() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<SavedDoc[]>(store.getDocs())
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Saved documents</h2>
      {docs.length === 0 && (
        <p className="muted">
          Nothing saved yet. Clean a page and hit <strong>Save</strong> in the editor toolbar.
        </p>
      )}
      {docs.map((d) => (
        <div key={d.id} className="file-row">
          <span className="name">
            <strong>{d.title}</strong>
            <span className="muted" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>{new Date(d.savedAt).toLocaleString()}</span>
          </span>
          <button className="btn btn-sm" onClick={() => downloadBlob(new Blob([`<!doctype html><title>${escapeHtml(d.title)}</title><body style="max-width:720px;margin:2rem auto;font-family:Georgia,serif;line-height:1.55"><h1>${escapeHtml(d.title)}</h1>${d.html}`], { type: 'text/html' }), `${d.title.replace(/[\\/:*?"<>|]+/g, '-')}.html`)}>
            Download HTML
          </button>
          {d.url && (
            <Link className="btn btn-sm btn-ghost" to={`/print?url=${encodeURIComponent(d.url)}`}>
              Re-clean
            </Link>
          )}
          <button
            className="icon-btn"
            onClick={() => {
              store.deleteDoc(d.id)
              setDocs(store.getDocs())
              toast('Deleted')
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

function Signatures() {
  const [sigs, setSigs] = useState<Signature[]>(store.getSignatures())
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Saved signatures</h2>
      {sigs.length === 0 && (
        <p className="muted">
          None yet. Create one in <Link to="/tools/sign-pdf">Sign PDF</Link>.
        </p>
      )}
      <div className="grid grid-3">
        {sigs.map((s) => (
          <div key={s.id} className="card card-flat">
            <div style={{ background: '#fff', border: '2px solid var(--line)', padding: '0.5rem', marginBottom: '0.5rem' }}>
              <img src={s.dataUrl} alt={s.name} style={{ maxHeight: 60, width: 'auto', margin: '0 auto' }} />
            </div>
            <div className="row between">
              <strong>{s.name}</strong>
              <button
                className="icon-btn"
                onClick={() => {
                  store.deleteSignature(s.id)
                  setSigs(store.getSignatures())
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ApiKey() {
  const user = useUser()!
  const { toast } = useToast()
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>API key</h2>
      <p className="muted">A demo key for the <Link to="/api">API spec</Link>. It authenticates nothing today.</p>
      <pre className="code">{user.apiKey}</pre>
      <div className="row">
        <button className="btn btn-sm btn-acid" onClick={() => navigator.clipboard.writeText(user.apiKey).then(() => toast('Copied'))}>
          Copy
        </button>
        <button
          className="btn btn-sm btn-alarm"
          onClick={() => {
            store.updateUser({ apiKey: genApiKey() })
            toast('Key rotated')
          }}
        >
          Rotate key
        </button>
      </div>
    </div>
  )
}

function SettingsPage() {
  const { toast } = useToast()
  const [s, setS] = useState<Settings>(store.getSettings())
  useEffect(() => {
    store.setSettings(s)
    applyTheme(s.theme)
  }, [s])
  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: '2rem' }}>Settings</h2>
      <div>
        <label className="label">Theme</label>
        <Seg label="Theme" value={s.theme} options={[['light', 'Light'], ['dark', 'Dark'], ['system', 'System']]} onChange={(theme) => setS({ ...s, theme })} />
      </div>
      <div>
        <label className="label">Default text size</label>
        <Seg label="Default text size" value={s.defaultTextSize} options={[['S', 'S'], ['M', 'M'], ['L', 'L'], ['XL', 'XL']]} onChange={(defaultTextSize) => setS({ ...s, defaultTextSize })} />
      </div>
      <div>
        <label className="label">Default image size</label>
        <Seg label="Default image size" value={s.defaultImageSize} options={[['full', 'Full'], ['large', 'Large'], ['small', 'Small'], ['none', 'None']]} onChange={(defaultImageSize) => setS({ ...s, defaultImageSize })} />
      </div>
      <div>
        <label className="label">Default paper</label>
        <Seg label="Default paper" value={s.defaultPageSize} options={[['A4', 'A4'], ['Letter', 'Letter']]} onChange={(defaultPageSize) => setS({ ...s, defaultPageSize })} />
      </div>
      <button
        className="btn btn-sm btn-alarm"
        onClick={() => {
          if (!confirm('Delete all local data (account, documents, signatures)?')) return
          localStorage.clear()
          store.signOut()
          toast('Everything wiped')
        }}
      >
        Delete all my data
      </button>
    </div>
  )
}

function Billing() {
  const user = useUser()!
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Billing history</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {user.plan === 'pro' ? (
            <tr>
              <td>{new Date().toLocaleDateString()}</td>
              <td>Pro plan (demo)</td>
              <td>$0.00</td>
              <td>
                <span className="badge badge-acid">Not charged</span>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={4} className="muted">
                No invoices. Free plan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Domains() {
  const [domains, setDomains] = useState<string[]>(() => JSON.parse(localStorage.getItem('pxp:domains') || '[]'))
  const [v, setV] = useState('')
  const save = (d: string[]) => {
    setDomains(d)
    localStorage.setItem('pxp:domains', JSON.stringify(d))
  }
  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: '2rem' }}>Manage domains</h2>
      <p className="muted">Domains where the <Link to="/website-button">print button</Link> or WordPress plugin is installed. Demo only.</p>
      <div className="row" style={{ gap: '0.5rem' }}>
        <input className="input" style={{ flex: 1 }} placeholder="example.com" value={v} onChange={(e) => setV(e.target.value)} />
        <button
          className="btn btn-acid"
          onClick={() => {
            if (v.trim()) save([...domains, v.trim().toLowerCase()])
            setV('')
          }}
        >
          Add
        </button>
      </div>
      {domains.map((d) => (
        <div key={d} className="file-row">
          <span className="name mono">{d}</span>
          <span className="badge badge-acid">Verified (demo)</span>
          <button className="icon-btn" onClick={() => save(domains.filter((x) => x !== d))}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default function Account() {
  const user = useUser()
  useSeo({ title: 'Your account — PrintxPDF', description: 'Saved documents, signatures and settings, stored in this browser.', path: '/account', noindex: true })
  if (!user) return <Navigate to="/signin" replace />
  return (
    <div className="container section">
      <div className="tool-grid account-grid">
        <nav className="card card-flat stack" style={{ gap: 0, padding: '0.5rem' }}>
          {NAV.map(([p, l]) => (
            <NavLink key={p} to={p} end={p === ''} className={({ isActive }) => `nav-btn ${isActive ? 'is-active' : ''}`} style={({ isActive }) => (isActive ? { background: 'var(--acid)', color: 'var(--ink)', borderColor: 'var(--line)' } : {})}>
              {l}
            </NavLink>
          ))}
        </nav>
        <div>
          <Routes>
            <Route index element={<Overview />} />
            <Route path="documents" element={<Documents />} />
            <Route path="signatures" element={<Signatures />} />
            <Route path="api-key" element={<ApiKey />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="billing" element={<Billing />} />
            <Route path="domains" element={<Domains />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
