import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import { applyTheme, store, type SavedDoc, type Settings, type Signature } from '../../lib/store'
import { ApiError, billing, decodeToken, describeError, PLAN_LABEL, type Me, type PaidPlan, type Plan } from '../../lib/api'
import { useSiteConfig } from '../../admin/useSiteConfig'
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
  ['api-key', 'Access key'],
  ['settings', 'Settings'],
  ['billing', 'Subscription'],
  ['domains', 'My websites'],
]

const planName = (p: Plan) => PLAN_LABEL[p] ?? 'Free'
const fmtDate = (unix?: number) => (unix ? new Date(unix * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '')

/** Asks the API for the live subscription state and keeps the local plan and key in step with it. */
function useMe(token: string | undefined) {
  const [me, setMe] = useState<Me | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!token) return
    let alive = true
    billing
      .me(token)
      .then((m) => {
        if (!alive) return
        setMe(m)
        const u = store.getUser()
        if (!u?.entitlement) return
        if (m.token) store.updateUser({ entitlement: { ...u.entitlement, token: m.token } })
        const plan: Plan = m.active && m.plan !== 'free' ? m.plan : 'free'
        if (u.plan !== plan) store.updateUser({ plan })
      })
      .catch((e) => alive && setError(describeError(e).message))
    return () => {
      alive = false
    }
  }, [token])
  return { me, error }
}

/** Opens the Stripe customer portal for invoices, plan changes and cancellation. */
function usePortal() {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const open = async (token: string) => {
    setBusy(true)
    try {
      const { url } = await billing.portal(token)
      window.location.assign(url)
    } catch (e) {
      toast(describeError(e).message, 'error')
      setBusy(false)
    }
  }
  return { open, busy }
}

