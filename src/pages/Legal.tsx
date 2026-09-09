import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const cfg = useSiteConfig()
  const contact = cfg.site.email ? <a href={`mailto:${cfg.site.email}`}>{cfg.site.email}</a> : <Link to="/account">your account page</Link>
  useSeo({
    title: kind === 'privacy' ? 'Privacy, Your Files Stay on Your Device' : 'Terms of Use',
    description:
      kind === 'privacy'
        ? 'Browser tools never upload your files. A few server jobs send the file over HTTPS and delete it the moment they finish. Payments run through Stripe; no card data is stored here.'
        : 'Terms for using PrintxPDF: free browser tools, a free monthly allowance of server conversions, and Pro and API subscriptions billed monthly by Stripe with a 14-day refund on the first charge.',
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
          <h1>Your files stay with you.</h1>
          <p className="lead">
            Every browser tool processes your documents on your own computer. A few jobs run on our server and are deleted
            the moment they finish.
          </p>
          <h3>What stays on your device</h3>
          <p>
            Merging, splitting, compressing, signing, OCR, the web-page cleaner and every other browser tool work in your
            browser's memory; the files are discarded when you close the tab. Account data, saved documents, signatures,
            settings and your access key live in this browser's localStorage and are never sent to us.
          </p>
          <h3>What leaves your device</h3>
          <p>
            <strong>Web-page cleaning by URL.</strong> The address you paste is sent to our fetch proxy (or a public reader
            proxy) so the page can be retrieved. Only the address is transmitted.
          </p>
          <p>
            <strong>Server jobs.</strong> PowerPoint to PDF, PDF to PowerPoint, EPUB and MOBI to PDF, password protect and unlock, and PDF/A conversion upload the file
            over HTTPS to our converter, which runs in an isolated container on Cloudflare. The file is held in memory and
            temporary disk for the length of the job (at most two minutes), then deleted. We do not keep copies, and we do not
            log file contents. Free-tier usage is counted per calendar month against a salted hash of your IP address, kept for
            40 days; paid usage is counted against your subscription.
          </p>
          <p>
            <strong>Payments.</strong> Checkout and the customer portal are hosted by Stripe. We never see your card number.
            Stripe gives us a customer ID, which is stored inside your access key in this browser and used to check that your
            subscription is active.
          </p>
          <h3>Cookies</h3>
          <p>This site sets none. Stripe sets its own cookies on its checkout and portal pages.</p>
          <h3>Analytics</h3>
          <p>
            Only if the site owner enables a provider, and never when your browser sends Do Not Track. Nothing about your files
            is ever measured.
          </p>
          <h3>Contact</h3>
          <p>Questions about your data: {contact}.</p>
        </>
      ) : (
        <>
          <h1>Terms, briefly.</h1>
          <p className="lead">
            PrintxPDF is provided as-is. Browser tools are free. Server conversions have a free monthly allowance and paid
            plans.
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
            Pro ($5 per month) and API ($29 per month) are billed monthly by Stripe and renew automatically until cancelled.
            Cancel any time from Account → Subscription; access continues to the end of the period you have paid for, and you
            are not charged again. Prices exclude any VAT or sales tax Stripe is required to add for your location.
          </p>
          <h3 id="refunds">Refunds</h3>
          <p>
            If a plan is not what you expected, ask within 14 days of your first charge and we refund it in full. Later months
            are not refunded, since you can cancel at any time. Contact {contact}.
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
