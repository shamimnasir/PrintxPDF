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
- [ ] Chrome Web Store (user): console cannot be automated; user uploads `public/downloads/printxpdf-chrome-extension.zip` with `extension/STORE_LISTING.md` and `extension/store-assets/*.png`
- [x] Full tool audit with Playwright (`scripts/audit-tools.mjs`): 44/44 pass (server kinds against the live API), screenshots in `public/screens/tools`, shown in tool How sections, guide steps and HowTo schema
- [x] Menus split into PDF Tools / Convert / Images & Files; hover bridge; byline aligned; upload box restyled; stale-chunk reload + error boundary (blank page after deploy); tool page sidebar
- [x] Plain-language copy pass (tool pages, tool descriptions, option labels, notices, site pages), no engine names in user-facing text
- [x] Deployed 2026-09-10, all 44 live tool pages verified (sections, sidebar, screenshot, no hydration errors)

## Review (2026-09-10)
- Hero flash root cause was the text-only prerender being wiped by createRoot; fixed structurally (static render + hydrate), not by a fallback tweak.
- Audit harness is the regression net now: `npx serve dist -l 4175` then `node scripts/audit-tools.mjs`; run it before any deploy that touches tools.
- Open: Chrome Web Store upload (user), WordPress review pending, Stripe go-live, mobi-to-pdf has no fixture (UI-only in the audit).

## 2026-09-10 (phase 5): second audit, outputs checked
- [x] `scripts/audit-checks.mjs`: every tool's output opened and compared with its promise (page counts, order, rotation, text, metadata, form values, encryption, sizes); 44/44 pass
- [x] All 8 server kinds run against the deployed container image locally (pptx/pdf/epub/mobi/azw3/protect/unlock/pdfa, wrong password and already-encrypted paths)
- [x] `scripts/audit-features.mjs`: cleaner (proxy fetch, tiny page, delete, PDF, PNG, sample, save), account, Stripe hand-off, extension, WordPress, button generator, guides, theme, menus, admin, 404; 21/21 pass live
- [x] Fixed: Compress Medium/Strong never returns a bigger file; short pages no longer rejected by the cleaner; exported PDFs and images keep pictures from other sites (API image relay + html2canvas proxy)

## 2026-09-10 (phase 6): full-suite audit
- [x] typecheck, 115 unit tests, 26 worker tests, 36 container tests, oxlint, php lint: all green
- [x] `scripts/audit-site.mjs` added (static integrity over all 151 pages): clean after fixes
- [x] 44/44 tools with output checks; 21/21 live features
- [x] Fixed: /print, /signin, /signup served as an empty Loading shell (ClientOnly regression); 5 stale extension passages incl. 2 dead internal links; 6 meta descriptions out of range
- [x] Deployed and verified live
- Submissions: WordPress plugin awaiting review (slug `printxpdf`); Chrome extension still needs the user (Web Store console cannot be automated)

## 2026-09-10 (phase 7): pricing, lifetime plan, positioning — PLAN, NOT YET APPROVED

### Competitive facts (researched 2026-09-10, sources in the session)
| | Cheapest paid | Free tier | Files | Lifetime? |
| --- | --- | --- | --- | --- |
| iLovePDF | $7/mo, or $48/yr = $4.00/mo | 15 MB to 400 MB per tool, 1 to 25 tasks a day | uploaded, deleted within 2 hours | no |
| Smallpdf | **$12/mo, or $108/yr = $9.00/mo** (a live A/B test shows some US/UK/CA visitors up to 25% more) | **2 conversions a day**, first-party confirmed; batch, OCR-to-Office, Edit Text and Strong Compression blocked | uploaded; 1 hour **only if signed in**, anonymous files kept a "reasonable period" that **extends every time you reopen**; processed docs reachable by shareable URL by default | no |
| PrintFriendly | no consumer plan at all: free + ads. Print Button Pro ~$79/yr per domain buys ad-free + white-label. API $10 to $80 | everything, ad supported | uploaded, 48 hours, URLs screened by third-party AI, usage shared with ad partner Freestar | no |
| PrintxPDF | proposed $3.99/mo | unlimited browser tools, no account, no watermark, no file cap | **33 of 44 tools never upload** | proposed $119 |

Their users' loudest complaints: ads injected into PrintFriendly PDFs (dominant 1-star theme, 53 one-star reviews on a 20k-install plugin); PrintFriendly's 2026 extension permission grab; iLovePDF surprise charges and refusals to refund; Smallpdf trial auto-renewal charges and undisclosed free limits.

