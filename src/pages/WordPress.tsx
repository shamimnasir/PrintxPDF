import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'

export default function WordPress() {
  useSeo({
    title: 'WordPress Print & PDF Button Plugin',
    description: 'Install the free PrintxPDF plugin from WordPress.org. Add Print, Save as PDF and Email buttons to posts and pages, with no plugin account or API key.',
    path: '/wordpress',
    keywords: ['wordpress print button', 'wordpress pdf plugin', 'print friendly wordpress'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'WordPress', path: '/wordpress' }])],
  })

  return (
    <>
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Free and open source · listed in the WordPress.org directory</span>
            <h1>
              A print button your readers will <span className="acid-mark">actually use.</span>
            </h1>
            <p className="lead">
              Drop a Print / PDF / Email button onto every post and page. Readers get a clean version of your content,
              you get fewer "can you send me a PDF" emails.
            </p>
            <div className="row">
              <a href="https://wordpress.org/plugins/printxpdf/" className="btn btn-acid btn-lg" target="_blank" rel="noopener noreferrer">
                Install from WordPress.org
              </a>
              <a href="/downloads/printxpdf-wordpress-plugin.zip" className="btn btn-lg" download>
                Download ZIP instead
              </a>
              <Link to="/website-button" className="btn btn-lg">
                Not on WordPress?
              </Link>
            </div>
            <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
              Find PrintxPDF in the official plugin directory, then choose Install Now and Activate. The ZIP is available
              as an alternative for manual installation.
            </p>
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
              ['Install and activate', 'In WordPress, search Plugins for PrintxPDF, then choose Install Now and Activate. To install from the ZIP instead, use Plugins, Add New, then Upload Plugin. Under Settings, then PrintxPDF, choose placement, buttons and post types.'],
              ['Respects your theme', 'Button placement: top, bottom, or both. Floating or inline. Custom text, icon and colours.'],
              ['Works everywhere', 'Posts, pages, WooCommerce products or any other kind of content you tick in the settings. Want a button in one exact spot? Paste the short tag we give you (a shortcode) into the post.'],
              ['Clean output', 'The optional Save as PDF link opens PrintxPDF, where readers can create a cleaner version of the public page.'],
              ['Reader controls', 'On PrintxPDF, readers can remove page elements and adjust the clean view before printing or saving.'],
              ['No background calls', 'The plugin makes no automatic network requests or tracking calls. If a reader clicks Save as PDF, their browser opens PrintxPDF with that page\'s public URL.'],
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
              <li>300 server conversions a month</li>
              <li>PowerPoint to PDF and back, EPUB and MOBI ebooks to PDF</li>
              <li>Scan to searchable text, up to 200 pages per file</li>
              <li>Priority email support</li>
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
