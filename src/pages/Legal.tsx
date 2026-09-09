import { breadcrumbSchema, useSeo } from '../lib/seo'

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  useSeo({
    title: kind === 'privacy' ? 'Privacy — Nothing Is Uploaded' : 'Terms of Use',
    description:
      kind === 'privacy'
        ? 'PrintxPDF has no server-side application and no upload endpoint. Files are processed in your browser and discarded when you close the tab. No cookies.'
        : 'Terms for using PrintxPDF: a free, as-is demonstration of browser-based printing and PDF tools. No payment is collected and no paid service is delivered.',
    path: kind === 'privacy' ? '/privacy' : '/terms',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: kind === 'privacy' ? 'Privacy' : 'Terms', path: kind === 'privacy' ? '/privacy' : '/terms' },
      ]),
    ],
  })

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">{kind === 'privacy' ? 'Privacy' : 'Terms'}</span>
      {kind === 'privacy' ? (
        <>
          <h1>We cannot see your files.</h1>
          <p className="lead">This site has no server-side application. There is nothing to store your documents in.</p>
          <h3>What stays on your device</h3>
          <p>Files you open are processed in your browser's memory and are discarded when you close the tab. Account data, saved documents, signatures and settings live in your browser's localStorage and never leave it.</p>
          <h3>What leaves your device</h3>
          <p>When you clean a web page by URL, the address is sent to a public reader proxy (or your own Worker, if configured) so the page can be fetched. Nothing else is transmitted. Fonts load from Google Fonts.</p>
          <h3>Cookies</h3>
          <p>None.</p>
        </>
      ) : (
        <>
          <h1>Terms, briefly.</h1>
          <p className="lead">PrintxPDF is provided as-is, free of charge, for demonstration purposes.</p>
          <h3>Use</h3>
          <p>Only clean, print or convert content you have the right to use. Respect the terms of the sites you fetch.</p>
          <h3>No warranty</h3>
          <p>Conversions are best-effort. Check the output before relying on it, especially for signed or legal documents.</p>
          <h3>Demo notice</h3>
          <p>Pricing, plans and the API on this site are illustrative. No payment is collected and no paid service is delivered.</p>
        </>
      )}
    </div>
  )
}
