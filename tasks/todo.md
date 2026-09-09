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
- [ ] A. printxpdf.com → Vercel: domains add, Cloudflare DNS (A/CNAME, DNS-only), vercel.json redirects, env vars, URL defaults, verify
- [x] B. Author/founder: config.author, Person schema, /author page, bylines (post/cluster/blog/about/footer), llms.txt, prerender, test
- [x] C. Design presets: token refactor, [data-design] blocks/paper/studio, presets.ts, admin Design card, boot + fonts, prerender shell, screenshots
- [ ] D. Worker+container: worker/ scaffold, token/stripe/billing/quota/convert/container/fetch, Dockerfile+server.py, Colima build, smoke test, KV, deploy, secrets, curl verify
- [ ] E. Billing client + server tools: api.ts, store, Pricing, Account, Header, toolsMeta 'server', GenericTool dispatch, ToolPage, tests; Stripe test products + portal
- [x] F. Copy/legal cutover: demo strings, Api.tsx docs, Legal billing/privacy, WordPress/Extensions, README/.env.example, prerender/gen-seo bodies
- [ ] G. Audit: tsc, oxlint, vitest, build, crawler view, browser QA; todo review + lessons; commit/push/deploy
