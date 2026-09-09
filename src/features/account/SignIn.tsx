import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { store } from '../../lib/store'
import { useToast } from '../../components/ui/Toast'
import { useSeo } from '../../lib/seo'

export default function SignIn({ mode }: { mode: 'in' | 'up' }) {
  const nav = useNavigate()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  useSeo({ title: mode === 'up' ? 'Sign up, PrintxPDF' : 'Log in, PrintxPDF', description: 'A local account kept in this browser: saved documents, signatures, settings and your access key.', path: mode === 'up' ? '/signup' : '/signin', noindex: true })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Enter a valid email', 'error')
    store.signIn(email.trim().toLowerCase(), name.trim())
    toast(mode === 'up' ? 'Account created' : 'Welcome back')
    nav('/account')
  }

  return (
    <div className="container section" style={{ maxWidth: 520 }}>
      <span className="eyebrow">Account · stored in this browser</span>
      <h1>{mode === 'up' ? 'Sign up' : 'Log in'}</h1>
      <p className="muted">No password and no email is sent. Your account lives in this browser: it keeps saved documents, signatures and settings together, and holds your access key once you subscribe. Subscribed on another device? Sign in, then paste the key under Account → Access key.</p>
      <form className="card stack" onSubmit={submit}>
        {mode === 'up' && (
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada" />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <button className="btn btn-acid btn-lg btn-block" type="submit">
          {mode === 'up' ? 'Create account' : 'Log in'}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          {mode === 'up' ? (
            <>
              Already have one? <Link to="/signin">Log in</Link>
            </>
          ) : (
            <>
              New here? <Link to="/signup">Sign up</Link>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
