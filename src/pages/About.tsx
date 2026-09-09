import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'

export default function About() {
  useSeo({
    title: 'About PrintxPDF — Print Less Junk',
    description: 'PrintxPDF is a browser-only print and PDF toolkit. No upload endpoint exists, so your files never leave your computer. Built with Readability, pdf-lib, pdf.js and Tesseract.',
    path: '/about',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])],
  })

  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">About</span>
      <h1>
        Print less junk.
        <br />
        <span className="acid-mark">More of what matters.</span>
      </h1>
      <p className="lead">
        PrintxPDF is a demo of what a modern print-and-PDF toolkit looks like when you refuse to run a server. Every tool on
        this site is static HTML, CSS and JavaScript. It deploys to Vercel, Cloudflare Pages or GitHub Pages as-is.
      </p>
      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>What it does</h2>
      <ul style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.8 }}>
        <li>Removes ads, navigation and other clutter from web pages before you print or save.</li>
        <li>Lets you preview and edit the page so you see exactly what you are outputting.</li>
        <li>Exports clean PDFs, PNG screenshots and emails.</li>
        <li>Merges, splits, organizes, rotates, compresses, watermarks, numbers, signs and OCRs PDFs in the browser.</li>
      </ul>
      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>Built with</h2>
      <div className="grid grid-3">
        {[
          ['Readability', 'Mozilla\'s reader-mode extractor'],
          ['DOMPurify', 'Sanitises every page we render'],
          ['pdf-lib', 'Creates and edits PDF structure'],
          ['pdf.js', 'Renders pages and extracts text'],
          ['Tesseract.js', 'OCR compiled to WebAssembly'],
          ['jsPDF + html2canvas', 'HTML → PDF and screenshots'],
        ].map(([h, p]) => (
          <div key={h} className="card card-flat">
            <strong>{h}</strong>
            <div className="muted" style={{ fontSize: '0.85rem' }}>{p}</div>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: '3rem', fontSize: '0.85rem' }}>
        This is an independent demo project and is not affiliated with, endorsed by, or connected to any other print or PDF
        service. <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link>
      </p>
    </div>
  )
}
