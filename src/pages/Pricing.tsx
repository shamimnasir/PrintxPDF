import { useState } from 'react'
import { Link } from 'react-router-dom'
import { breadcrumbSchema, faqSchema, useSeo } from '../lib/seo'
import { useToast } from '../components/ui/Toast'
import { useUser } from '../features/account/useUser'
import { billing, describeError, type PaidPlan } from '../lib/api'

const FAQS = [
  {
    q: 'What is a server conversion?',
    a: 'Most tools work in your browser and never upload anything. A few jobs need software a browser does not have: PowerPoint to PDF, PDF to PowerPoint, EPUB and MOBI ebooks to PDF, adding or removing a password, and PDF/A (a format for long-term archiving). For those, your file goes to our server over a secure connection, gets converted, comes back to you and is deleted right away.',
  },
  {
    q: 'Do I need an account to pay?',
    a: 'No. Checkout only asks for your email. When you come back, the plan is switched on in this browser and you get an access key (a long code) that turns the plan on in any other browser or device.',
  },
  {
    q: 'How do I cancel?',
    a: 'Go to Account, then Subscription, then Manage subscription. That opens a secure billing page run by Stripe, our payment provider, where you can cancel, change plan or download invoices. You keep access until the end of the period you paid for.',
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
    title: 'Pricing | Free PDF Tools, Pro and API Plans',
    description: 'Every browser PDF tool is free forever. Pro is $3.99 a month for 300 server conversions, API $19.99 for 5,000, or pay $119 once for lifetime.',
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
          Every tool that works in your browser costs nothing and always will. Paid plans cover the handful of jobs that have
          to run on our server, and the plan for developers.
        </p>
      </div>
      <div className="grid grid-4">
        <div className="card">
          <h3>Free</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>$0</div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>All browser PDF tools, unlimited</li>
            <li>Web-page cleaner and print button</li>
            <li>5 server conversions a month</li>
            <li>Scan to searchable text, up to 30 pages per file</li>
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
            $3.99<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>Everything in Free</li>
            <li>300 server conversions a month</li>
            <li>PowerPoint to PDF and back, EPUB and MOBI ebooks to PDF</li>
            <li>Scan to searchable text, up to 200 pages per file</li>
            <li>Priority email support</li>
          </ul>
          {cta('pro', 'Go Pro · $3.99/month', 'btn-acid')}
        </div>
        <div className="card">
          <h3>API</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $19.99<span style={{ fontSize: '1rem' }}>/mo</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>Everything in Pro</li>
            <li>5,000 conversions a month</li>
            <li>Access key for developers to use from their own software</li>
            <li>Remaining allowance shown with every request</li>
            <li>
              <Link to="/api">Read the developer guide</Link>
            </li>
          </ul>
          {cta('api', 'Get API access · $19.99/month', '')}
        </div>
        <div className="card">
          <span className="badge">Pay once</span>
          <h3 style={{ marginTop: '0.5rem' }}>Lifetime</h3>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem' }}>
            $119<span style={{ fontSize: '1rem' }}> once</span>
          </div>
          <ul style={{ fontWeight: 600, paddingLeft: '1.2rem', minHeight: 190 }}>
            <li>Everything in Pro, for as long as PrintxPDF runs</li>
            <li>300 server conversions a month, every month</li>
            <li>One payment. No renewal, nothing to cancel</li>
            <li>Pays for itself in about two and a half years</li>
            <li>Full refund within 30 days</li>
          </ul>
          {cta('lifetime', 'Buy once · $119', '')}
        </div>
      </div>
      <div className="card card-flat" style={{ marginTop: '2.5rem', maxWidth: 820, marginLeft: 'auto', marginRight: 'auto' }}>
        <span className="label">How we bill</span>
        <ul style={{ fontWeight: 600, lineHeight: 1.9, margin: '0.6rem 0 0', paddingLeft: '1.2rem' }}>
          <li>No card and no account to use the free tools. Ever.</li>
          <li>No trial, so there is nothing that quietly turns into a charge.</li>
          <li>Cancel yourself in one click. No email to send, nobody talking you out of it.</li>
          <li>Full refund inside 14 days of a first charge, 30 days on Lifetime. We keep no fee.</li>
          <li>Your renewal date and the exact amount sit on your account page before it charges.</li>
        </ul>
        <p className="muted" style={{ margin: '0.9rem 0 0', fontSize: '0.85rem' }}>
          Payments run through Stripe, our payment provider, so your card details never touch this site. Monthly plans renew
          monthly and can be stopped any time. See the <Link to="/terms#refunds">terms</Link>.
        </p>
      </div>

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
