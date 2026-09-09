// Optional Cloudflare Worker: a reliable CORS-friendly fetcher for the web-page cleaner.
// Deploy:  cd worker && npx wrangler deploy
// Then in the site's .env:  VITE_FETCH_PROXY=https://printxpdf-fetch.<you>.workers.dev
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() })
    const target = new URL(request.url).searchParams.get('url')
    if (!target || !/^https?:\/\//i.test(target)) return new Response('missing url', { status: 400, headers: cors() })
    try {
      const upstream = await fetch(target, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; PrintxPDF/1.0; +https://github.com)', accept: 'text/html,application/xhtml+xml,*/*' },
        redirect: 'follow',
        cf: { cacheTtl: 300 },
      })
      const html = await upstream.text()
      return new Response(html, { status: upstream.ok ? 200 : upstream.status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300', ...cors() } })
    } catch (e) {
      return new Response(`fetch failed: ${e.message}`, { status: 502, headers: cors() })
    }
  },
}
const cors = () => ({ 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, OPTIONS' })
