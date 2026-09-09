import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'

/** Public privacy policy for the Chrome extension — the Web Store listing links here. */
export default function ExtensionPrivacy() {
  useSeo({
    title: 'Chrome Extension Privacy Policy',
    description: 'What the PrintxPDF Chrome extension can see and store: the address of the tab you click on, one preference, and nothing else. It sends no data anywhere.',
    path: '/extension-privacy',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Chrome extension', path: '/extensions/chrome' }, { name: 'Privacy', path: '/extension-privacy' }])],
  })
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Chrome extension · privacy</span>
      <h1>It reads one address, when you ask.</h1>
      <p className="lead">The PrintxPDF extension exists to open the page you are on in the PrintxPDF cleaner. That is all it does, and this page says exactly what that involves.</p>

      <h3>What it accesses</h3>
      <p>
        When you click the toolbar button, press the keyboard shortcut or choose one of its right-click entries, the extension reads the
        address of the tab you are on (or of the link you right-clicked) and opens it in a new tab at printxpdf.com. It uses Chrome's
        <code className="inline"> activeTab</code> permission, which grants that access only for that click and only for that tab; it cannot
        read pages in the background and it does not ask for access to all websites.
      </p>
      <p>
        If you choose "Print just this selection", the extension copies the text you selected to your clipboard, inside the page, so you can
        paste it into the cleaner. The selection is not sent anywhere and is not stored.
      </p>

      <h3>What it stores</h3>
      <p>
        One preference: whether to open the cleaner in a new tab. It is kept in Chrome's extension storage on your own device and, if you
        are signed in to Chrome, synced by Chrome with your other devices. Nothing else is stored.
      </p>

      <h3>What it sends</h3>
      <p>
        Nothing. The extension makes no network requests of its own, contains no analytics, no advertising, and no remote code. Opening a
        printxpdf.com page is an ordinary navigation by your browser, covered by the site's own <Link to="/privacy">privacy policy</Link>.
      </p>

      <h3>Data sold or shared</h3>
      <p>None. There is nothing to sell, share or transfer.</p>

      <h3>Changes and contact</h3>
      <p>
        If a future version needs anything more than this, the permission request in Chrome will say so and this page will be updated first.
        Questions: see the <Link to="/about">About</Link> page.
      </p>
      <p className="muted" style={{ fontSize: '0.85rem' }}>Effective 10 September 2026. Applies to version 1.0.0 and later.</p>
    </div>
  )
}
