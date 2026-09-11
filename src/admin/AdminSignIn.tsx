// Signing in to the server, which is a different thing from unlocking this panel.
//
// The passcode on the way in only hides the interface, because everything it edits is a draft in
// this browser. Publishing changes the repository and deploys the site, so it is gated on the
// Worker instead: a password it holds the hash of, and a session that expires the same day.
import { useEffect, useState, type FormEvent } from 'react'
import { useToast } from '../components/ui/Toast'
import { adminApi, describeAdminError, readSession } from './adminApi'
import { Card } from './fields'

export function AdminSignIn() {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(() => readSession())
  const [repo, setRepo] = useState<{ branch: string; headSha: string } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!session) return setRepo(null)
    adminApi
      .me()
      .then((r) => setRepo({ branch: r.branch, headSha: r.headSha }))
      .catch(() => {
        setSession(null)
        setRepo(null)
      })
  }, [session])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      setSession(await adminApi.login(password))
      setPassword('')
      toast('Signed in. You can publish for the next twelve hours.')
    } catch (err) {
      toast(describeAdminError(err), 'error')
    } finally {
      setBusy(false)
    }
  }

  if (session) {
    return (
      <Card title="Publishing" desc="Signed in to the server. Publishing commits to the repository and Vercel rebuilds from it.">
        <div className="row between" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="mono muted" style={{ fontSize: '0.75rem' }}>
            {repo ? (
              <>
                branch {repo.branch} at {repo.headSha.slice(0, 7)}
                <br />
              </>
            ) : null}
            session ends {new Date(session.expiresAt * 1000).toLocaleTimeString()}
          </div>
          <div className="row" style={{ gap: '0.5rem' }}>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                adminApi.signOut()
                setSession(null)
              }}
            >
              Sign out
            </button>
            <button
              className="btn btn-sm btn-ghost alarm"
              onClick={async () => {
                if (!confirm('Sign out everywhere? Every admin session ends immediately, including this one.')) return
                try {
                  await adminApi.signOutEverywhere()
                  adminApi.signOut()
                  setSession(null)
                  toast('Every session ended')
                } catch (err) {
                  toast(describeAdminError(err), 'error')
                }
              }}
            >
              Sign out everywhere
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Sign in to publish" desc="The passcode on the way in only hides this panel. Changing the live site needs the server password, which is checked against a hash the Worker holds.">
      <form className="row" style={{ gap: '0.5rem', flexWrap: 'nowrap', maxWidth: 460 }} onSubmit={submit}>
        <input className="input" type="password" autoComplete="current-password" placeholder="Server password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-acid" type="submit" disabled={busy || !password}>
          {busy ? '…' : 'Sign in'}
        </button>
      </form>
      <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.75rem', marginBottom: 0 }}>
        Not set up yet? Run <code className="inline">node scripts/admin-password.mjs</code> and follow what it prints.
      </p>
    </Card>
  )
}