### 0. BLOCKER, fix before any privacy claim ships
- [ ] `src/lib/fetchArticle.ts` queries **all four proxies at once**, so every URL a user cleans is also sent to allorigins.win, codetabs.com and Jina AI, every time, even though our own proxy answers first. Measured: ours 0.87s; allorigins and codetabs both failed at ~19.7s; jina 3.5s.
- [ ] `/privacy` says the address goes to "our fetch proxy (or a public reader proxy)". It is "and", always. Materially misleading and it is the policy linked from a Chrome Web Store item now in review.
- [ ] Fix: try our proxy alone first (6s budget), fall back to the public chain only if it fails. Keeps the reliability the chain was built for, stops the routine broadcast.
- [ ] Then correct the privacy copy to describe what actually happens, including the 5-minute Cloudflare edge cache.

### 1. Pricing
- [ ] Stripe test mode: create new prices, Pro $3.99/mo, API $19.99/mo (Stripe prices are immutable, so these are new objects), swap `PRICE_PRO` / `PRICE_API`, redeploy the worker
- [ ] $3.99 billed monthly undercuts iLovePDF's best annual rate ($4.00/mo) while staying month to month. Say that, do not just say "cheap"
- [ ] Update Pricing page, Account page, the home and API copy, and the two prerendered descriptions

### 2. Lifetime, $119, category first (nobody in the field offers one)
- [ ] New one-time price in Stripe; checkout switches to `mode: 'payment'` for this plan only
- [ ] `worker/src/token.ts`: `Plan` gains `'lifetime'`; claims carry the checkout session id
- [ ] `worker/src/billing.ts`: `session()` currently rejects everything that is not a subscription; `me()` decides the plan by listing subscriptions, and a lifetime buyer has none, so they would read as free on every request. Verify instead by re-fetching the stored session and checking `payment_status === 'paid'`, cached the same hour a subscription is. Stripe stays the source of truth, no new storage
- [ ] `worker/src/quota.ts`: allowance for lifetime (decision below)
- [ ] Client `Plan` type, pricing card, account display
- [ ] Terms: what "lifetime" means, and a 30-day refund window for a one-time charge (the current 14 days was written for a cancellable subscription)

### 3. Positioning (revised after the fuller competitor report)

**The real opening is billing conduct, not price or features.** Segmented review analysis: Smallpdf
billing mentions are **96% negative (86 mentions)**, iLovePDF billing **100% negative (62)**. Their
4.9 and 4.7 headline scores are carried by one-off "it merged my PDF" reviews, not by paying
customers. Verified patterns, both vendors: a $0.78 trial converting to $59.04/month; a 7-day trial
firing a $108 to $144 annual charge with no reminder; a EUR 34 "early termination fee" kept on a
same-day cancellation with zero usage; refunds refused by boilerplate; charging continuing months
after cancellation; a missing cancel button; complaints escalated to Swiss SECO and Quebec OPC.
iLovePDF advertises a 14-day refund window that reviewers say is not honoured.

PrintxPDF already does the opposite, and most of it is already built:
- [ ] No card and no account for the free tier, ever (already true)
- [ ] No trial that silently converts (we have no trial at all)
- [ ] One-click cancel in the Stripe customer portal (already built, already linked from Account)
- [ ] Honour the 14-day refund literally, and 30 days on the one-time lifetime charge
- [ ] Say the renewal date and the exact amount on the account page before it charges
- [ ] Make this a named promise on /pricing, since it is the loudest verified pain in the category

Then the two supporting pillars:
- [ ] Files stay on the device: 33 of 44 tools never upload. **Accuracy note:** iLovePDF's paid
      desktop app does process locally, so the honest claim is "in your browser, free, nothing to
      install", not "only we do local"
- [ ] Aim a migration page at PrintFriendly's angry users: our WordPress plugin is free, ad-free and
      unbranded, which is what they charge ~$79/yr for; our extension asks for activeTab only
- [ ] Never name a competitor in site copy (standing rule)

**Verified free-tier caps worth beating in copy:** iLovePDF free is 15 MB and **one file per task**
for Office conversions, OCR, PDF/A and Repair; Edit, Redact, Compare, Forms and Crop are one file
per task on *every* tier including paid. Smallpdf free is **2 conversions a day**. Our browser tools
have no file cap and no task cap because they cost us nothing to run.

**Price ladder, all verified:** Smallpdf $9.00/mo on annual, iLovePDF $4.00/mo on annual, PrintxPDF
proposed **$3.99/mo billed monthly**. We would be the cheapest in the category while being the only
one you can leave at the end of any month. Nobody in the category sells a lifetime.

### Decisions needed before implementing
1. Lifetime allowance: 300/mo like Pro means ~36,000 server conversions over ten years for $119. Cap it lower, or bound the number sold?
2. Ship the proxy fix first, on its own, before the pricing work?

# Phase 5 (2026-09-11): browser audit pass
- [x] Static audit clean (152 pages, 149 sitemap URLs, 83 assets, 0 issues)
- [x] New `scripts/audit-layout.mjs` + `npm run audit:layout`: every route at 1280px and 390px in a
      real browser, checking horizontal overflow (naming the widest offender), broken images,
      invisible text, em dashes, JS errors and failed requests
