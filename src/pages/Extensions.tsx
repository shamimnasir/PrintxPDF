import { Link, useParams } from 'react-router-dom'

const BROWSERS: Record<string, { name: string; note: string; steps: string[] }> = {
  chrome: { name: 'Chrome', note: 'Also works in Brave, Opera, Vivaldi and Arc.', steps: ['Open the Chrome Web Store listing', 'Click "Add to Chrome"', 'Pin the PrintxPDF button next to the address bar'] },
  firefox: { name: 'Firefox', note: 'Desktop and Android.', steps: ['Open the Firefox Add-ons listing', 'Click "Add to Firefox"', 'Allow it to run on all sites'] },
  safari: { name: 'Safari', note: 'macOS 13+ and iOS 16+.', steps: ['Install from the Mac App Store', 'Enable it in Safari → Settings → Extensions', 'Allow on all websites'] },
  edge: { name: 'Edge', note: 'Uses the Chrome package.', steps: ['Open the Edge Add-ons listing', 'Click "Get"', 'Pin the button'] },
}

export default function Extensions() {
  const { browser = 'chrome' } = useParams()
  const b = BROWSERS[browser] || BROWSERS.chrome

  return (
    <>
      <section className="section center">
        <div className="container">
          <span className="eyebrow">Browser extension · demo listing</span>
          <h1 style={{ maxWidth: '16ch', margin: '0 auto 1rem' }}>
            Turn any page into a <span className="acid-mark">clean PDF.</span>
          </h1>
          <p className="lead" style={{ margin: '0 auto 2rem' }}>
            Print, PDF or screenshot the page you are on. No ads, no sidebars, no clutter. One click.
          </p>
          <button className="btn btn-ink btn-lg" onClick={() => alert('Demo site: the extension is not published. The bookmarklet below does the same job today.')}>
            Add to {b.name}
          </button>
          <div className="row" style={{ justifyContent: 'center', marginTop: '1rem', gap: '0.5rem' }}>
            <span className="badge badge-acid">★ 4.8 · 12k reviews</span>
            <span className="badge">1,000,000+ users</span>
          </div>
          <p className="muted" style={{ marginTop: '1rem' }}>{b.note}</p>
          <div className="row" style={{ justifyContent: 'center', gap: '0.5rem' }}>
            {Object.entries(BROWSERS).map(([k, v]) => (
              <Link key={k} to={`/extensions/${k}`} className={`btn btn-sm ${k === browser ? 'btn-acid' : 'btn-ghost'}`}>
                {v.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container grid grid-2">
          <div className="card">
            <h3>Install in three steps</h3>
            <ol style={{ paddingLeft: '1.2rem', fontWeight: 600 }}>
              {b.steps.map((s) => (
                <li key={s} style={{ marginBottom: '0.5rem' }}>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="card card-ink">
            <h3 style={{ color: 'var(--acid-dim)' }}>Works today: the bookmarklet</h3>
            <p>Drag this to your bookmarks bar. Click it on any page and it opens the cleaner with that page's URL.</p>
            <a
              className="btn btn-acid"
              href={`javascript:(function(){window.open('${window.location.origin}${import.meta.env.BASE_URL}print?url='+encodeURIComponent(location.href))})()`}
              onClick={(e) => e.preventDefault()}
              draggable
            >
              ⚡ PrintxPDF this page
            </a>
            <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '1rem' }}>
              Or right-click → copy link, then add a bookmark and paste it as the address.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2>Built for the whole web</h2>
          <div className="grid grid-3">
            {[
              ['Articles & news', 'Long reads come out as clean text with the images you want and none of the ones you don\'t.'],
              ['Recipes', 'Skip the 2,000-word backstory. Delete it with one drag and print the ingredients and steps.'],
              ['Receipts & confirmations', 'Save order pages and tickets as tidy PDFs for your records.'],
              ['Research', 'Turn documentation and papers into readable, annotated PDFs with highlights and notes.'],
              ['Screenshots', 'Capture the cleaned page as a PNG for slides and messages.'],
              ['Email to self', 'One click opens a prefilled email with the cleaned text.'],
            ].map(([h, p]) => (
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