function Overview() {
  const user = useUser()!
  const docs = store.getDocs()
  const sigs = store.getSignatures()
  const token = user.entitlement?.token
  const { me } = useMe(token)
  const portal = usePortal()
  const paid = user.plan !== 'free' && !!token
  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Account overview</h2>
      <div className="grid grid-3">
        {[
          ['Email', user.email],
          ['Plan', paid ? `${planName(user.plan)}${me?.currentPeriodEnd ? ` · ${me.cancelAtPeriodEnd ? 'ends' : 'renews'} ${fmtDate(me.currentPeriodEnd)}` : ''}` : 'Free'],
          ['Server conversions', me ? `${me.usage.used} of ${me.usage.limit} this month` : paid ? 'Checking…' : '5 free a month'],
          ['Member since', new Date(user.createdAt).toLocaleDateString()],
          ['Saved documents', String(docs.length)],
          ['Saved signatures', String(sigs.length)],
        ].map(([k, v]) => (
          <div key={k} className="card card-flat">
            <div className="label">{k}</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', wordBreak: 'break-all' }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="row">
        {paid ? (
          <button className="btn btn-sm btn-acid" disabled={portal.busy} onClick={() => portal.open(token!)}>
            {portal.busy ? 'Opening…' : 'Manage subscription'}
          </button>
        ) : (
          <Link to="/pricing" className="btn btn-sm btn-acid">
            Upgrade
          </Link>
        )}
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
            <div className="sig-thumb" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
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
  const [pasted, setPasted] = useState('')
  const [busy, setBusy] = useState(false)
  const token = user.entitlement?.token
  const paid = user.plan !== 'free' && !!token

  const restore = async () => {
    const key = pasted.trim()
    const claims = decodeToken(key)
    if (!claims) return toast('That does not look like a PrintxPDF access key', 'error')
    setBusy(true)
    try {
      const me = await billing.me(key)
      if (!me.active || me.plan === 'free') throw new ApiError(402, 'subscription_inactive', 'inactive')
      store.setEntitlement({ token: me.token || key, plan: me.plan as PaidPlan, email: claims.email, customerId: claims.sub, currentPeriodEnd: me.currentPeriodEnd || 0 })
      setPasted('')
      toast(`${planName(me.plan)} plan restored on this device`)
    } catch (e) {
      toast(describeError(e).message, 'error')
    } finally {
      setBusy(false)
    }
  }
  const rotate = async () => {
    if (!token || !user.entitlement || !confirm('Get a new key? The current one stops working everywhere, including any software you connected with it.')) return
    setBusy(true)
    try {
      const r = await billing.rotate(token)
      store.updateUser({ entitlement: { ...user.entitlement, token: r.token } })
      toast('New key ready')
    } catch (e) {
      toast(describeError(e).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="stack">
      <h2 style={{ fontSize: '2rem' }}>Access key</h2>
      {paid ? (
        <>
          <p className="muted">
            This key is your subscription. Paste it under Account, then Access key on another device to turn your plan on there.
            Developers also use it to connect their own software to the <Link to="/api">API</Link>. Treat it like a password.
          </p>
          <pre className="code" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{token}</pre>
          <div className="row">
            <button className="btn btn-sm btn-acid" onClick={() => navigator.clipboard.writeText(token!).then(() => toast('Copied'))}>
              Copy
            </button>
            <button className="btn btn-sm btn-alarm" disabled={busy} onClick={rotate}>
              Get a new key
            </button>
          </div>
        </>
      ) : (
        <p className="muted">
          Your access key appears here after you subscribe. <Link to="/pricing">See plans</Link>.
        </p>
      )}
      <h3 style={{ marginTop: '1.5rem' }}>Restore a plan on this device</h3>
      <p className="muted">Subscribed on another computer? Paste the access key from that device's account page.</p>
      <div className="row" style={{ gap: '0.5rem' }}>
        <input className="input mono" style={{ flex: 1 }} placeholder="pxp_…" value={pasted} onChange={(e) => setPasted(e.target.value)} />
        <button className="btn btn-acid" disabled={busy || !pasted.trim()} onClick={restore}>
          {busy ? 'Checking…' : 'Restore'}
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
          if (!confirm('Delete everything saved in this browser (account, documents, signatures)?')) return
          localStorage.clear()
          store.signOut()
          toast('Everything deleted')
        }}
      >
        Delete all my data
      </button>
    </div>
  )
}

function Billing() {
  const user = useUser()!
  const cfg = useSiteConfig()
  const token = user.entitlement?.token
  const { me, error } = useMe(token)
  const portal = usePortal()
  const paid = user.plan !== 'free' && !!token
  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: '2rem' }}>Subscription</h2>
      {paid ? (
        <>
          <div className="card">
            <div className="row" style={{ gap: '0.5rem' }}>
              <span className="badge badge-acid">{planName(user.plan)}</span>
              {me && <span className={`badge ${me.active ? '' : 'badge-alarm'}`}>{me.active ? (me.cancelAtPeriodEnd ? 'Cancels at period end' : 'Active') : 'Inactive'}</span>}
            </div>
            <p style={{ margin: '0.75rem 0 0' }}>
              {me?.currentPeriodEnd ? `${me.cancelAtPeriodEnd ? 'Access ends' : 'Next payment'} on ${fmtDate(me.currentPeriodEnd)}.` : error || 'Checking your subscription…'}
              {me && ` ${me.usage.used} of ${me.usage.limit} server conversions used this month.`}
            </p>
            {me && (
              <div className="progress" style={{ marginTop: '0.75rem' }}>
                <div style={{ width: `${Math.min(100, (me.usage.used / Math.max(1, me.usage.limit)) * 100)}%` }} />
              </div>
            )}
          </div>
          <div className="row">
            <button className="btn btn-acid" disabled={portal.busy} onClick={() => portal.open(token!)}>
              {portal.busy ? 'Opening…' : 'Manage subscription'}
            </button>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Manage subscription opens a secure billing page run by Stripe, our payment provider. There you can see invoices, change
            your card, switch plan or cancel. If you cancel, you keep access until the end of the period you paid for.{' '}
            <Link to="/terms#refunds">Refund policy</Link>.
          </p>
        </>
      ) : (
        <>
          <p className="muted">You are on the free plan: every browser tool, plus 5 server conversions a month.</p>
          <div className="row">
            <Link to="/pricing" className="btn btn-acid">
              See Pro and API plans
            </Link>
          </div>
        </>
      )}
      {cfg.billing.portalLoginUrl && (
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Lost the browser you subscribed in?{' '}
          <a href={cfg.billing.portalLoginUrl} target="_blank" rel="noopener">
            Manage your subscription by email
          </a>
          . Stripe sends a sign-in link to the address you paid with.
        </p>
      )}
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
      <h2 style={{ fontSize: '2rem' }}>My websites</h2>
      <p className="muted">Websites where you have added the <Link to="/website-button">print button</Link>. This list is saved in this browser only, as a reminder for you.</p>
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
          <span className="badge">Listed</span>
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
  const { toast } = useToast()
  const [params, setParams] = useSearchParams()
  const sessionId = params.get('session_id')
  const [activating, setActivating] = useState(!!sessionId)
  const [activationError, setActivationError] = useState<string | null>(null)
  useSeo({ title: 'Your account | PrintxPDF', description: 'Your PrintxPDF account: your plan, monthly usage, saved documents, signatures and settings, all kept in this browser and never sent anywhere.', path: '/account', noindex: true })

  // back from Stripe Checkout: turn the session into an entitlement, then drop the id from the URL
  useEffect(() => {
    if (!sessionId) return
    let alive = true
    billing
      .session(sessionId)
      .then((e) => {
        if (!alive) return
        store.setEntitlement(e)
        toast(`${planName(e.plan)} plan is now active. Thank you.`)
        setParams({}, { replace: true })
        setActivating(false)
      })
      .catch((err) => {
        if (!alive) return
        setActivationError(describeError(err).message)
        setActivating(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  if (activating) {
    return (
      <div className="container section center">
        <span className="badge badge-ink">Activating your plan…</span>
      </div>
    )
  }
  if (!user) {
    if (!activationError) return <Navigate to="/signin" replace />
    return (
      <div className="container section" style={{ maxWidth: 560 }}>
        <div className="card card-alarm">
          <strong className="alarm">Could not activate the plan.</strong> {activationError}{' '}
          <Link to="/pricing">Back to pricing</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="container section">
      {activationError && (
        <div className="card card-alarm" style={{ marginBottom: '1rem' }}>
          <strong className="alarm">Could not activate the plan.</strong> {activationError}
        </div>
      )}
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
