import { useState } from 'react'
import { Link } from 'react-router-dom'
import { breadcrumbSchema, faqSchema, useSeo } from '../lib/seo'
import { useToast } from '../components/ui/Toast'
import { useUser } from '../features/account/useUser'
import { billing, describeError, type PaidPlan } from '../lib/api'

const FAQS = [
  {
    q: 'What is a server conversion?',
    a: 'Four formats need a real layout engine: PowerPoint to PDF, PDF to PowerPoint, EPUB to PDF and MOBI to PDF. For those, your file is sent over HTTPS to our converter, processed with LibreOffice or Calibre, returned to you and deleted immediately. Every other tool runs in your browser and never uploads anything.',
  },
  {
    q: 'Do I need an account to pay?',
    a: 'No. Checkout asks for your email. When you come back, the plan is activated in this browser and you get an access key that restores it on any other device.',
  },
  {
    q: 'How do I cancel?',
    a: 'Account → Subscription → Manage subscription opens the Stripe customer portal, where you can cancel, change plan or download invoices. Access continues until the end of the period you paid for.',
  },
  {
    q: 'Is there a refund?',
    a: 'Yes, on request within 14 days of your first charge. After that, cancel any time and you will not be charged again.',
  },
]

export default function Pricing() {
  const user = useUser()
  const { toast } = useToast()
  const [busy, setBusy] = useState<PaidPlan | null>(null)
  useSeo({
    title: 'Pricing — Free Browser Tools, Pro Server Conversions',
    description: 'Every browser PDF tool is free forever. Pro ($5/mo) adds 300 server conversions a month for PowerPoint and ebook formats; API ($29/mo) adds key-based access with 5,000 a month.',
    path: '/pricing',
    keywords: ['pdf tool pricing', 'free pdf tools', 'pptx to pdf api', 'epub to pdf api'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Pricing', path: '/pricing' }]), faqSchema(FAQS)],
  })

  const current = user?.plan || 'free'
  const buy = async (plan: PaidPlan) => {
    setBusy(plan)
    try {
      const { url } = await billing.checkout(plan, user?.email)
      window.location.assign(url)
    } catch (e) {
      toast(describeError(e).message, 'error')
      setBusy(null)
    }
  }
  const cta = (plan: PaidPlan, label: string, cls: string) =>
    current === plan ? (
      <Link to="/account/billing" className={`btn btn-block ${cls}`}>
        Current plan · manage
      </Link>
    ) : (
      <button className={`btn btn-block ${cls}`} disabled={busy !== null} onClick={() => buy(plan)}>
        {busy === plan ? 'Opening checkout…' : label}
      </button>
    )

  return (
    <div className="container section">
      <div className="center">
        <span className="eyebrow">Pricing</span>
        <h1>Free is free.</h1>
        <p className="lead" style={{ margin: '0 auto 3rem' }}>
          Every tool that runs in your browser costs nothing and always will. Paid plans cover the four conversions that need a
          real layout engine on our server, and the API.
        </p>
      </div>
      <div className="grid grid-3">
        <div className="card">
          <h3>Free</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>$0</div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>All browser PDF tools, unlimited</li>
            <li>Web-page cleaner and print button</li>
            <li>5 server conversions a month</li>
            <li>OCR up to 30 pages per file</li>
            <li>Saved documents and signatures</li>
          </ul>
          {current === 'free' ? (
            <span className="btn btn-block" aria-disabled>
              Current plan
            </span>
          ) : (
            <Link to="/account/billing" className="btn btn-block">
              Manage in your account
            </Link>
          )}
        </div>
        <div className="card card-ink" style={{ transform: 'translateY(-8px)' }}>
          <span className="badge badge-acid">Most popular</span>
          <h3 style={{ color: 'var(--acid-dim)', marginTop: '0.5rem' }}>Pro</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $5<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>Everything in Free</li>
            <li>300 server conversions a month</li>
            <li>PowerPoint ↔ PDF, EPUB and MOBI → PDF</li>
            <li>OCR up to 200 pages per file</li>
            <li>Priority email support</li>
          </ul>
          {cta('pro', 'Go Pro · $5/month', 'btn-acid')}
        </div>
        <div className="card">
          <h3>API</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $29<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>Everything in Pro</li>
            <li>5,000 conversions a month</li>
            <li>Access key for the HTTPS API</li>
            <li>Usage returned on every response</li>
            <li>
              <Link to="/api">Read the API docs</Link>
            </li>
          </ul>
          {cta('api', 'Get API access · $29/month', '')}
        </div>
      </div>
      <p className="muted center" style={{ marginTop: '2rem', fontSize: '0.85rem', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
        Payments are handled by Stripe; card details never touch this site. Plans renew monthly and can be cancelled any time
        from your account. Refund on request within 14 days of your first charge — see the <Link to="/terms#refunds">terms</Link>.
      </p>

      <h2 style={{ marginTop: '4rem' }}>Questions</h2>
      <div className="grid grid-2">
        {FAQS.map((f) => (
          <div key={f.q} className="card card-flat">
            <h4 style={{ margin: '0 0 0.5rem' }}>{f.q}</h4>
            <p style={{ margin: 0 }}>{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
