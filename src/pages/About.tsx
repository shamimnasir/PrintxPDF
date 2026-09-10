import { Link } from 'react-router-dom'
import { authorPath, breadcrumbSchema, orgSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'

export default function About() {
  const cfg = useSiteConfig()
  useSeo({
    title: 'About PrintxPDF | Documents You Control',
    description: `PrintxPDF is a print and PDF toolkit founded by ${cfg.author.name}. Browser tools keep files on your computer, and server jobs delete them right after.`,
    path: '/about',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]), { '@context': 'https://schema.org', ...orgSchema(cfg.author) }],
  })

  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">About</span>
      <h1>
        Your documents.
        <br />
        <span className="acid-mark">Your computer. Your call.</span>
      </h1>
      <p className="lead">
        PrintxPDF is a set of print and PDF tools that keep your files on your own computer. Everything that can happen in a
        browser does: the web-page cleaner and the merge, split, shrink, sign and scan-to-text tools all work without uploading
        anything. A few jobs that need heavier software (PowerPoint, ebooks, PDF passwords, PDF/A archive files) run on our own
        server, and say so on the tool page.
      </p>
      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>What it does</h2>
      <ul style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.8 }}>
        <li>Removes ads, navigation and other clutter from web pages before you print or save.</li>
        <li>Lets you preview and edit the page so you see exactly what you will print or save.</li>
        <li>Saves clean PDFs, image snapshots and emails.</li>
        <li>Merges, splits, organizes, rotates, shrinks, watermarks, numbers and signs PDFs, and turns scanned pages into searchable text, all in your browser.</li>
      </ul>
      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>Founder</h2>
      <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {cfg.author.photo && (
          <img src={cfg.author.photo} alt={cfg.author.name} width={96} height={96} style={{ objectFit: 'cover', flex: '0 0 auto' }} />
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          <strong style={{ fontSize: '1.15rem' }}>{cfg.author.name}</strong>
          <div className="muted">{cfg.author.title}</div>
          <p style={{ margin: '0.5rem 0 0.9rem' }}>{cfg.author.bio}</p>
          <Link to={authorPath(cfg.author)} className="btn btn-sm">
            Guides by {cfg.author.name.split(' ')[0]} →
          </Link>
        </div>
      </div>
      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>Built with open source tools</h2>
      <div className="grid grid-3">
        {[
          ['Reader mode', 'Finds the article on a page and drops the rest'],
          ['Page cleaning', 'Strips scripts and unsafe content from every page we show'],
          ['PDF editing', 'Builds and edits PDF files in your browser'],
          ['PDF viewing', 'Draws pages on screen and pulls out their text'],
          ['Text recognition', 'Turns pictures of text into real text, on your computer'],
          ['Page to PDF', 'Turns a web page into a PDF or an image'],
        ].map(([h, p]) => (
          <div key={h} className="card card-flat">
            <strong>{h}</strong>
            <div className="muted" style={{ fontSize: '0.85rem' }}>{p}</div>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: '3rem', fontSize: '0.85rem' }}>
        PrintxPDF is an independent project by {cfg.author.name} and is not affiliated with, endorsed by, or connected to any
        other print or PDF service. <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link>
      </p>
    </div>
  )
}
