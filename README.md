# PrintxPDF

Print only what matters, then fix any PDF. A print-and-PDF toolkit with an original brand and a bold cobalt-on-white design. Every browser tool runs client-side; a few heavy jobs — Office layout, ebooks, PDF encryption, PDF/A — run on a small Cloudflare container that deletes each file the moment it finishes. Founded and written by Nasir Uddin Shamim.

**Live:** https://printxpdf.com

---

## What's in it

### 1. Web-page cleaner — `/print`
Paste a URL. The page is fetched through a reader proxy, run through Mozilla Readability and sanitised with DOMPurify, then handed to an editor:

- **Delete mode** — hover any block, click to remove it, drag to sweep several
- **Highlight**, **Edit text** (contentEditable), **Notes**, **manual page breaks**
- **Undo / redo** with ⌘Z / ⌘⇧Z
- **Style menu** — text size, font, image size, margins, A4/Letter, link handling
- **Outputs** — Print (crisp text), Download PDF, PNG screenshot, Email, Save to account

Fallbacks that always work: paste HTML/text, upload an `.html` file, or three bundled sample articles.

### 2. PDF tools — `/tools`
43 tools. Every one states up front whether it runs in your browser, is best-effort, or runs on our server.

| Engine | Tools |
|---|---|
| `pdf-lib` | merge, split, extract, delete, rotate, organise, watermark, page numbers, metadata, flatten, sign, compress (lossless) |
| `pdf.js` | reader, thumbnails, text extraction, PDF→JPG/PNG, lossy compress |
| `tesseract.js` | OCR to text and to a searchable PDF (invisible text layer) |
| `mammoth` / `SheetJS` | Word→PDF, Excel→PDF |
| `jsPDF` + `html2canvas` | HTML→PDF, images→PDF, QR→PDF |
| `qrcode` | QR generator (URL, WiFi, vCard, email, SMS, phone) |

PowerPoint ↔ PDF and EPUB/MOBI → PDF need a real layout engine, so they run on `api.printxpdf.com` — LibreOffice + Calibre in a Cloudflare container, source in `worker/`. Free for 5 files a month per IP; the Pro ($5/mo, 300) and API ($29/mo, 5,000) plans lift that.

### 3. Content — `/blog`
18 topic clusters, 72 guides, built as typed data in `src/content/posts/`. Each post carries the metadata Google wants and the shape LLMs want: a 40-60 word extractable answer, explicit entities, FAQs and comparison tables.

### 4. Admin panel — `/admin`
Default passcode `printxpdf` (change it under **Publish & data**).

| Section | Controls |
|---|---|
| Dashboard | content counts, local traffic, quick links |
| General | site name, tagline, description, URL, socials, announcement bar |
| Appearance | accent/ink/alert colours, border width, radius, default colour mode |
| Pages & home | every hero string, section toggles, marquee, per-page meta overrides |
| Blog content | edit any post's title, meta tags and short answer; publish/unpublish |
| Tools | rename, re-describe, hide or feature any of the 43 tools |
| SEO | title template, keywords, robots.txt, llms.txt, verification tokens, sitemap preview |
| Analytics | GA4 / Plausible / Umami IDs, Do Not Track, local view counts |
| Custom code | head HTML, body-end HTML, CSS and JS injection |
| Publish & data | export/import `site-config.json`, discard draft, change passcode |

**How publishing works.** There is no backend, so the panel writes a draft to `localStorage` — visible only in your browser. To make a change live for everyone: download `site-config.json` from **Publish & data**, drop it into `public/site-config.json`, commit and push. Vercel redeploys and every visitor gets it.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # sitemap + typecheck + bundle + prerender
```

`npm run build` does four things:
1. `scripts/gen-seo.mjs` writes `public/sitemap.xml`, `robots.txt` and `llms.txt` from the real content
2. `tsc -b` typechecks
3. `vite build` bundles
4. `scripts/prerender.mjs` bakes static HTML (title, meta, JSON-LD, full article text) for every tool, cluster and post

Step 4 matters: Googlebot runs JavaScript, but AI crawlers and social scrapers mostly don't. React replaces the prerendered markup on mount, so users get the app and crawlers get the content.

## Deploy

| Host | Setup |
|---|---|
| **Vercel** | Import the repo. `vercel.json` handles rewrites, caching and content types. |
| **Cloudflare Pages** | Build `npm run build`, output `dist`. `public/_redirects` handles routing. |
| **GitHub Pages** | Push to `main`. The workflow builds with `VITE_BASE=/<repo>/`. Enable Pages → Source: GitHub Actions. |

Set `VITE_SITE_URL` so canonical URLs and the sitemap point at your domain.

## API, billing and the converter — `worker/`

`worker/` is a Cloudflare Worker (`printxpdf-api`, served at `api.printxpdf.com`) plus a container image (Debian + LibreOffice Impress + Calibre, Python stdlib HTTP server). It provides:

- `POST /convert/{ppt-to-pdf|pdf-to-ppt|epub-to-pdf|mobi-to-pdf}` — multipart `file` in, converted file out; 100 MB / 2 min limits; free quota by hashed IP, plan quotas by access key
- `POST /billing/checkout`, `GET /billing/session`, `GET /billing/me`, `POST /billing/portal`, `POST /billing/rotate` — Stripe Checkout and customer portal; entitlement is a stateless HMAC-signed key, re-checked against Stripe on use (no database, no webhook)
- `GET /fetch?url=` — the CORS fetch proxy the web-page cleaner uses (`VITE_FETCH_PROXY`)
- `GET /health`

Deploy (needs Docker or Colima running for the image build):

```bash
cd worker && npm install && npx wrangler deploy
```

Secrets: `ENTITLEMENT_SECRET` (any long random string) and `STRIPE_SECRET_KEY` — a *restricted* key with Checkout Sessions (write), Customers (read), Subscriptions (read), Billing Portal (write), Prices and Products (read). Set them with `npx wrangler secret put <NAME>`; never commit them. Price ids go in `vars.PRICE_PRO` / `vars.PRICE_API`. Full runbook in `worker/README.md`.

Site-side env (Vercel → Settings → Environment Variables, or `.env`): `VITE_SITE_URL`, `VITE_API_BASE`, `VITE_FETCH_PROXY` — see `.env.example`.

### Design presets
Three complete looks — **Blocks** (brutalist, default), **Paper** (book: serif on cream) and **Studio** (rounded SaaS) — switch site-wide from Admin → Appearance. Preview one without publishing with `?design=paper` on any URL.

## Structure

```
src/
  admin/       config store, runtime effects, control panel
  content/     18 clusters of typed post data + renderers
  features/
    webclip/   URL → clean article + the editor
    pdf/       tool registry, engines, per-tool UIs
    account/   localStorage demo account
  lib/         fetch chain, readability, pdf.js, SEO schema helpers
  pages/       marketing, blog hub, cluster pillars, posts
scripts/       gen-seo.mjs, prerender.mjs
worker/        optional Cloudflare fetch proxy
```

## Stack

Vite · React 19 · TypeScript · React Router · @mozilla/readability · DOMPurify · pdf-lib · pdf.js · jsPDF · html2canvas · Tesseract.js · qrcode · mammoth · SheetJS

## Not affiliated

An independent demo project. Not affiliated with, endorsed by, or connected to PrintFriendly or any other print/PDF service. All copy, code and branding are original.
