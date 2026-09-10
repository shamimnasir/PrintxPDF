import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'

/**
 * Public privacy policy for the Chrome extension. The Web Store listing links here, so this
 * must state exactly what extension/ does, keep it in step with extension/PRIVACY.md.
 */
export default function ExtensionPrivacy() {
  useSeo({
    title: 'Chrome Extension Privacy Policy',
    description: 'The PrintxPDF Chrome extension collects nothing and sends nothing. It reads the address of the tab you click on and stores one preference on your machine.',
    path: '/extension-privacy',
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Chrome extension', path: '/extensions/chrome' }, { name: 'Privacy', path: '/extension-privacy' }])],
  })
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">Chrome extension · privacy policy</span>
      <h1>It collects nothing. It sends nothing.</h1>
      <p className="lead">
        The PrintxPDF extension has no server of its own, no account, no analytics, no tracking, no advertising and no third
        party of any kind. This page says precisely what it does with your data, which is very little.
      </p>
      <p className="muted" style={{ fontSize: '0.85rem' }}>Last updated 10 September 2026. Applies to version 1.0.0 and later.</p>

      <h3>What it stores</h3>
      <p>Two values, both on your own machine, both created only by your own actions, both deleted when you uninstall:</p>
      <div className="table-scroll">
        <table className="table" style={{ fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th>Key</th>
              <th>Where</th>
              <th>What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="mono">openInNewTab</td>
              <td>chrome.storage.sync</td>
              <td>The "Open in a new tab" checkbox, so the preference follows your Chrome profile.</td>
            </tr>
            <tr>
              <td className="mono">lastSelection</td>
              <td>chrome.storage.local</td>
              <td>A timestamp and a "was the copy blocked?" flag from the last time you used "Print just this selection", so the popup can remind you to paste. It never contains the selected text.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Neither value is transmitted anywhere. Chrome's sync storage is synchronised between your own Chrome profiles by Google,
        under Google's own terms; we cannot read it.
      </p>

      <h3>What it reads</h3>
      <p>
        <strong>The address of the tab you are on</strong>, and only when you ask, by clicking the toolbar icon, choosing a
        PrintxPDF right-click item or pressing the keyboard shortcut. That is what Chrome's <code className="inline">activeTab</code>{' '}
        permission means: access to one tab, granted by your gesture, gone when you navigate away. The extension holds no
        standing permission for any website, which is why Chrome never asks you to let it read and change your data on all
        websites.
      </p>
      <p>
        <strong>The text you selected</strong>, only for the "Print just this selection" item, and only on the page where you
        selected it. The selection is turned into HTML and placed on your system clipboard so you can paste it into the cleaner.
        It goes to your clipboard and nowhere else. This is the reason for the <code className="inline">clipboardWrite</code>{' '}
        permission.
      </p>
      <p>
        It does not read your browsing history, bookmarks, passwords, cookies, form input, location or identity, and it contains
        no code capable of doing so.
      </p>

      <h3>What it sends</h3>
      <p>
        Nothing. The extension makes no network requests. It contains no analytics, no trackers, no remote code, no third-party
        libraries and no code fetched at runtime; every line that runs is in the package you installed.
      </p>
      <p>
        When you press a button it opens an ordinary browser tab at <code className="inline">printxpdf.com/print?url=…</code>, a
        page visit you can see in the address bar and cancel like any other. That page cleans the article inside your browser;
        no document is uploaded, and the site's own <Link to="/privacy">privacy policy</Link> governs the visit.
      </p>

      <h3>Sale and sharing of data</h3>
      <p>
        We do not collect user data, so there is nothing to sell, share, transfer or disclose. We do not sell or transfer user
        data to third parties, do not use or transfer it for purposes unrelated to the extension's single purpose, and do not
        use or transfer it to determine creditworthiness or for lending. The extension meets the Chrome Web Store's Limited Use
        requirements by holding no user data at all.
      </p>

      <h3>Children</h3>
      <p>It is a printing tool for general audiences and collects no data from anyone, children included.</p>

      <h3>Removing your data</h3>
      <p>
        Uninstalling the extension deletes both stored values. You can remove it from{' '}
        <code className="inline">chrome://extensions</code>, or untick the checkbox in the popup to reset the preference.
      </p>

      <h3>Changes and contact</h3>
      <p>
        If the extension's data practices ever change, this page is updated before the change ships and the store listing's
        disclosures are updated in the same release. Questions: the contact on the <Link to="/about">About</Link> page.
      </p>
    </div>
  )
}