- [x] Fix: in-article CTAs were invisible (accent text on accent background) on 188 blog spots,
      caused by `.prose a` outranking `.btn`; now `.prose a:not(.btn)`
- [x] Fix: 72 pages scrolled sideways on a phone; `.post-wrap` mobile column was `1fr`
      (floors at min-content) instead of `minmax(0, 1fr)`
- [x] Fix: `.table-scroll` moved from `blog.css` to `index.css`, so `/api` and `/extension-privacy`
      actually get it; the three `/api` tables are now wrapped and focusable
- [x] Fix: forms that did nothing when submitted before hydration. Home and cleaner URL boxes are
      now real GET forms (`action="/print"`, `name="url"`); the account form disables its button
      until `useHydrated()`
- [x] Fix: `requireStripe` rejects a secret that is not `sk_`/`rk_` with `billing_key_invalid`,
      logging the prefix only; 4 new worker tests
- [x] Fix: stale prices, "$5" in the quota message and "$5/$29" in `llms.txt`, now $3.99/$19.99/$119
- [x] Fix: `audit-features` signup step clicked through hydration instead of racing it; the pricing
      step now probes `/billing/checkout` first so a config fault reports its own reason
- [ ] BLOCKED (user only): `STRIPE_SECRET_KEY` currently holds a Cloudflare API token (`cfut_…`),
      so every checkout 401s. Needs `cd worker && npx wrangler secret put STRIPE_SECRET_KEY` with
      the live `sk_live_…`, and the pasted Cloudflare token rolled since it went to Stripe.

## Review
- 117 client tests, 33 worker tests, tsc and oxlint clean.
- Live prices verified in the Stripe dashboard: Pro $3.99/mo, API $19.99/mo, Lifetime $119 once.
- Live customer portal login link returns 200.

# Phase 6 (2026-09-11): content gaps and conversion copy
- [x] Measured real coverage: 19 of 44 tools had no blog presence at all (relatedTools or cluster hub)
- [x] Five new clusters, 20 guides: `edit` (edit/crop/forms/compare), `slides` (PowerPoint both ways),
      `ebooks` (EPUB/MOBI/formats/DRM), `files` (image convert/compress, zip/unzip),
      `archive` (PDF/A, scan to PDF, PDF to Markdown, what survives time)
- [x] Fixed content that had rotted against the product, which mattered more than the new pages:
      - `privacy/password-protect-pdf` said outright that the site cannot encrypt and sent readers
        to Acrobat. Protect PDF ships AES-256. Section, FAQ and CTA corrected.
      - `privacy/redact-pdf-properly` taught a 7-step manual rasterise workaround with no mention
        of Redact PDF. Now leads with the tool, keeps the manual method as the explainer.
      - `from-pdf/pdf-to-powerpoint` said editable conversion "requires Adobe Acrobat Pro or a paid
        server-side converter". We are that converter, free for 5 files a month.
- [x] Tool coverage now 44/44. 177 prerendered pages, up from 152.
- [x] Conversion copy: hero no longer overclaims. It said "nothing is uploaded" while listing
      Protect, a server tool. A promise a careful reader can falsify is worth less than a precise
      one, and the whole positioning rests on being trusted about this.
- [x] Home promise row under the hero: free stays free, no trial that turns into a charge, cancel
      in one click. Billing conduct is the category's verified weak point.
- [x] Cluster cap in the content test raised 20 -> 24; the hardcoded "not in the future" date now
      compares against the real current date instead of a literal that expires.

## Review
- 44/44 tools reachable from the blog, 0 orphans.
- Static audit clean over 177 pages, 174 sitemap URLs.
- The three corrected posts were the highest-value change here: each was a high-intent page
  actively recommending a competitor for a job the product now does.

# Phase 7 (2026-09-11): launch review
- [x] Footer, Terms and Privacy name the operating company (LateNightBirds LLC), which is also the
      name buyers see on the Stripe payment page. New `site.company` config field, editable in admin.
- [x] LAUNCH BLOCKER: the Lifetime tier was broken in the client. `decodeToken` rejected lifetime
      keys, `planName` reported lifetime as "Free", and two more places labelled it "Pro".
      Centralised into PLAN_LABEL / PLAN_QUOTA with a regression test.
- [x] Refund window aligned across Terms, Pricing card, Pricing FAQ, Support x2 and the home row.
- [x] Extension guide no longer calls the working extension "a design demo".
- [x] `.promise-row` used an undefined token (`--muted` vs `--fg-muted`); stylesheet swept for others.
- [x] Verified: 44 tools claimed = 44 in nav = 44 on /tools; all 44 tool pages disclose browser vs
      server correctly with zero mismatches; OCR's advertised page limits are genuinely enforced.

## Review
- Lifetime, Pro and API all render their own name in the header badge and on the account page.
- Static audit clean over 177 pages. 117 tests.
