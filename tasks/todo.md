# PrintxPDF build plan
- [x] 1. Foundation: vite config (base), index.html fonts, tokens/base CSS, UI primitives, Header/Footer/Layout, routes
- [x] 2. Web-clip: fetchArticle proxy race, readability pipeline, samples, input page
- [x] 3. Editor: toolbar, delete/highlight/edit/break/note modes, undo/redo, style menu, print CSS, PDF/PNG/email export
- [x] 4. PDF engines (pdf-lib, pdf.js, tesseract, qrcode, mammoth, xlsx) + tool registry
- [x] 5. Tool shell page + special tools (sign, reader, qr, ocr, organize)
- [x] 6. Marketing pages: home, tools index, extensions, wordpress, website button, api/pricing, blog, about
- [x] 7. Account: sign in/up (localStorage), overview, api key, signatures, saved docs, settings
- [x] 8. Deploy configs (vercel, cloudflare, gh pages), README, build verification, browser QA
- [x] 9. Audit (8 review angles) → fixes → tests → redeploy

## Review
- Live: https://printxpdf.com (Vercel project linked to github.com/shamimnasir/PrintxPDF, auto-deploys main)
- 18 unit tests (fetch race, readability, undo stack, pdf-lib engines); tsc + oxlint clean of errors
- Palette changed mid-build per feedback: lemon → cobalt on white
- Known limits: PPTX/EPUB/MOBI tools are demo UI (need a server); public fetch proxies are rate-limited (worker/ has a self-host fix)

# Phase 2 (2026-09-10): domain, founder, presets, server converters, Stripe
- [x] A. printxpdf.com → Vercel: domains add, Cloudflare DNS (A/CNAME, DNS-only), vercel.json redirects, env vars, URL defaults, verify
- [x] B. Author/founder: config.author, Person schema, /author page, bylines (post/cluster/blog/about/footer), llms.txt, prerender, test
- [x] C. Design presets: token refactor, [data-design] blocks/paper/studio, presets.ts, admin Design card, boot + fonts, prerender shell, screenshots
- [ ] D. Worker+container: worker/ scaffold, token/stripe/billing/quota/convert/container/fetch, Dockerfile+server.py, Colima build, smoke test, KV, deploy, secrets, curl verify
- [ ] E. Billing client + server tools: api.ts, store, Pricing, Account, Header, toolsMeta 'server', GenericTool dispatch, ToolPage, tests; Stripe test products + portal
- [x] F. Copy/legal cutover: demo strings, Api.tsx docs, Legal billing/privacy, WordPress/Extensions, README/.env.example, prerender/gen-seo bodies
- [ ] G. Audit: tsc, oxlint, vitest, build, crawler view, browser QA; todo review + lessons; commit/push/deploy

## Runtime facts (2026-09-10)
- Stripe test (sandbox) products: Pro = prod_VEKYalQF55jvfx / PRICE_PRO=price_1UDrt4CCxH1bzQKtZOK1oBFu ($5/mo). API = prod_VEKaLe2wqVwKem / PRICE_API=price_1UDrvfCCxH1bzQKtspPBVy0f ($29/mo)
- Cloudflare DNS: A @ 76.76.21.21, CNAME www cname.vercel-dns.com (both DNS only). Vercel: printxpdf.com verified; www cert pending at time of writing.
- Vercel env (production): VITE_SITE_URL, VITE_API_BASE=https://api.printxpdf.com, VITE_FETCH_PROXY=https://api.printxpdf.com/fetch
- Stripe TEST customer portal: default config saved (cancel at period end, switch between Pro/API, return URL https://printxpdf.com/account); no-code login link https://billing.stripe.com/p/login/test_7sY6oG0XFczs4LedpidnW00 (replace with the live link at go-live; stored in public/site-config.json billing.portalLoginUrl)
- Worker live: printxpdf-api version 78fbceeb (custom domain api.printxpdf.com), container printxpdf-converter a03ecc13 standard-1 max 2, KV e029ac90bf574cdb9076d568b098b513, ENTITLEMENT_SECRET set. Billing returns 503 billing_not_configured until the user runs: cd worker && npx wrangler secret put STRIPE_SECRET_KEY
- Local DNS on this Mac lags new Cloudflare/Vercel records by ~30 min; verify with curl --resolve <host>:443:<ip>.

# Phase 3 (2026-09-10): competitor gap closure, copy originality, store readiness
- [x] Tools vs iLovePDF: edit, crop, forms, redact, compare, scan, pdf→markdown built + browser-verified · [x] protect, unlock, pdf/a live (qpdf, LibreOffice)
- [x] Tools vs CloudConvert wave 2: image converter (HEIC→JPG), compress image, create/extract ZIP wired + browser-verified · [x] ebook-converter live (Calibre)
- [x] JPG screenshot output on /print
- [x] Copy rewrite: tagline, meta, hero, how-it-works, products, print page, About, README; fabricated marquee customers removed
- [x] /extension-privacy page + route + sitemap + prerender (Web Store requirement)
- [x] Chrome Web Store readiness audit (clipboardWrite added, shortcut Alt+Shift+P, single-purpose, CSP declared, STORE_LISTING.md; human: $5 dev account, screenshots) · [x] WordPress.org readiness audit (external-service disclosure, block removed, Tested up to 7.1, full GPL text; human: real Contributors username, artwork, screenshots, PCP run)
- [x] files components wired into ToolPage; counts self-updating; Api.tsx endpoint table · [x] verified, built (148 pages, 44 tools), deployed

## 2026-09-10 (phase 4): static rendering, audit, submissions
- [x] Tool pages: What/Why/How/FAQ copy for all 44 tools (4 writers), FAQPage + HowTo schema, llms.txt answers
- [x] Name-only byline; light mode default; author photo
- [x] Hero flash on reload: real static render of every page + hydration (entry-server.tsx, ClientOnly islands, inline config, modulepreload per route, /account and /signin as files, shell = header+loading, Vercel rewrite → /app)
- [x] WordPress.org submission: uploaded, automated scan pass, slug changed to `printxpdf`, awaiting review (email to nus9040@gmail.com)
- [ ] Chrome Web Store: console cannot be automated; user uploads `public/downloads/printxpdf-chrome-extension.zip` with `extension/STORE_LISTING.md` and `extension/store-assets/*.png`
- [ ] Full tool audit with Playwright (`scripts/audit-tools.mjs`): every tool run with real fixtures, screenshots into `public/screens/tools`, shown in tool How sections and guide steps
- [ ] Fix whatever the audit finds, redeploy, verify live
