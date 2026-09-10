import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { applyTheme, store } from './lib/store'
import { ToastProvider } from './components/ui/Toast'
import { bootConfig, getConfig } from './admin/config'
import { applyDesign, previewDesign } from './admin/RuntimeEffects'
import { isDesignId } from './design/presets'

applyTheme(store.getSettings().theme)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(store.getSettings().theme))

// a ?design= preview must win before the first paint; otherwise the prerendered attribute stands until the config arrives
const preview = previewDesign()
if (preview) applyDesign(preview)

// published site config decides the default colour mode for first-time visitors, and the site-wide design
bootConfig().then(() => {
  if (!localStorage.getItem('pxp:settings')) applyTheme(getConfig().theme.defaultMode)
  const d = getConfig().theme.design
  applyDesign(preview ?? (isDesignId(d) ? d : 'blocks'))
})

// A deploy renames every chunk. A tab opened before it fails to import the next route and,
// without this, React unmounts to a blank page. One reload picks up the new files.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault()
  const key = 'pxp:reloaded'
  try {
    if (sessionStorage.getItem(key) === location.href) return
    sessionStorage.setItem(key, location.href)
  } catch {
    /* storage blocked: still reload once */
  }
  location.reload()
})

// Vite's BASE_URL is "/" locally and "/<repo>/" on GitHub Pages
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
// Built pages arrive with the real markup already in #root (scripts/prerender.mjs renders the
// same tree with src/entry-server.tsx), so React attaches to it instead of repainting; the dev
// server and the bare app shell start from an empty root.
const root = document.getElementById('root')!
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
