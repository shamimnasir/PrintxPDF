import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

// Vite's BASE_URL is "/" locally and "/<repo>/" on GitHub Pages
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
