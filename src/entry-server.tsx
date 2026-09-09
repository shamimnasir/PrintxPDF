// Static renderer used by scripts/prerender.mjs: renders the same tree as main.tsx for one
// route and returns its HTML, so built pages ship the real page and React hydrates in place.
import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/ui/Toast'
import { setPublishedConfig, type SiteConfig } from './admin/config'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export async function render(url: string, config: Partial<SiteConfig>): Promise<string> {
  setPublishedConfig(config)
  // Waits for every lazy route chunk. By default a Suspense boundary bigger than ~12 KB is
  // "outlined" as a hidden segment plus a swap script, even when it finished, so crawlers
  // without JavaScript would see "Loading…" and hydration would attach to moved nodes;
  // an unbounded chunk size keeps every completed boundary inline.
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url} basename={basename}>
        <ToastProvider>
          <App />
        </ToastProvider>
      </StaticRouter>
    </StrictMode>,
    { progressiveChunkSize: Infinity },
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  if (html.includes('<div hidden id="S:') || html.includes('<!--$?-->')) {
    throw new Error(`entry-server: ${url} rendered a pending or outlined boundary; the page is not fully static`)
  }
  return html
}
