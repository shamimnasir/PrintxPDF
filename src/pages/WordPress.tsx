import { Link } from 'react-router-dom'

export default function WordPress() {
  return (
    <>
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="eyebrow">WordPress plugin · demo listing</span>
            <h1>
              A print button your readers will <span className="acid-mark">actually use.</span>
            </h1>
            <p className="lead">
              Drop a Print / PDF / Email button onto every post and page. Readers get a clean version of your content,
              you get fewer "can you send me a PDF" emails.
            </p>
            <div className="row">
              <button className="btn btn-ink btn-lg" onClick={() => alert('Demo site: install from the WordPress admin → Plugins → Add New in a real deployment.')}>
                Install free plugin
              </button>
              <Link to="/website-button" className="btn btn-lg">
                Not on WordPress?
              </Link>
            </div>
          </div>
          <div className="card card-flat" style={{ background: 'var(--card)' }}>
            <div style={{ borderBottom: '2px solid var(--line)', paddingBottom: '0.5rem', marginBottom: '1rem', fontFamily: 'Georgia, serif' }}>
              <strong style={{ fontSize: '1.4rem' }}>Ten things to do in Lisbon in October</strong>
              <div className="muted" style={{ fontSize: '0.8rem' }}>Posted in Travel · 6 min read</div>
            </div>
            <p style={{ fontFamily: 'Georgia, serif' }}>The city empties out, the light turns gold, and the pastel de nata queue finally shortens…</p>
            <div className="row" style={{ gap: '0.5rem' }}>
              <span className="btn btn-sm btn-acid">⎙ Print</span>
              <span className="btn btn-sm">⤓ PDF</span>
              <span className="btn btn-sm">✉ Email</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>What the plugin does</h2>
          <div className="grid grid-3">
            {[
              ['One-click install', 'Search "PrintxPDF" in Plugins → Add New. No API key needed for the free tier.'],
              ['Respects your theme', 'Button placement: top, bottom, or both. Floating or inline. Custom text, icon and colours.'],
              ['Works everywhere', 'Standard posts, custom post types, WooCommerce products, Elementor and Gutenberg blocks.'],
              ['Clean output', 'Uses the same content extraction as this site: ads, widgets, share bars and comments removed.'],
              ['Reader controls', 'Readers can delete paragraphs, resize text and drop images before they print.'],
              ['Analytics (Pro)', 'See which posts get printed, saved and emailed the most.'],
            ].map(([h, p]) => (
              <div key={h} className="card">
                <h4>{h}</h4>
                <p className="muted" style={{ margin: 0 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2">
          <div className="card">
            <h3>Free</h3>
            <ul style={{ fontWeight: 600, paddingLeft: '1.2rem' }}>
              <li>Print, PDF and Email buttons</li>
              <li>Basic placement and styling</li>
              <li>Community support</li>
            </ul>
            <span className="badge badge-acid">$0 forever</span>
          </div>
          <div className="card card-ink">
            <h3 style={{ color: 'var(--acid-dim)' }}>Pro</h3>
            <ul style={{ fontWeight: 600, paddingLeft: '1.2rem' }}>
              <li>Custom CSS for the printed page</li>
              <li>Remove PrintxPDF branding</li>
              <li>Print analytics</li>
              <li>Priority support</li>
            </ul>
            <Link to="/pricing" className="btn btn-acid btn-sm">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
