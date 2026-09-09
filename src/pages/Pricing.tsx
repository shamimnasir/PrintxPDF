import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useToast } from '../components/ui/Toast'
import { store } from '../lib/store'
import { useUser } from '../features/account/useUser'

export default function Pricing() {
  useSeo({
    title: 'Pricing — Every Browser Tool Is Free',
    description: 'Every PDF tool and the web-page cleaner are free forever, because they run in your browser. Pro and API tiers cover the WordPress plugin and server-side jobs.',
    path: '/pricing',
    keywords: ['free pdf tools', 'pdf tool pricing'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }])],
  })

  const user = useUser()
  const { toast } = useToast()
  const pick = (plan: 'free' | 'pro') => {
    if (!user) return toast('Sign up first, it takes one field', 'error')
    store.updateUser({ plan })
    toast(plan === 'pro' ? 'Pro enabled (demo, nothing charged)' : 'Back on Free')
  }
  return (
    <div className="container section">
      <div className="center">
        <span className="eyebrow">Pricing · demo</span>
        <h1>Free is free.</h1>
        <p className="lead" style={{ margin: '0 auto 3rem' }}>Every browser tool on this site costs nothing and never will. Pro exists for the WordPress plugin, the API and people who want to say thanks.</p>
      </div>
      <div className="grid grid-3">
        <div className="card">
          <h3>Free</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>$0</div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 160 }}>
            <li>All browser PDF tools</li>
            <li>Web-page cleaner</li>
            <li>Saved documents and signatures</li>
            <li>Bookmarklet and extension</li>
          </ul>
          <button className="btn btn-block" onClick={() => pick('free')}>
            {user?.plan === 'free' ? 'Current plan' : 'Choose Free'}
          </button>
        </div>
        <div className="card card-ink" style={{ transform: 'translateY(-8px)' }}>
          <span className="badge badge-acid">Most popular</span>
          <h3 style={{ color: 'var(--acid-dim)', marginTop: '0.5rem' }}>Pro</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $5<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 160 }}>
            <li>Everything in Free</li>
            <li>WordPress Pro plugin</li>
            <li>Remove branding from printed pages</li>
            <li>Print analytics</li>
            <li>Priority support</li>
          </ul>
          <button className="btn btn-acid btn-block" onClick={() => pick('pro')}>
            {user?.plan === 'pro' ? 'Current plan' : 'Go Pro (demo)'}
          </button>
        </div>
        <div className="card">
          <h3>API</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $29<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 160 }}>
            <li>5,000 PDFs / month</li>
            <li>URL → PDF and HTML → PDF</li>
            <li>Server-side conversions</li>
            <li>99.9% uptime SLA</li>
          </ul>
          <Link to="/api" className="btn btn-block">
            Read the spec
          </Link>
        </div>
      </div>
      <p className="muted center" style={{ marginTop: '2rem', fontSize: '0.85rem' }}>
        No payment is collected anywhere on this demo. Plan changes only flip a flag in your browser's localStorage.
      </p>
    </div>
  )
}
