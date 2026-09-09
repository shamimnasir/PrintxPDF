# PrintxPDF

Strip the ads, keep the words. A browser-only clone of a print-friendly / PDF-tools service with an original brand and a bold cobalt-on-white design. Every tool runs client-side: nothing is uploaded to a server, so the whole site ships as static files.

**Live demo:** see the Vercel deployment linked in the repo settings.

## What it does

- **Print any web page clean** (`/print`): paste a URL → Readability strips nav, ads and comments → edit the preview (click-to-delete blocks, drag to sweep, highlight, edit text, page breaks, notes, undo/redo) → Print, download PDF, PNG screenshot, or email. Style menu: text size, font, image size, margins, A4/Letter, link handling.
- **29 PDF tools** (`/tools`): merge, split, organize (drag thumbnails), rotate, delete/extract pages, compress, repair, OCR (Tesseract), reader, PDF↔JPG, Word/Excel/HTML→PDF, PDF→text/Word/Excel, sign (draw/type, saved signatures), watermark, page numbers, metadata, flatten, QR generator. Tools that genuinely need a server (PPTX, EPUB, MOBI) say so instead of faking it.
- **Website tools**: embeddable print button generator, WordPress plugin page, API spec, pricing.
- **Demo account** in localStorage: saved documents, signatures, API key, settings, dark mode.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # dist/ (also copies index.html → 404.html for GitHub Pages)
```

## Deploy

| Host | How |
|---|---|
| **Vercel** | Import the repo. `vercel.json` rewrites all routes to `index.html`. Zero config. |
| **Cloudflare Pages** | Build command `npm run build`, output `dist`. `public/_redirects` handles routing. |
| **GitHub Pages** | Push to `main`; `.github/workflows/deploy-pages.yml` builds with `VITE_BASE=/<repo>/` and publishes. Enable Pages → Source: GitHub Actions. |

## Optional: reliable URL fetching

Fetching arbitrary pages from the browser goes through public reader proxies, which are rate-limited. For your own domain, deploy the one-file Cloudflare Worker in `worker/` and set `VITE_FETCH_PROXY` (see `.env.example`).

```bash
cd worker && npx wrangler deploy
```

## Stack

Vite · React 19 · TypeScript · React Router · @mozilla/readability · DOMPurify · pdf-lib · pdf.js · jsPDF · html2canvas · Tesseract.js · qrcode · mammoth · SheetJS

## Not affiliated

This is an independent demo project. It is not affiliated with, endorsed by, or connected to PrintFriendly or any other print/PDF service. All copy, code and branding are original.
