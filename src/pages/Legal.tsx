import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const cfg = useSiteConfig()
  const contact = cfg.site.email ? <a href={`mailto:${cfg.site.email}`}>{cfg.site.email}</a> : <Link to="/account">your account page</Link>
  useSeo({
    title: kind === 'privacy' ? 'Privacy and Cookie Policy | PrintxPDF' : 'Terms of Use',
    description:
      kind === 'privacy'
        ? 'Learn what PrintxPDF collects, how Google Analytics and cookies work, when files are processed locally or by our server, and how to contact us about privacy.'
        : 'Terms for using PrintxPDF: free browser tools, a monthly allowance of server conversions, and Pro and API plans billed by Stripe with a 14-day refund.',
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
          <h1>Privacy and cookies.</h1>
          <p className="lead">
            This policy explains what PrintxPDF collects, what happens to files, and how analytics and third-party services work. Most PDF tools process documents in your browser. A clearly labelled set of conversions runs on our server; those files are deleted when processing finishes.
          </p>
          <p><strong>Last updated: October 3, 2026.</strong> This policy applies to printxpdf.com. The Chrome extension has a separate <Link to="/extension-privacy">extension privacy policy</Link>.</p>
          <h3>Information and analytics</h3>
          <p>
            We use Google Analytics 4 to understand visits and improve the site. When it is enabled and your browser does not send Do Not Track, Google may receive page addresses, interactions, browser and device information, and online identifiers such as cookie or similar storage identifiers. Analytics does not receive the documents processed by the tools. See <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">how Google uses information from partner sites</a> and Google's <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>. The browser's Do Not Track signal prevents our analytics scripts from loading; it is not a general cookie-control mechanism.
          </p>
          <p>Some basic preferences and locally saved work may be stored in your browser. They are not automatically sent to us. If you clear browser storage, local settings and saved items may be lost.</p>
          <h3>What stays on your computer</h3>
          <p>
            Tools labelled as local, including merging, splitting, compressing, signing, OCR and the web-page cleaner,
            process your files in the browser's memory; the files are discarded when you close the tab. Account data,
            saved documents, signatures, settings and your access key are saved in this browser only and are never sent to us.
          </p>
          <h3>What leaves your computer</h3>
          <p>
            <strong>Web-page cleaning by URL.</strong> The address you paste goes to our own fetch service so the page can be
            retrieved; only the address is sent, and the cleaning itself happens in your browser. The fetched page may sit in
            Cloudflare's cache for five minutes so a second person asking for the same page gets it faster. If our service
            cannot reach the page, and only then, the address is passed to public reader services (AllOrigins, CodeTabs,
            Jina Reader) run by other companies under their own privacy policies. Nothing else about you is sent either way.
          </p>
          <p>
            <strong>Server jobs.</strong> PowerPoint to PDF, PDF to PowerPoint, EPUB to PDF, MOBI to PDF, Ebook Converter, Protect PDF, Unlock PDF and PDF/A conversion upload the file
            over a secure connection to our converter, which runs in a sealed-off workspace on Cloudflare. The file is held in memory and
            temporary disk for the length of the job (at most two minutes), then deleted. We do not keep copies, and we do not
            log file contents. Free-tier usage is counted per calendar month against a salted hash of your IP address, kept for
            40 days; paid usage is counted against your subscription.
          </p>
          <p>
            <strong>Payments.</strong> Checkout and the customer portal are hosted by Stripe. We never see your card number.
            Stripe gives us a customer ID, which is stored inside your access key in this browser and used to check that your
            subscription is active.
          </p>
          <h3>Cookies and advertising</h3>
          <p>
            The PDF and web-page tools do not use cookies to process your files. Google Analytics uses cookies or similar technologies to measure visits. The site also includes the Google AdSense publisher tag; when Google serves ads here, Google and its partners may use cookies, web beacons, IP addresses and other identifiers to select or measure ads, including based on visits to this and other sites. Stripe uses its own technologies on hosted checkout and customer portal pages. Read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">how Google uses information from partner sites</a> and manage advertising personalization in <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ads Settings</a>.
          </p>
          <p>You can block or clear cookies in your browser; the local PDF tools do not depend on them. Sending Do Not Track prevents our Analytics scripts from loading, but it is not a general cookie-control mechanism. For information about a privacy request, contact us at {contact}.</p>
          <h3>Third-party services</h3>
          <p>Payments are hosted by Stripe. When a browser-based page fetch cannot reach a website through our own service, the address may be sent to the fallback reader providers named above. These services have their own privacy terms. We do not sell document contents.</p>
          <h3>Your choices and privacy requests</h3>
          <p>You can disable cookies in your browser, send Do Not Track to suppress our analytics scripts, or write to us to ask a question about personal information associated with your visit. We may need enough information to understand and verify a request. See our <Link to="/contact">Contact page</Link> for the direct email address.</p>
          <h3>Who holds what</h3>
          <p>
            {cfg.site.name} is operated by {cfg.site.company}. The little we hold is described above; payment records sit
            with Stripe, our payment provider, under their own privacy policy, and {cfg.site.company} is the name that
            appears on your card statement.
          </p>
          <p>Questions about your data: {contact} or visit <Link to="/contact">Contact</Link>.</p>
        </>
      ) : (
        <>
          <h1>Terms, briefly.</h1>
          <p className="lead">
            {cfg.site.name} is provided as-is. Browser tools are free. Server conversions (the few jobs that run on our
            server) come with a free monthly allowance, and paid plans for more.
          </p>
          <h3>Who you are dealing with</h3>
          <p>
            {cfg.site.name} is operated by {cfg.site.company}, a sister concern. That is the name on your card statement and
            on the payment page, so if you see {cfg.site.company} on a receipt, it is us. Write to {contact} about anything,
            including billing.
          </p>
          <h3>Use</h3>
          <p>
            Only clean, print or convert content you have the right to use. Respect the terms of the sites you fetch. Do not
            use the converter to circumvent DRM, and do not attack or overload the service; we may suspend keys that do.
          </p>
          <h3>No warranty</h3>
          <p>
            Conversions are best-effort. Check the output before relying on it, especially for signed or legal documents. Our
            liability is limited to the amount you paid us in the month the problem occurred.
          </p>
          <h3 id="billing">Billing</h3>
          <p>
            Pro ($3.99 per month) and API ($19.99 per month) are billed monthly by Stripe and renew automatically until
            cancelled. Cancel any time from Account → Subscription; access continues to the end of the period you have paid
            for, and you are not charged again. There is no trial, so nothing converts into a charge on its own, and there is
            no cancellation or early termination fee. Prices exclude any VAT or sales tax Stripe is required to add for your
            location.
          </p>
          <p>
            <strong>Lifetime ($119, paid once).</strong> One payment, no renewal and nothing to cancel. It carries the Pro
            allowance of 300 server conversions a month, and the browser tools that are free for everyone. "Lifetime" means
            the working life of the service, not your own: if PrintxPDF ever shuts down we will say so at least 90 days
            beforehand on this site and by email, and the browser tools will be released so they keep working without us. It
            covers one person, and is not transferable.
          </p>
          <h3 id="refunds">Refunds</h3>
          <p>
            If a monthly plan is not what you expected, ask within 14 days of your first charge and we refund it in full,
            with no fee kept and no questions asked. Later months are not refunded, since you can cancel at any time and are
            not charged again. Lifetime has a longer window: 30 days from purchase, refunded in full. Contact {contact}.
          </p>
          <h3>Fair use</h3>
          <p>
            Plan quotas (5, 300 and 5,000 conversions a month) reset on the first of each month. Files are limited to 100 MB and
            jobs to two minutes.
          </p>
          <h3>Changes</h3>
          <p>We may update these terms; material changes are announced on this site before they take effect.</p>
        </>
      )}
    </div>
  )
}
