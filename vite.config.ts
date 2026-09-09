import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// VITE_BASE lets the same build live at a sub-path (e.g. GitHub Pages: /PrintxPDF/)
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
