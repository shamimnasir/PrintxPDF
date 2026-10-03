import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'

export default function Contact() {
  const cfg = useSiteConfig()
  const email = cfg.site.email || 'support@printxpdf.com'
  useSeo({
    title: 'Contact PrintxPDF Support',
    description: 'Contact the PrintxPDF team for product questions, accessibility issues, privacy requests, technical support, or billing help. Email support directly.',
    path: '/contact',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }])],
  })

  return (
    <div className="container section" style={{ maxWidth: 780 }}>
      <span className="eyebrow">Contact</span>
      <h1>Talk to a person.</h1>
      <p className="lead">For product help, billing questions, accessibility feedback, or privacy requests, email us. Please do not attach sensitive documents; support does not need your files to investigate most issues.</p>
      <section className="card card-ink" aria-labelledby="contact-email">
        <h2 id="contact-email">Email PrintxPDF</h2>
        <p><a href={`mailto:${email}`} style={{ color: 'inherit', fontSize: '1.25rem', fontWeight: 700 }}>{email}</a></p>
        <p style={{ marginBottom: 0 }}>Include the page or tool, your browser and device, what you expected, and what happened instead. For a privacy request, say which data or request you mean, but do not include passwords or payment card details.</p>
      </section>
      <h2 style={{ marginTop: '2rem' }}>Useful pages</h2>
      <ul>
        <li><Link to="/support">Troubleshooting and common questions</Link></li>
        <li><Link to="/privacy">Privacy and cookies</Link></li>
        <li><Link to="/terms">Terms and refund policy</Link></li>
        <li><Link to="/about">About PrintxPDF</Link></li>
      </ul>
    </div>
  )
}
