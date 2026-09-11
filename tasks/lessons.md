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

## 2026-09-10: full-suite audit
- A fix in one dimension can break another silently. Wrapping /print, /signin and /signup in
  ClientOnly to stop the reload flash also served them to crawlers as an empty "Loading..."
  shell, and /print is indexable and in the sitemap. ClientOnly is for routes that genuinely
  cannot render without the browser (/account); everywhere else, keep the markup static and
  move the browser reads (query string, localStorage) into an effect so the first client
  render still matches the server.
- Content rots against the product. Five guide passages still described Firefox/Safari pages
  and "demo listings" months after those were removed. A dead-internal-link check over the
  built pages catches the links; only reading the prose catches the stale claims.
- `scripts/audit-site.mjs` is the cheap one to run every time (no browser, seconds): titles,
  descriptions, duplicates, canonicals, h1, alt text, JSON-LD, internal links, sitemap
  coverage, referenced assets. `npm run audit:site` before any deploy.

## 2026-09-11: browser audit pass
- A CSS rule with one extra element selector can silently outrank a component's own colour.
  `.prose a { color: var(--link) }` is specificity (0,1,1) and beat `.btn { color: var(--btn-fg) }`
  at (0,1,0), so every in-article call to action rendered as accent-on-accent: a solid blue pill
  with no readable label, 188 of them across the blog. When a design token is shared between a
  text colour and a button background (`--link` and `--btn-bg` are both `--acid` here), any
  descendant link rule is one specificity point away from erasing a button. Exclude buttons
  explicitly: `.prose a:not(.btn)`.
- `grid-template-columns: 1fr` floors at min-content, not zero. The desktop rule already used
  `minmax(0, 1fr)`; the mobile override forgot it, so a table with `min-width: 32rem` stretched
  the article column to 710px inside a 390px phone and 72 pages scrolled sideways. Any grid
  column holding arbitrary content wants `minmax(0, …)`, always.
- A utility class is only as global as the stylesheet that defines it. `.table-scroll` lived in
  `blog.css`, which only blog routes import, so `/api` and `/extension-privacy` used the class
  and got no styles at all. Shared utilities belong in `index.css`.
- A failing test is not the same as a failing product. Three of four audit failures were the
  harness racing hydration: `fill()` then `form.requestSubmit()` fires before React attaches
  `onSubmit`, the browser posts the form natively, and the assertion times out. Click the real
  button instead, which auto-waits for enabled.
- But that race is real for visitors too, not only for the harness. A React-only form that is
  visible before hydration silently does nothing when submitted early. Where the handler's job
  is just a navigation, give the form a real `action`/`method`/`name` so it works as a plain GET
  form (the home and cleaner URL boxes now do). Where it cannot work without JS, disable the
  button until `useHydrated()` is true rather than letting a native post throw the input away.
- Verify a credential's *shape*, not just its presence. `STRIPE_SECRET_KEY` held a Cloudflare API
  token (`cfut_…`); the worker happily forwarded it to Stripe, got a 401, and reported
  "Payment provider error, try again shortly" for days. `requireStripe` now rejects anything that
  is not `sk_`/`rk_` with its own error code and logs the prefix only.
- An audit that flags what is merely not loaded yet trains you to ignore it. Lazy images below
  the fold are `complete === false`, which is not "broken"; only an actual error event or a
  completed load with zero pixels counts.
- "Widest element past the edge" is the wrong culprit when that element sits inside an
  `overflow-x: auto` wrapper: it is clipped and contributes nothing to the document's scrollWidth.
  Bisecting instead (hide each child, see whether the root overflow disappears) named the real
  owners: long unbreakable tokens, a WordPress hook name and a `WIFI:` QR payload, in body copy.
  `overflow-wrap: break-word` on `body` is the right baseline, since it only splits a word that
  would not have fitted anyway.
- Measure before blaming performance. Sign-up failed in the audit twice and looked like slow
  hydration after a heavy cleaner session; measured, hydration was 150-650ms and *faster* warm
  than cold. The real cause was clicking the button on the exact edge where React enables it, so
  the click landed on the pre-hydration element and did nothing, reproducing about half the time.
  Wait for the state change (`waitForFunction` on `!button.disabled`), not for a duration.

## 2026-09-11: content gaps
- Measure coverage against the data model, not the URLs. "Does the tool slug appear in a post
  URL" said 26 tools were uncovered; checking `relatedTools` and cluster `tools` said 19, and four
  of those already had a whole guide written about them that simply never linked the tool.
- The valuable find was not the missing pages, it was the rotted ones. Three high-intent guides
  told readers the site could not do a job and named a competitor to go and use instead, because
  they were written before Protect PDF, Redact PDF and PDF to PowerPoint shipped. A page that
  ranks for "password protect a pdf" and then sends the reader to Acrobat is worse than no page.
  Whenever a tool ships, grep the blog for what it used to say was impossible.
- Parallel subagents in one working tree collide in shared scratch space, and each one sees the
  others' edits in `git status`. Give them one file each, tell them explicitly not to touch shared
  files, and do the wiring up yourself afterwards.
- An automated honesty check has to understand scope. Flagging any post that says "nothing is
  uploaded" while listing a server tool produced a false positive: the sentence read "with a
  browser tool the images are processed inside your own tab", which is precise and correct.

## 2026-09-11: launch review
- A tier added late is a tier nobody exercised. Lifetime shipped in the pricing table and in the
  worker, but the client forgot it in four places: `decodeToken` accepted only 'pro' and 'api', so
  a paying customer restoring on a second device was told their own key "does not look like a
  PrintxPDF access key"; `planName` had no lifetime case and fell through to 'Free', so the
  account page told a customer who paid $119 that they were on the free plan; the header badge and
  the tool usage line both hard-coded `plan === 'api' ? 'API' : 'Pro'`. The same fact derived in
  four ternaries drifts. One `PLAN_LABEL` / `PLAN_QUOTA` record now owns it.
- A promise repeated in four places is four places to contradict yourself. The refund window was
  "14 days, 30 on Lifetime" in Terms and on the pricing card, and plain "14 days" in the pricing
  FAQ, both Support mentions and the home promise row. Under-promising still breaks trust when the
  customer reads the generous version first.
- Grep the copy for what a feature used to be. A guide still described the extension listings as a
  "design demo" whose "install buttons do nothing" long after the extension was downloadable and
  submitted to the store.
- An undefined custom property fails silently and inherits. `var(--muted)` where the token is
  `--fg-muted` left body text at full strength with no warning anywhere. Worth a one-line check
  that every `var(--x)` used in the stylesheet is also defined in it.

## 2026-09-11: admin publishing
- Rules that only CI can run get enforced too late. Moving the 12 content rules into a plain
  module let the editor show a violation as it is typed and let the Worker refuse it at the door,
  with CI unchanged. Worth doing the moment a rule needs a second caller.
- Prove a data migration, do not eyeball it. Hashing all 179 prerendered pages before and after
  the TypeScript-to-JSON move turned "looks fine" into a fact, and it caught that the only
  difference was a chunk filename rather than any content.
- Check the normaliser before trusting a comparison. The first byte-identical check "failed"
  because the regex for asset hashes did not allow the hyphen inside `Account-4-B3Roc4.js`. The
  tool was wrong, not the migration.
- A client-side gate is a UX affordance, never a security boundary. The old /admin passcode was
  honest about that while it only edited a local draft; the moment publishing could commit to the
  repository, the real check had to move to the Worker and the GitHub token had to stay there.
