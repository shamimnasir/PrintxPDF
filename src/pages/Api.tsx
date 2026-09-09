import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useUser } from '../features/account/useUser'
import { API_BASE } from '../lib/api'

const CURL = `curl -X POST ${API_BASE}/convert/ppt-to-pdf \\
  -H "Authorization: Bearer $PRINTXPDF_KEY" \\
  -F "file=@deck.pptx" \\
  --output deck.pdf`

const ENDPOINTS: [string, string, string][] = [
  ['POST /convert/ppt-to-pdf', '.ppt .pptx .pps .ppsx .odp', 'PDF'],
  ['POST /convert/pdf-to-ppt', '.pdf', 'PPTX with editable pages'],
  ['POST /convert/epub-to-pdf', '.epub', 'PDF, A4, page numbers'],
  ['POST /convert/mobi-to-pdf', '.mobi .azw .azw3 .prc', 'PDF, A4, page numbers'],
  ['POST /convert/protect-pdf', '.pdf + password, ownerPassword?, permissions?', 'AES-256 encrypted PDF'],
  ['POST /convert/unlock-pdf', '.pdf + password', 'the same PDF without its password'],
  ['POST /convert/pdf-to-pdfa', '.pdf + level (1b | 2b | 3b)', 'PDF/A for archiving'],
  ['GET /fetch?url=', 'a page URL', 'its HTML, for the web-page cleaner'],
]

const ERRORS: [string, string][] = [
  ['401 invalid_token', 'The key is missing, malformed, expired or rotated.'],
  ['402 quota_exceeded', 'Free allowance used up; the body has used and limit.'],
  ['402 subscription_inactive', 'The subscription behind the key is cancelled or unpaid.'],
  ['413 too_large', 'Files are limited to 100 MB.'],
  ['415 unsupported_media_type', 'Wrong file type for that endpoint (checked by magic bytes, not just the extension).'],
  ['415 drm_protected', 'The ebook is DRM-protected and cannot be converted.'],
  ['429 rate_limited / quota_exceeded', 'Slow down, or the paid quota is used up for the month.'],
  ['503 busy', 'Every converter is working; wait for Retry-After seconds and try again.'],
  ['504 timeout', 'The job passed the two-minute limit.'],
]

export default function Api() {
  useSeo({
    title: 'PDF Conversion API | PowerPoint, EPUB and MOBI to PDF',
    description: 'An HTTPS API that converts PowerPoint to PDF, PDF to PowerPoint, EPUB to PDF and MOBI to PDF. Send a file, get a file back. 5 free conversions a month; the API plan includes 5,000.',
    path: '/api',
    keywords: ['pptx to pdf api', 'pdf to pptx api', 'epub to pdf api', 'mobi to pdf api', 'document conversion api'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'API', path: '/api' }])],
  })

  const user = useUser()
  const key = user?.entitlement?.token
  return (
    <div className="container section">
      <span className="eyebrow">PDF API · live at {API_BASE.replace(/^https?:\/\//, '')}</span>
      <h1>
        Convert files, <span className="acid-mark">programmatically.</span>
      </h1>
      <p className="lead">
        A handful of jobs need a real engine, Office layout, ebook rendering, PDF encryption, so they run on our server instead of in the browser. Send a file with one
        multipart request and get the converted file back. Files are processed in an isolated container and deleted the moment
        the response is sent.
      </p>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <span className="badge badge-acid">Live</span>
          <h3 style={{ marginTop: '0.75rem' }}>One request</h3>
          <pre className="code">{CURL}</pre>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
            Without a key you get 5 free conversions a month per IP address. The response carries <code className="inline">x-pxp-usage: used/limit</code> and a
            <code className="inline">content-disposition</code> file name.
          </p>
          <table className="table" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Accepts</th>
                <th>Returns</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map(([e, a, r]) => (
                <tr key={e}>
                  <td className="mono">{e}</td>
                  <td>{a}</td>
                  <td>{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3>Plans and limits</h3>
          <table className="table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Conversions / month</th>
                <th>Key</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Free</td><td>5 per IP</td><td>none</td></tr>
              <tr><td>Pro · $5</td><td>300</td><td>yes</td></tr>
              <tr><td>API · $29</td><td>5,000</td><td>yes, 1-year expiry</td></tr>
            </tbody>
          </table>
          <h4 style={{ marginTop: '1.5rem' }}>Your access key</h4>
          {key ? (
            <>
              <pre className="code" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{key}</pre>
              <p className="muted" style={{ fontSize: '0.8rem' }}>
                Pass it as <code className="inline">Authorization: Bearer …</code>. Rotate it from <Link to="/account/api-key">your account</Link> if it leaks.
              </p>
            </>
          ) : (
            <p>
              <Link to="/pricing" className="btn btn-sm btn-acid">
                Get a key
              </Link>{' '}
              with the Pro or API plan. Keys are shown under Account → Access key.
            </p>
          )}
          <h4 style={{ marginTop: '1.5rem' }}>Errors</h4>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            Failures return JSON <code className="inline">{'{ "error", "code" }'}</code>:
          </p>
          <table className="table" style={{ fontSize: '0.8rem' }}>
            <tbody>
              {ERRORS.map(([c, d]) => (
                <tr key={c}>
                  <td className="mono">{c}</td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card-flat" style={{ marginTop: '2rem' }}>
        <h3>Self-hosting</h3>
        <p style={{ margin: 0 }}>
          The whole API, including the LibreOffice and Calibre container, is open source in the <code className="inline">worker/</code>{' '}
          directory of the repository. Deploy it to your own Cloudflare account with <code className="inline">wrangler deploy</code> and point the site at it
          with <code className="inline">VITE_API_BASE</code>.
        </p>
      </div>
    </div>
  )
}
