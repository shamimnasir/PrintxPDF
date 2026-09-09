import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'

export default function WordPress() {
  useSeo({
    title: 'WordPress Print & PDF Button Plugin',
    description: 'Free plugin that adds Print, PDF and Email buttons to every WordPress post or page: any public post type, shortcode or block editor, no account, no API key.',
    path: '/wordpress',
    keywords: ['wordpress print button', 'wordpress pdf plugin', 'print friendly wordpress'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'WordPress', path: '/wordpress' }])],
  })

  return (
    <>
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="eyebrow">WordPress plugin · free, GPL, 15 KB</span>
            <h1>
              A print button your readers will <span className="acid-mark">actually use.</span>
            </h1>
            <p className="lead">
              Drop a Print / PDF / Email button onto every post and page. Readers get a clean version of your content,
              you get fewer "can you send me a PDF" emails.
            </p>
            <div className="row">
              <a href="/downloads/printxpdf-wordpress-plugin.zip" className="btn btn-acid btn-lg" download>
                Download the plugin
              </a>
              <Link to="/website-button" className="btn btn-lg">
                Not on WordPress?
              </Link>
            </div>
            <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
              One file, no dependencies, no account and no API key. Upload it under Plugins → Add New → Upload Plugin. It is
              not in the WordPress.org directory yet, so this download is the way to get it.
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
              ['Upload and activate', 'Plugins → Add New → Upload Plugin, pick the ZIP, activate. Settings → PrintxPDF sets placement, which buttons show and which post types get them.'],
              ['Respects your theme', 'Button placement: top, bottom, or both. Floating or inline. Custom text, icon and colours.'],
              ['Works everywhere', 'Any public post type you tick in the settings, posts, pages, custom types, WooCommerce products. In the block editor, drop it in with the Shortcode block.'],
              ['Clean output', 'Uses the same content extraction as this site: ads, widgets, share bars and comments removed.'],
              ['Reader controls', 'Readers can delete paragraphs, resize text and drop images before they print.'],
              ['Nothing phones home', 'No API key, no account, no tracking, and the plugin makes no outbound requests at all. Print runs in the reader\'s browser.'],
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
              <li>PowerPoint ↔ PDF, EPUB and MOBI → PDF</li>
              <li>OCR up to 200 pages per file</li>
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
