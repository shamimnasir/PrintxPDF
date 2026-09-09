import { Navigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo, SITE_URL } from '../lib/seo'

// React refuses javascript: URLs in JSX, so the bookmarklet link gets its href through a ref
const BOOKMARKLET = `javascript:(function(){window.open('${SITE_URL}${import.meta.env.BASE_URL}print?url='+encodeURIComponent(location.href))})()`

const EXTENSION_ZIP = '/downloads/printxpdf-chrome-extension.zip'

const STEPS = [
  ['Download the extension', 'A small ZIP, about 20 KB. Unzip it anywhere you will not delete by accident.'],
  ['Open chrome://extensions', 'Paste that into the address bar and turn on "Developer mode" in the top right.'],
  ['Load unpacked', 'Click "Load unpacked" and pick the folder you just unzipped. Pin PrintxPDF to your toolbar.'],
]

const USES: [string, string][] = [
  ['Articles and news', 'Long reads come out as clean text with the images you want and none of the ones you do not.'],
  ['Recipes', 'Skip the backstory. Drag over it to delete, then print the ingredients and the steps.'],
  ['Receipts and confirmations', 'Save order pages and tickets as tidy PDFs for your records.'],
  ['Research', 'Turn documentation and papers into readable PDFs with highlights and notes.'],
  ['Screenshots', 'Capture the cleaned page as a PNG for slides and messages.'],
  ['Email to self', 'One click opens a prefilled email containing the cleaned text.'],
]

export default function Extensions() {
  const { browser } = useParams()
  useSeo({
    title: 'PrintxPDF for Chrome | Print Any Page Clean',
    description: 'A Chrome extension that opens the page you are on in the PrintxPDF cleaner: ads, menus and comment walls stripped, ready to print or save as PDF. Free, and it reads nothing until you click it.',
    path: '/extensions/chrome',
    keywords: ['chrome print extension', 'print friendly chrome extension', 'save webpage as pdf chrome', 'print without ads'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Chrome extension', path: '/extensions/chrome' }])],
  })

  // one extension, one page: /extensions and /extensions/anything land here
  if (browser && browser !== 'chrome') return <Navigate to="/extensions/chrome" replace />

  return (
    <>
      <section className="section center">
        <div className="container">
          <span className="eyebrow">Chrome extension · load unpacked</span>
          <h1 style={{ maxWidth: '18ch', margin: '0 auto 1rem' }}>
            Turn any page into a <span className="acid-mark">clean PDF.</span>
          </h1>
          <p className="lead" style={{ margin: '0 auto 2rem', maxWidth: '58ch' }}>
            Click the toolbar button and the page you are on opens in the PrintxPDF cleaner, ready to print, save as PDF or
            email. Also works in Brave, Edge, Opera, Vivaldi and Arc, which all run Chrome extensions.
          </p>
          <div className="row" style={{ justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a className="btn btn-acid btn-lg" href={EXTENSION_ZIP} download>
              Download for Chrome
            </a>
            <Link to="/print" className="btn btn-lg">
              Or just paste a URL
            </Link>
          </div>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Not in the Chrome Web Store yet, so it installs in developer mode for now. The three steps are below.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2">
          <div className="card">
            <h3>Install it in three steps</h3>
            <ol style={{ paddingLeft: '1.2rem', fontWeight: 600 }}>
              {STEPS.map(([h, p]) => (
                <li key={h} style={{ marginBottom: '0.75rem' }}>
                  {h}
                  <div className="muted" style={{ fontWeight: 500 }}>{p}</div>
                </li>
              ))}
            </ol>
          </div>
          <div className="card card-ink">
            <h3 style={{ color: 'var(--acid-dim)' }}>No install? Use the bookmarklet</h3>
            <p>Drag this to your bookmarks bar. Click it on any page and the cleaner opens with that page loaded.</p>
            <a
              className="btn btn-acid"
              href="#bookmarklet"
              ref={(el) => el?.setAttribute('href', BOOKMARKLET)}
              onClick={(e) => e.preventDefault()}
              draggable
            >
              PrintxPDF this page
            </a>
            <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '1rem' }}>
              Works in every browser, including Firefox and Safari. Right-click → copy link, then add a bookmark and paste it
              as the address.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>What it asks for</h2>
          <div className="grid grid-3">
            {[
              ['activeTab', 'The address of the tab you are on, and only at the moment you click the button. It cannot read pages in the background.'],
              ['contextMenus', 'The right-click entries: clean this page, clean this link, print just this selection.'],
              ['storage', 'One preference: whether to open the cleaner in a new tab. Nothing else is stored.'],
            ].map(([h, p]) => (
              <div key={h} className="card card-flat">
                <h4 className="mono">{h}</h4>
                <p className="muted" style={{ margin: 0 }}>{p}</p>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: '1rem' }}>
            It deliberately does not request access to all sites, sends nothing anywhere and contains no analytics. The
            cleaning happens on printxpdf.com in your own browser.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Built for the whole web</h2>
          <div className="grid grid-3">
            {USES.map(([h, p]) => (
              <div key={h} className="card card-flat">
                <h4>{h}</h4>
                <p className="muted" style={{ margin: 0 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
