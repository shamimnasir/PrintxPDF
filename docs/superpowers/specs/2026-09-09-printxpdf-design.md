# PrintxPDF — Design Spec (2026-09-09)

## Goal
A browser-only clone of PrintFriendly's functionality under an original brand (PrintxPDF) with an Electric Brutalist visual design. Deployable as static files to Vercel, Cloudflare Pages, or GitHub Pages.

## Stack
Vite + React 18 + TypeScript + React Router (BrowserRouter with `base` support, `404.html` fallback for GH Pages). No backend. Optional Cloudflare Worker in `worker/` for reliable URL fetching.

## Design system (Electric Brutalist)
- Tokens: ink `#0B0B0F`, acid `#E8FF3A`, paper `#FAF8F2`, alarm `#FF3B1F`, plus grey ramp.
- 3px borders, 6px hard offset shadows (2px on :active), uppercase chunky buttons, condensed display type (Archivo Black / Archivo via Google Fonts with system fallback), visible grid backgrounds.
- Dark mode via `data-theme` + `prefers-color-scheme`.
- Print output uses a conservative, clean serif/sans stylesheet.

## Features

### Web → clean page (flagship)  `/print?url=`
- Input: URL, pasted HTML/text, uploaded .html, or 3 bundled samples.
- `fetchArticle(url)`: proxy chain allorigins → codetabs → corsproxy → jina reader (markdown → HTML). First success wins; all failures → friendly error with paste fallback.
- Pipeline: DOMParser → Readability → DOMPurify → absolutize URLs → strip scripts/iframes/forms.
- Editor toolbar: Print · PDF · Email · Screenshot | Style ▾ · Delete · Highlight · Edit · Undo · Redo · Reset.
- Delete mode: hover outlines nearest block (p, li, h*, img, figure, table, blockquote, pre, div-with-text); click removes; drag sweeps. Undo stack stores node + parent + nextSibling.
- Style: text size S/M/L/XL, font sans/serif/mono, image size full/large/small/none, margins, page size A4/Letter, links keep/strip/footnote.
- Outputs: window.print() with print CSS; Download PDF via html2canvas + jsPDF (paginated); PNG via html2canvas; Email via mailto with title + URL.

### PDF tools (all client-side)  `/tools/:slug`
Real: merge, split, rotate, delete-pages, reorder, watermark, page-numbers, compress, sign, pdf-to-image, image-to-pdf, reader, extract-text, ocr (tesseract.js), qr, word-to-pdf (mammoth → print), excel-to-pdf (xlsx → html → print), protect metadata edit.
Demo-only (badged): pdf-to-word, pdf-to-excel, pdf-to-ppt, ppt-to-pdf, epub-to-pdf, mobi-to-pdf, repair (best-effort re-save is real; badge as best-effort).

Shared tool shell: dropzone → file list → options panel → Run → result card with download + "open in reader".

### Marketing / other pages
Home (hero with dual cards: Work with a file / Print a web page), Tools index, Extensions (Chrome/Firefox/Safari/Edge), WordPress plugin, Website button generator (produces embeddable snippet), API + Pricing, Blog (3 posts), About, Sign in/up (localStorage), Account (overview, API key, saved signatures, saved docs, settings).

## Deploy
`vercel.json` rewrites, Cloudflare `_redirects`, GH Pages workflow + `404.html` copy, `VITE_BASE` env for subpath.

## Testing
Vitest unit tests for fetchArticle proxy chain (mock fetch), undo stack, readability pipeline, pdf-lib ops on a generated PDF. Manual browser verification of editor + tools.
