# PrintxPDF

Print only what matters, then fix any PDF. A print-and-PDF toolkit with an original brand and a bold cobalt-on-white design. Most tools run in the browser; eight conversion and security tools use a Cloudflare container and delete each file after processing. Founded and written by Nasir Uddin Shamim.

**Live:** https://printxpdf.com

---

## What's in it

### 1. Web-page cleaner, `/print`
Paste a URL. The page is fetched through a reader proxy, run through Mozilla Readability and sanitised with DOMPurify, then handed to an editor:

- **Delete mode**, hover any block, click to remove it, drag to sweep several
- **Highlight**, **Edit text** (contentEditable), **Notes**, **manual page breaks**
- **Undo / redo** with ⌘Z / ⌘⇧Z
- **Style menu**, text size, font, image size, margins, A4/Letter, link handling
- **Outputs**, Print (crisp text), Download PDF, PNG screenshot, Email, Save to account

Fallbacks that always work: paste HTML/text, upload an `.html` file, or three bundled sample articles.

### 2. PDF tools, `/tools`
44 tools. Every one states up front whether it runs in your browser, is best-effort, or runs on our server.

#### Direct links to every tool

These are the canonical pages for the individual tools, grouped by the job they do.

**Organize PDFs:** [Merge PDF](https://printxpdf.com/tools/merge-pdf) · [Split PDF](https://printxpdf.com/tools/split-pdf) · [Organize Pages](https://printxpdf.com/tools/organize-pdf) · [Rotate PDF](https://printxpdf.com/tools/rotate-pdf) · [Delete Pages](https://printxpdf.com/tools/delete-pages) · [Extract Pages](https://printxpdf.com/tools/extract-pages)

**Optimize and read:** [Compress PDF](https://printxpdf.com/tools/compress-pdf) · [Repair PDF](https://printxpdf.com/tools/repair-pdf) · [OCR PDF](https://printxpdf.com/tools/ocr-pdf) · [PDF Reader](https://printxpdf.com/tools/pdf-reader)

**Convert documents:** [PDF to JPG](https://printxpdf.com/tools/pdf-to-jpg) · [JPG to PDF](https://printxpdf.com/tools/jpg-to-pdf) · [Word to PDF](https://printxpdf.com/tools/word-to-pdf) · [Excel to PDF](https://printxpdf.com/tools/excel-to-pdf) · [HTML to PDF](https://printxpdf.com/tools/html-to-pdf) · [PDF to Text](https://printxpdf.com/tools/pdf-to-text) · [PDF to Word](https://printxpdf.com/tools/pdf-to-word) · [PDF to Excel](https://printxpdf.com/tools/pdf-to-excel) · [PDF to PowerPoint](https://printxpdf.com/tools/pdf-to-ppt) · [PowerPoint to PDF](https://printxpdf.com/tools/ppt-to-pdf) · [EPUB to PDF](https://printxpdf.com/tools/epub-to-pdf) · [MOBI to PDF](https://printxpdf.com/tools/mobi-to-pdf) · [Scan to PDF](https://printxpdf.com/tools/scan-to-pdf) · [PDF to Markdown](https://printxpdf.com/tools/pdf-to-markdown) · [PDF to PDF/A](https://printxpdf.com/tools/pdf-to-pdfa) · [Ebook Converter](https://printxpdf.com/tools/ebook-converter)

**Edit, sign and protect:** [Sign PDF](https://printxpdf.com/tools/sign-pdf) · [Add Watermark](https://printxpdf.com/tools/add-watermark) · [Page Numbers](https://printxpdf.com/tools/page-numbers) · [Edit Metadata](https://printxpdf.com/tools/edit-metadata) · [Flatten PDF](https://printxpdf.com/tools/flatten-pdf) · [Remove Metadata](https://printxpdf.com/tools/remove-metadata) · [Edit PDF](https://printxpdf.com/tools/edit-pdf) · [Crop PDF](https://printxpdf.com/tools/crop-pdf) · [Fill PDF Forms](https://printxpdf.com/tools/pdf-forms) · [Redact PDF](https://printxpdf.com/tools/redact-pdf) · [Compare PDFs](https://printxpdf.com/tools/compare-pdf) · [Protect PDF](https://printxpdf.com/tools/protect-pdf) · [Unlock PDF](https://printxpdf.com/tools/unlock-pdf)

**Images, QR codes and files:** [QR Code Generator](https://printxpdf.com/tools/qr-code) · [Image Converter](https://printxpdf.com/tools/image-converter) · [Compress Image](https://printxpdf.com/tools/compress-image) · [Create ZIP](https://printxpdf.com/tools/create-zip) · [Extract ZIP](https://printxpdf.com/tools/extract-zip)

| Engine | Tools |
|---|---|
| `pdf-lib` | merge, split, extract, delete, rotate, organise, watermark, page numbers, metadata, flatten, sign, compress (lossless) |
| `pdf.js` | reader, thumbnails, text extraction, PDF→JPG/PNG, lossy compress |
| `tesseract.js` | OCR to text and to a searchable PDF (invisible text layer) |
| `mammoth` / `SheetJS` | Word→PDF, Excel→PDF |
| `jsPDF` + `html2canvas` | HTML→PDF, images→PDF, QR→PDF |
| `qrcode` | QR generator (URL, WiFi, vCard, email, SMS, phone) |

PowerPoint ↔ PDF and EPUB/MOBI → PDF need a real layout engine, so they run on `api.printxpdf.com`, LibreOffice + Calibre in a Cloudflare container, source in `worker/`.

### 3. Content, `/blog`
18 topic clusters, 72 guides, built as typed data in `src/content/posts/`. Each post carries the metadata Google wants and the shape LLMs want: a 40-60 word extractable answer, explicit entities, FAQs and comparison tables.

### 4. Admin panel, `/admin`
The admin panel is at `/admin`. Publishing is protected by the Worker-side session and repository token; do not put credentials in this README.

| Section | Controls |
|---|---|
| Dashboard | content counts, local traffic, quick links |
| General | site name, tagline, description, URL, socials, announcement bar |
| Appearance | accent/ink/alert colours, border width, radius, default colour mode |
| Pages & home | every hero string, section toggles, marquee, per-page meta overrides |
| Blog content | edit any post's title, meta tags and short answer; publish/unpublish |
| Tools | rename, re-describe, hide or feature any of the 44 tools |
| SEO | title template, keywords, robots.txt, llms.txt, verification tokens, sitemap preview |
| Analytics | GA4 / Plausible / Umami IDs, Do Not Track, local view counts |
| Custom code | head HTML, body-end HTML, CSS and JS injection |
| Publish & data | export/import `site-config.json`, discard draft, change passcode |

**How publishing works.** There is no backend, so the panel writes a draft to `localStorage`, visible only in your browser. To make a change live for everyone: download `site-config.json` from **Publish & data**, drop it into `public/site-config.json`, commit and push. Vercel redeploys and every visitor gets it.

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

## API, billing and the converter, `worker/`

`worker/` is a Cloudflare Worker (`printxpdf-api`, served at `api.printxpdf.com`) plus a container image (Debian + LibreOffice Impress + Calibre, Python stdlib HTTP server). It provides:

- `POST /convert/{ppt-to-pdf|pdf-to-ppt|epub-to-pdf|mobi-to-pdf}`, multipart `file` in, converted file out; 100 MB / 2 min limits; free quota by hashed IP, plan quotas by access key
- `POST /billing/checkout`, `GET /billing/session`, `GET /billing/me`, `POST /billing/portal`, `POST /billing/rotate`, Stripe Checkout and customer portal; entitlement is a stateless HMAC-signed key, re-checked against Stripe on use (no database, no webhook)
- `GET /fetch?url=`, the CORS fetch proxy the web-page cleaner uses (`VITE_FETCH_PROXY`)
- `GET /health`

Deploy (needs Docker or Colima running for the image build):

```bash
cd worker && npm install && npx wrangler deploy
```

Secrets: `ENTITLEMENT_SECRET` (any long random string) and `STRIPE_SECRET_KEY`, a *restricted* key with Checkout Sessions (write), Customers (read), Subscriptions (read), Billing Portal (write), Prices and Products (read). Set them with `npx wrangler secret put <NAME>`; never commit them. Price ids go in `vars.PRICE_PRO` / `vars.PRICE_API`. Full runbook in `worker/README.md`.

Site-side env (Vercel → Settings → Environment Variables, or `.env`): `VITE_SITE_URL`, `VITE_API_BASE`, `VITE_FETCH_PROXY`, see `.env.example`.

### Design presets
Three complete looks, **Blocks** (brutalist, default), **Paper** (book: serif on cream) and **Studio** (rounded SaaS), switch site-wide from Admin → Appearance. Preview one without publishing with `?design=paper` on any URL.

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
