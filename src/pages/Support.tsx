import { Link } from 'react-router-dom'
import { breadcrumbSchema, faqSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'

const FAQS = [
  {
    q: 'A tool did nothing when I clicked run',
    a: 'Almost always a very large file. Browser tools do the work inside the tab, using your own memory, so a 500 MB scan can stall on a laptop that is already low. Close other tabs and try again, or split the file first. If it fails on a small file too, tell us the tool and the file size.',
  },
  {
    q: 'It says the PDF is password protected',
    a: 'A PDF that asks for a password before it opens cannot be read by the browser tools. Run it through Unlock PDF first, with the password, then use the tool you wanted. If you do not have the password we cannot help you past it, and neither can anyone else.',
  },
  {
    q: 'Compress PDF barely shrank my file, or gave it back unchanged',
    a: 'That is the tool protecting you. If the pages are mostly photographs, or the file was already compressed, turning the pages into pictures would make it bigger, so you get the lossless version instead and a note saying so. A text-heavy PDF usually shrinks a lot on Medium.',
  },
  {
    q: 'My converted PDF has text I cannot select or search',
    a: 'Word, Excel and HTML to PDF draw the page as a picture, so the words are not selectable. If you need selectable text, run the result through OCR PDF, which adds an invisible text layer over the image.',
  },
  {
    q: 'Scan to text got some words wrong',
    a: 'Recognition depends on the scan. Straight, well-lit pages at 300 dpi read well; phone photos at an angle read badly. Non-Latin alphabets such as Bengali or Arabic come out complete in the .txt file, but only partly searchable inside the PDF, because the invisible layer uses a Latin font.',
  },
  {
    q: 'The web page cleaner could not clean a page',
    a: 'Some sites refuse automatic visitors, and some build the article with scripts after loading. Open the page yourself, select the text, and use the Paste text tab instead. That path always works because nothing has to be fetched.',
  },
  {
    q: 'Pictures are missing from my exported PDF',
    a: 'Browsers refuse to draw pictures from other sites into a file unless that site allows it. We pass them through our own image relay so most survive. A site that blocks the relay too will leave a gap, and pasting the text is the way around it.',
  },
  {
    q: 'A server conversion failed or timed out',
    a: 'Server jobs accept files up to 100 MB and get two minutes to finish. Very large decks and ebooks can run out of time. Free accounts get 5 conversions a month, Pro 300 and API 5,000; if you are out, the tool says so rather than failing quietly.',
  },
  {
    q: 'I moved to a new computer and lost my Pro plan',
    a: 'Your account lives in the browser, not on our server, so it does not follow you automatically. Open Account, then Access key, on the machine where Pro works, copy the key, and paste it on the new machine. The key restores the plan anywhere.',
  },
  {
    q: 'How do I cancel?',
    a: 'Account, then Subscription, then Manage subscription. That opens the billing portal run by Stripe, our payment provider, where you can cancel in one click, change plan or download invoices. Cancelling stops the next charge and you keep the plan until the period ends.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes. Ask within 14 days of your first charge and we refund it in full, no questions and no fee. Email us; we do not make you argue for it.',
  },
  {
    q: 'Does the extension or the WordPress plugin send you anything?',
    a: 'No. The Chrome extension reads the address of the tab only when you click it, stores one preference on your machine, and makes no network requests of its own. The WordPress plugin never contacts our server. Neither has analytics or trackers.',
  },
]

export default function Support() {
  const cfg = useSiteConfig()
  const email = cfg.site.email || 'support@printxpdf.com'
  useSeo({
    title: 'Support | PrintxPDF Help and Contact',
    description:
      'Get help with PrintxPDF: fixes for the most common problems with the PDF tools, the web page cleaner, server conversions, your account and billing.',
    path: '/support',
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Support', path: '/support' },
      ]),
      faqSchema(FAQS),
    ],
  })

  return (
    <div className="container section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">Support</span>
      <h1>
        Something not working?
        <br />
        <span className="acid-mark">Tell us and we will fix it.</span>
      </h1>
      <p className="lead">
        Most problems have a one-line answer, and they are below. If yours is not, write to a human and you will get a
        human back.
      </p>

      <div className="card card-ink" style={{ marginTop: '2rem' }}>
        <span className="label" style={{ color: 'var(--acid-dim)' }}>
          Email us
        </span>
        <h2 style={{ marginTop: '0.5rem', fontSize: '1.8rem' }}>
          <a href={`mailto:${email}`} style={{ color: 'inherit' }}>
            {email}
          </a>
        </h2>
        <p style={{ margin: '0.75rem 0 0', opacity: 0.9 }}>
          It reaches one person, so give it a day or two on weekdays. Include the tool you were using, the browser, and
          roughly how big the file was. Never send us the file itself: we do not need it, and we would rather not have it.
        </p>
      </div>

      <div className="card card-flat" style={{ marginTop: '1.25rem' }}>
        <span className="label">Our billing promise</span>
        <ul style={{ margin: '0.6rem 0 0', lineHeight: 1.9, fontWeight: 600 }}>
          <li>No card and no account to use the free tools. Ever.</li>
          <li>No trial that turns into a charge, because there is no trial.</li>
          <li>Cancel yourself in one click. No email, no retention script.</li>
          <li>Full refund inside 14 days of a first charge, no fee kept.</li>
          <li>The renewal date and the exact amount are on your account page before it charges.</li>
        </ul>
      </div>

      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>Common questions</h2>
      <div className="stack" style={{ gap: '0.85rem', marginTop: '1rem' }}>
        {FAQS.map((f) => (
          <details key={f.q} className="card faq-item">
            <summary style={{ fontWeight: 700, cursor: 'pointer' }}>{f.q}</summary>
            <p style={{ margin: '0.7rem 0 0' }}>{f.a}</p>
          </details>
        ))}
      </div>

      <h2 style={{ fontSize: '2rem', marginTop: '3rem' }}>Other places to look</h2>
      <div className="grid grid-2" style={{ marginTop: '1rem' }}>
        <Link to="/tools" className="card card-hover" style={{ textDecoration: 'none' }}>
          <h4 style={{ marginBottom: '0.3rem' }}>Every tool</h4>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Each page says what the tool does, what it cannot do, and whether it runs in your browser.
          </p>
        </Link>
        <Link to="/blog" className="card card-hover" style={{ textDecoration: 'none' }}>
          <h4 style={{ marginBottom: '0.3rem' }}>Guides</h4>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Step-by-step walkthroughs for the jobs people ask about most.
          </p>
        </Link>
        <Link to="/pricing" className="card card-hover" style={{ textDecoration: 'none' }}>
          <h4 style={{ marginBottom: '0.3rem' }}>Plans and limits</h4>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            What is free forever, and what the paid plans add.
          </p>
        </Link>
        <Link to="/privacy" className="card card-hover" style={{ textDecoration: 'none' }}>
          <h4 style={{ marginBottom: '0.3rem' }}>Privacy</h4>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Exactly what leaves your computer, and what never does.
          </p>
        </Link>
      </div>
    </div>
  )
}
