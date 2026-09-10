# Lessons

- **pdf.js in background tabs**: `page.render()` with the default display intent waits on requestAnimationFrame, which never fires in a hidden tab. Long conversions stall the moment the user switches tabs. Use `intent: 'print'` (or check visibility) for batch rendering.
- **Public CORS proxies stall, don't fail**: allorigins/codetabs return 522 after ~20 s when overloaded. Race all proxies concurrently and prefer the richest result within a grace window; never chain them sequentially.
- **Global print CSS is a trap in SPAs**: a `@media print` rule that hides `#root > *` leaks to every route once the stylesheet loads. Scope print rules with a body class the feature toggles on mount.
- **Dropdowns inside overflow-x:auto toolbars get clipped**: render the popover as a sibling of the scroll container.
- **Bold ≠ loud**: user rejected acid yellow on black as eye-straining for beginners. Bold structure (borders, offset shadows, display type) reads fine on white with a single saturated accent + white text.
- **pdf-lib coordinates ignore /Rotate**: anything placed "where the user clicked" on a pdf.js preview must be mapped through the page rotation (see `visualRect` in engines.ts).
- **`erasableSyntaxOnly` rejects constructor parameter properties**: `constructor(public x: T)` fails `tsc` in this repo. Declare fields explicitly and assign in the body.
- **Runtime-inline CSS variables beat preset stylesheets**: `RuntimeEffects` writes `--bw/--radius/--acid` as inline styles on `<html>`, so a `[data-design]` block can never override them. Presets must *write their values into the config* when chosen, and previews must substitute the preset's values in the same effect.
- **Prerendered attributes get clobbered before config boot**: applying `data-design` from `DEFAULT_CONFIG` before `site-config.json` arrives flashes Blocks on every page. Gate runtime application on `isBooted()` and let the prerendered shell carry the attribute until then.
- **wrangler's OAuth token cannot write DNS**, but a `routes: [{ custom_domain: true }]` Worker route makes Cloudflare create the record and certificate itself. Apex/www records for Vercel still go through the dashboard: A `76.76.21.21`, CNAME `cname.vercel-dns.com`, *DNS only* — the orange cloud breaks Vercel's certificate issuance.
- **Cloudflare dashboard dialogs re-render**: element refs from `find` go stale between steps and an option click can close the dialog. Re-find after every state change and screenshot before Save.
- **Tell the truth in tool copy**: a fabricated "★ 4.8 · 12k reviews" badge was sitting on the extensions page; audit marketing pages for invented social proof, not just feature claims.
- **A fresh hostname reads as "down" from this Mac for ~30 minutes**: `curl` returns 000 while `dig` already shows the record. It is the local resolver cache, not the deployment. Verify with `curl --resolve host:443:<ip>` before debugging anything.
- **Colima's docker config trap**: `~/.docker/config.json` may still name Docker Desktop's credential helper, which breaks `docker build` under Colima. Point `DOCKER_CONFIG` at a scratch dir for the session instead of editing the user's file. macOS also has no `setsid` — use `nohup` to detach a long build.
- **KV counters lag**: read-modify-write quota counters can under-count a fast burst by one or two before the 402 lands, because KV caches reads ~60 s per location. Fine for a monthly allowance; a Durable Object is the strict fix.
- **A "not configured" guard can hide a broken code path**: every billing route was verified only while `STRIPE_SECRET_KEY` was unset, so all four returned a tidy 503 and the real request was never built. The first call with a live key hit `POST /v1/v1/checkout/sessions` — the base URL and the call sites both carried `/v1`. Unit tests covered the form encoder but not URL assembly. When a feature is gated behind "not configured yet", the URL/argument construction still needs its own test, because the gate makes the gap invisible.
- **Log the upstream provider's own message**: the handler returned a friendly 502 and logged only status + code, which described the failure as an unrecognisable "stripe_error". Stripe's message named the exact bad URL and solved it instantly. Log the provider message server-side (never to the client) and, for a secret, its mode (`_live_` vs `_test_`) rather than any of its characters.
- **Checkpoint commits by explicit path leave confusing residue**: a file I had edited but not listed (`WebClipPage.tsx`) later showed as modified and looked like an agent stepping outside its lane. When committing partial work, keep a written manifest of every file you touched and add exactly that — or commit whole directories you own.
- **Adding to a registry breaks the test that enumerates it**: `kind registry › registers every kind` hard-coded the seven prior kinds, so the correct eighth entry failed the suite. That is the test doing its job; update the enumeration in the same change rather than loosening the assertion.
- **EPUB and Office files share the ZIP signature**: a magic-byte fallback that accepts any `PK` file let a `.pptx` into the ebook converter, where Calibre failed with a 500 instead of a clean 415. EPUB mandates a stored `mimetype` entry first at a fixed offset — check that, not just `PK`.
- **Gate a deploy on the test run, in the same shell line**: `python -m unittest && vitest && nohup wrangler deploy &` means a red test can never be followed by a push; a separate "deploy" step after a green run a minute earlier can.

## 2026-09-10: "hero flash on every reload"
- Root cause was structural, not a fallback file: prerendered pages carried a text-only stand-in
  that the browser painted first, then `createRoot().render()` wiped and repainted. Any
  "flash on reload" report in a prerendered SPA means: check whether the HTML on disk is the
  real markup and whether React hydrates it. Fixed with `vite build --ssr` +
  `react-dom/static` prerender + `hydrateRoot`.
- `prerenderToNodeStream` outlines any Suspense boundary over ~12 KB into a hidden segment
  plus a `$RC` swap script even when it finished. Pass `progressiveChunkSize: Infinity` and
  assert no `<div hidden id="S:` in the output.
- Everything that reads the browser during render (localStorage user, sessionStorage,
  `document`, `window.location`) must go through `useSyncExternalStore` with a server
  snapshot or a `ClientOnly` island, or hydration throws #418 and client-renders the page.
- `vite preview` serves index.html for every path (no directory indexes); test built
  pages with `npx serve dist` or the real host.
- React 19 blocks `javascript:` hrefs in JSX; set a bookmarklet's href through a ref.
- Vercel with `cleanUrls: true`: a rewrite destination must be the clean URL (`/app`), not
  `/app.html`, or every unmatched route returns 404.

## 2026-09-10: second audit (outputs, not just "it ran")
- A tool "passing" because a file downloaded is not enough: opening the outputs found Compress
  Medium returning a larger file than the input on photo PDFs. Check the promise, not the event.
- html2canvas cannot draw pictures from sites without CORS headers; rewriting `img.src` inside
  `onclone` does not help (its loader keys on the original URL). Use its `proxy` option with an
  image relay that returns the bytes with CORS `*` (`/image?url=` on the API).
- In automation, `getByRole('button', { name: /^PDF/ })` matched the "PDF Tools" nav button
  before the toolbar's PDF button and looked like a hung export. Scope selectors to `main`.
- `vite preview` and the browser pane both mislead (SPA fallback for every path, screenshot
  offset when scrolled); Playwright against `npx serve dist` is the trustworthy harness.
