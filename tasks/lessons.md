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
