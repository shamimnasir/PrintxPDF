import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { applyTheme, store } from './lib/store'
import { ToastProvider } from './components/ui/Toast'

applyTheme(store.getSettings().theme)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyTheme(store.getSettings().theme))

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
