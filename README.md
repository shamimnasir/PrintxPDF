# PrintxPDF

Strip the ads, keep the words. A browser-only print-friendly and PDF toolkit with an original brand and a bold cobalt-on-white design. Every tool runs client-side — nothing is uploaded to a server — so the whole thing ships as static files.

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
29 tools. Every one states up front whether it runs in your browser, is best-effort, or needs a server we don't have.

| Engine | Tools |
|---|---|
| `pdf-lib` | merge, split, extract, delete, rotate, organise, watermark, page numbers, metadata, flatten, sign, compress (lossless) |
| `pdf.js` | reader, thumbnails, text extraction, PDF→JPG/PNG, lossy compress |
| `tesseract.js` | OCR to text and to a searchable PDF (invisible text layer) |
| `mammoth` / `SheetJS` | Word→PDF, Excel→PDF |
| `jsPDF` + `html2canvas` | HTML→PDF, images→PDF, QR→PDF |
| `qrcode` | QR generator (URL, WiFi, vCard, email, SMS, phone) |

PowerPoint, EPUB and MOBI conversion genuinely need a layout engine on a server. Those pages say so and point at the real workaround instead of faking a progress bar.

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
| Tools | rename, re-describe, hide or feature any of the 29 tools |
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

## Optional: your own fetch proxy

Fetching arbitrary pages from a browser needs a CORS-friendly reader. The app races several public ones, which are rate-limited. For a reliable setup, deploy the one-file Worker in `worker/` and set `VITE_FETCH_PROXY` (see `.env.example`).

```bash
cd worker && npx wrangler deploy
```

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
