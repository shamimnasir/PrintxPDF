import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE lets the same build live at a sub-path (e.g. GitHub Pages: /PrintxPDF/)
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  build: {
    chunkSizeWarningLimit: 2000,
    // the static renderer (dist-ssr) only needs its JS; public/ ships with the client build
    copyPublicDir: !isSsrBuild,
    // route chunk names for scripts/prerender.mjs (modulepreload per page)
    manifest: !isSsrBuild,
  },
}))
