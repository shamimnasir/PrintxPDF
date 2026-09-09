import { Link } from 'react-router-dom'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { useUser } from '../features/account/useUser'

const WORKER = `// worker/fetch-proxy.js — deploy with: npx wrangler deploy
// Then set VITE_FETCH_PROXY=https://<name>.<you>.workers.dev in .env and rebuild.
export default {
  async fetch(request) {
    const target = new URL(request.url).searchParams.get('url')
    if (!target || !/^https?:\\/\\//.test(target)) return new Response('missing url', { status: 400 })
    const upstream = await fetch(target, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; PrintxPDF/1.0)', accept: 'text/html,*/*' },
      redirect: 'follow',
    })
    const html = await upstream.text()
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300',
      },
    })
  },
}`

const CURL = `curl -X POST https://api.printxpdf.example/v1/pdf \\
  -H "Authorization: Bearer $PRINTXPDF_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/article","page_size":"A4","images":"large"}' \\
  --output article.pdf`

export default function Api() {
  useSeo({
    title: 'PDF API and Self-Hosted Fetch Proxy',
    description: 'Deploy a one-file Cloudflare Worker so the web-page cleaner fetches reliably from your own domain, plus the specification for a URL-to-PDF API endpoint.',
    path: '/api',
    keywords: ['url to pdf api', 'html to pdf api', 'cors proxy worker'],
    schema: [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'API', path: '/api' }])],
  })

  const user = useUser()
  return (
    <div className="container section">
      <span className="eyebrow">PDF API · design preview</span>
      <h1>
        Clean PDFs, <span className="acid-mark">programmatically.</span>
      </h1>
      <p className="lead">
        This demo ships without a backend, so the API below is a specification, not a live endpoint. What does work today
        is the one-file fetch proxy that makes the web-page cleaner reliable on your own domain.
      </p>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <div className="card">
          <span className="badge badge-acid">Works now</span>
          <h3 style={{ marginTop: '0.75rem' }}>Self-hosted fetch proxy</h3>
          <p>
            Public reader proxies are rate-limited. Deploy this Cloudflare Worker (free tier is plenty), point the site at it,
            and every URL fetch goes through your own edge.
          </p>
          <pre className="code">{WORKER}</pre>
          <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
            The same file is in the repo at <code className="inline">worker/fetch-proxy.js</code>.
          </p>
        </div>
        <div className="card">
          <span className="badge badge-alarm">Spec only</span>
          <h3 style={{ marginTop: '0.75rem' }}>URL → PDF endpoint</h3>
          <pre className="code">{CURL}</pre>
          <table className="table" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>url</td><td>string</td><td>Page to clean and render</td></tr>
              <tr><td>page_size</td><td>A4 | Letter</td><td>Default A4</td></tr>
              <tr><td>images</td><td>full | large | small | none</td><td>Default large</td></tr>
              <tr><td>text_size</td><td>S | M | L | XL</td><td>Default M</td></tr>
              <tr><td>links</td><td>keep | strip | footnote</td><td>Default keep</td></tr>
            </tbody>
          </table>
          <h4 style={{ marginTop: '1.5rem' }}>Your API key</h4>
          {user ? (
            <pre className="code">{user.apiKey}</pre>
          ) : (
            <p>
              <Link to="/signup" className="btn btn-sm btn-acid">
                Create an account
              </Link>{' '}
              to get a demo key.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
