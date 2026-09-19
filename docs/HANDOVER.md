# PrintxPDF handover

Everything needed to pick this project up elsewhere. Written 2026-09-19, current as of commit
[`69ed8c5`](https://github.com/shamimnasir/PrintxPDF/commit/69ed8c5).

Read [`AGENTS.md`](../AGENTS.md) first if you are an agent: it holds the conventions. This file
holds the inventory.

## The short version

A static Vite/React site on Vercel at [printxpdf.com](https://printxpdf.com), plus one Cloudflare
Worker at `api.printxpdf.com` that handles billing, eight server-side conversions, a CORS fetch
proxy and the admin publishing API. 177 pages are prerendered at build time. Everything else runs
in the visitor's browser.

## Code

| What | Where |
| --- | --- |
| Repository | https://github.com/shamimnasir/PrintxPDF |
| Branch | `main`, 57 commits, first [`759a6fb`](https://github.com/shamimnasir/PrintxPDF/commit/759a6fb) on 2026-09-09 |
| Commits | https://github.com/shamimnasir/PrintxPDF/commits/main |
| README | [`README.md`](../README.md) |
| Agent conventions | [`AGENTS.md`](../AGENTS.md) |
| Worker docs | [`worker/README.md`](../worker/README.md) |
| Phase log | [`tasks/todo.md`](../tasks/todo.md) |
| Mistakes worth not repeating | [`tasks/lessons.md`](../tasks/lessons.md) |
| Marketing copy | [`tasks/listing-kit.md`](../tasks/listing-kit.md) |

There are no open branches, no open pull requests and no CI workflows. The GitHub Pages workflow
was removed in [`7525fb6`](https://github.com/shamimnasir/PrintxPDF/commit/7525fb6): it had failed
38 times, and succeeding would have published a duplicate of the whole site on `github.io`.

## Live surfaces

| Surface | URL | Notes |
| --- | --- | --- |
| Site | https://printxpdf.com | Vercel, auto-deploys from `main` |
| `www` and `*.vercel.app` | | 308 to the apex, including the bare root |
| API | https://api.printxpdf.com | Cloudflare Worker `printxpdf-api` |
| Health | https://api.printxpdf.com/health | `{"ok":true,"version":"1.0.0"}` |
| Admin | https://printxpdf.com/admin | `noindex`, absent from the sitemap |
| Sitemap | https://printxpdf.com/sitemap.xml | 174 URLs |
| For LLMs | https://printxpdf.com/llms.txt | |

## Accounts and dashboards

| Service | Identifier | Console |
| --- | --- | --- |
| Vercel | project `printxpdf`, `prj_K1uc9gRuGL3b9fGeqNzMe8VHa7xE`, org `team_RehW8w4dEbkn6EmZaL9PAjxK` | https://vercel.com/dashboard |
| Cloudflare | account `f33cea16b206227c1b3a3f64dce73c97`, zone `b49701ad91311034ef0211d0b54ee589` | https://dash.cloudflare.com |
| Worker | `printxpdf-api`, KV `e029ac90bf574cdb9076d568b098b513` | Cloudflare → Workers |
| Stripe | account `acct_18mMZxCCxH1bzQKt`, **LATENIGHTBIRDS LLC** | https://dashboard.stripe.com |
| Search Console | verified by meta tag | https://search.google.com/search-console |
| Bing Webmaster | verified, `3EA4638E5CE2DCC578E69827D7CBA6AB` | https://www.bing.com/webmasters |
| Analytics | GA4 `G-ZZXBGJ8KPF` | https://analytics.google.com |
| Email | `support@printxpdf.com` routes to `its4shamim@gmail.com`, active | Cloudflare → Email Routing |
| Domain registrar | Cloudflare | |

Stripe live prices, in [`worker/wrangler.jsonc`](../worker/wrangler.jsonc):

- Pro, $3.99/mo, `price_1UEE51CCxH1bzQKtC5tqnFRu`
- API, $19.99/mo, `price_1UEE6qCCxH1bzQKtHgSMcE3X`
- Lifetime, $119 once, `price_1UEE7rCCxH1bzQKta9NU90fr`
- Customer portal: https://billing.stripe.com/p/login/7sY6oG0XFczs4LedpidnW00

## Secrets

Names only. All are Cloudflare Worker secrets, set with `wrangler secret put`, and none is in the
repository. Nothing here can be read back out of Cloudflare, so a lost one is regenerated rather
than recovered.

| Secret | What it does | If lost |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | billing, promotion codes | new key in the Stripe dashboard |
| `ENTITLEMENT_SECRET` | signs customer entitlements | regenerate; every existing access key stops working |
| `ADMIN_SECRET` | signs admin sessions | regenerate; everyone is signed out |
| `ADMIN_PASSWORD_HASH` | admin login | `node scripts/admin-password.mjs` |
| `GITHUB_TOKEN` | lets the panel commit | new fine-grained PAT, this repo only, Contents: read and write |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | predate this work; not referenced by any code in `worker/src/` | verify before removing |

The IndexNow key at `public/3799e0d520f30b24f87b718c175da8d7.txt` is **public on purpose**. It only
proves domain control because it is readable.

## Architecture

```
printxpdf.com ── Vercel ── static SPA, 177 prerendered pages
                            │
                            └── api.printxpdf.com ── Worker "printxpdf-api"
                                 ├─ /billing/*   Stripe checkout, portal, entitlements   KV
                                 ├─ /convert/*   Durable Object -> container :8080
                                 │               LibreOffice + Calibre + qpdf
                                 ├─ /admin/*     login, publish to GitHub, promo codes
                                 ├─ /fetch       CORS proxy for the page cleaner
                                 └─ /health
```

Entitlements are stateless: an HMAC token minted from the Stripe session, re-checked against Stripe
on use with a 1-hour KV cache. No database, no webhook. Stripe is the system of record.

## Repository layout

| Path | Contains |
| --- | --- |
| `src/features/pdf/` | the 44 tools, `toolsMeta.ts` is the registry |
| `src/features/webclip/` | the page cleaner and its editor |
| `src/content/` | blog content as JSON, plus `validate.ts`, the shared rule engine |
| `src/admin/` | the control panel; `admin/blog/` is the post editor |
| `src/lib/api.ts` | the only client for the Worker |
| `worker/src/` | router, billing, convert, admin, promo, token, quota |
| `worker/container/` | Dockerfile and the Python conversion server |
| `scripts/` | build pipeline and the four audits |
| `extension/`, `wordpress-plugin/` | Chrome extension and WP plugin sources |
| `tasks/` | phase log, lessons, listing copy |

## History, by phase

Grouped so the reasoning is findable. Each commit message explains why, not just what.

**Foundations, 2026-09-09**
[`759a6fb`](https://github.com/shamimnasir/PrintxPDF/commit/759a6fb) first version ·
[`a8f7457`](https://github.com/shamimnasir/PrintxPDF/commit/a8f7457) content system, admin panel and prerendering ·
[`1662433`](https://github.com/shamimnasir/PrintxPDF/commit/1662433) first audit pass

**Domain, billing and the converter, 2026-09-10**
[`c69d4e7`](https://github.com/shamimnasir/PrintxPDF/commit/c69d4e7) move to printxpdf.com, design presets, billing ·
[`05bf787`](https://github.com/shamimnasir/PrintxPDF/commit/05bf787) the Worker and the LibreOffice/Calibre container ·
[`3fa80d1`](https://github.com/shamimnasir/PrintxPDF/commit/3fa80d1) the doubled `/v1` that broke every Stripe call ·
[`619a3a1`](https://github.com/shamimnasir/PrintxPDF/commit/619a3a1) server-side protect, unlock, PDF/A, ebooks ·
[`ba49926`](https://github.com/shamimnasir/PrintxPDF/commit/ba49926) Chrome extension and WordPress plugin ·
[`c34014a`](https://github.com/shamimnasir/PrintxPDF/commit/c34014a) static-render every page and hydrate ·
[`75e1732`](https://github.com/shamimnasir/PrintxPDF/commit/75e1732) stop broadcasting every cleaned URL to three third parties

**Going live, 2026-09-11**
[`4d1f0eb`](https://github.com/shamimnasir/PrintxPDF/commit/4d1f0eb) pricing and the lifetime tier ·
[`b6eae95`](https://github.com/shamimnasir/PrintxPDF/commit/b6eae95) live Stripe ·
[`eea8683`](https://github.com/shamimnasir/PrintxPDF/commit/eea8683) invisible CTAs, sideways scroll, dead forms ·
[`f57c9b5`](https://github.com/shamimnasir/PrintxPDF/commit/f57c9b5) the last 19 tools, and three guides that had rotted against the product ·
[`50edb9c`](https://github.com/shamimnasir/PrintxPDF/commit/50edb9c) name the operating company, fix the Lifetime tier nobody had used

**Admin that can publish, 2026-09-11**
[`60f1b0e`](https://github.com/shamimnasir/PrintxPDF/commit/60f1b0e) post editor, JSON migration, GitHub publishing ·
[`8cc88d9`](https://github.com/shamimnasir/PrintxPDF/commit/8cc88d9) the PBKDF2 ceiling Workers enforces ·
[`e137378`](https://github.com/shamimnasir/PrintxPDF/commit/e137378) stop the password script echoing ·
[`4f2b05e`](https://github.com/shamimnasir/PrintxPDF/commit/4f2b05e) discount codes

**Audit and indexing, 2026-09-11**
[`7525fb6`](https://github.com/shamimnasir/PrintxPDF/commit/7525fb6) remove the Pages workflow ·
[`c316751`](https://github.com/shamimnasir/PrintxPDF/commit/c316751) redirect the bare homepage, set the missing headers ·
[`1e38f69`](https://github.com/shamimnasir/PrintxPDF/commit/1e38f69) IndexNow ·
[`2886acd`](https://github.com/shamimnasir/PrintxPDF/commit/2886acd) stop the description claiming nothing is uploaded ·
[`69ed8c5`](https://github.com/shamimnasir/PrintxPDF/commit/69ed8c5) the listing kit

## State at handover

Green: both typechecks, 135 app tests, 67 Worker tests, build at 177 pages, static audit clean,
layout audit clean over 174 routes at two widths, tools audit 44/44, live features 21/21.

Both deploys are current. The working tree is clean.

## Open items

**Roll the Cloudflare API token.** It was pasted into `STRIPE_SECRET_KEY` by mistake, so the Worker
forwarded it to `api.stripe.com` on every checkout attempt before the real key replaced it. It has
left the infrastructure and should be treated as compromised.

**Change the admin password.** The generating script echoed it once before
[`e137378`](https://github.com/shamimnasir/PrintxPDF/commit/e137378) fixed that, so it appeared in
terminal scrollback. `node scripts/admin-password.mjs`, then
`cd worker && npx wrangler secret put ADMIN_PASSWORD_HASH`.

**Prove the post-purchase path.** Nothing has ever been bought. Checkout opens for all three plans,
but `?session_id=` → entitlement token → account shows the plan → server conversions unlock is
untested end to end. The admin panel can now mint a 100%-off, single-use, Lifetime-only code for
this at `/admin` → Discount codes. Worth doing: the Lifetime tier was mislabelled in four separate
places until [`50edb9c`](https://github.com/shamimnasir/PrintxPDF/commit/50edb9c), which is what a
path nobody has walked looks like.

**Prove one publish from the panel.** The editor, the rule gate and the commit builder are all
tested, but no post has been published through the live GitHub token yet.

**Optional.** Buyers see "Pay LATENIGHTBIRDS LLC" at the card step. The footer and terms now name
the company so it is no longer a surprise, but a display name can be set in Stripe → Branding. It
is account-wide and would rebrand the other products on that account.

**Directory submissions** are listed in [`tasks/listing-kit.md`](../tasks/listing-kit.md) with the
copy ready. They all need an account, so they are a human job.

## Things that have bitten before

The full list is in [`tasks/lessons.md`](../tasks/lessons.md). The four most expensive:

1. **A tier nobody exercised was broken in four places at once.** Lifetime shipped in the pricing
   table and the Worker, and the client forgot it in `decodeToken`, `planName`, the header badge and
   the usage line. Derive a fact once.
2. **Copy rots against the product.** Three high-intent guides told readers to use Acrobat for jobs
   the site had since started doing. When a tool ships, grep the blog for what it used to say was
   impossible.
3. **The test environment is not the runtime.** PBKDF2 at 200,000 iterations passed every unit test
   under Node and failed every login on Workers.
4. **Check what a change switches off.** A blanket `Permissions-Policy` was one keystroke from
   silently killing Scan to PDF, which calls `getUserMedia`. Nothing in CI would have caught it.
