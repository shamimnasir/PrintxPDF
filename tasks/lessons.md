# Lessons

- **pdf.js in background tabs**: `page.render()` with the default display intent waits on requestAnimationFrame, which never fires in a hidden tab. Long conversions stall the moment the user switches tabs. Use `intent: 'print'` (or check visibility) for batch rendering.
- **Public CORS proxies stall, don't fail**: allorigins/codetabs return 522 after ~20 s when overloaded. Race all proxies concurrently and prefer the richest result within a grace window; never chain them sequentially.
- **Global print CSS is a trap in SPAs**: a `@media print` rule that hides `#root > *` leaks to every route once the stylesheet loads. Scope print rules with a body class the feature toggles on mount.
- **Dropdowns inside overflow-x:auto toolbars get clipped**: render the popover as a sibling of the scroll container.
- **Bold ≠ loud**: user rejected acid yellow on black as eye-straining for beginners. Bold structure (borders, offset shadows, display type) reads fine on white with a single saturated accent + white text.
- **pdf-lib coordinates ignore /Rotate**: anything placed "where the user clicked" on a pdf.js preview must be mapped through the page rotation (see `visualRect` in engines.ts).
