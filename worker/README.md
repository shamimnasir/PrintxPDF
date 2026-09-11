# printxpdf-api

The PrintxPDF backend: one Cloudflare Worker (`printxpdf-api`, served at `https://api.printxpdf.com`)
plus one Cloudflare Container image (`printxpdf-converter`: Debian + LibreOffice + Calibre + qpdf) that does
the conversions the browser cannot do on its own. The Worker owns CORS, entitlement tokens,
monthly quotas, Stripe billing and a public HTML fetch proxy; the container only converts files.

```
worker/
  wrangler.jsonc        bindings, vars, rate limits, container + Durable Object config
  src/index.ts          router, CORS, {error, code} envelope
  src/convert.ts        /convert/* : entitlement -> quota -> lease an instance -> stream to container
  src/container.ts      Converter Durable Object (one job per instance, 5 min idle sleep)
  src/billing.ts        Stripe Checkout / Portal / subscription status, token issue + rotate
  src/stripe.ts         tiny Stripe REST client (no SDK), form encoding, StripeError
  src/token.ts          pxp_ HMAC tokens (mint / verify)
  src/quota.ts          KV keys: q:<yyyymm>:<subject>, sub:<cus>, kmin:<cus>
  src/fetchProxy.ts     GET /fetch SSRF-guarded HTML proxy
  src/cors.ts, http.ts  CORS allow-list, JSON helpers, rate-limit helper
  src/kinds.ts          the conversion registry: kinds, accepted extensions, extra fields
  container/Dockerfile  LibreOffice Impress + Calibre + qpdf + fonts, LO profile warmed at build time
  container/server.py   stdlib HTTP server: validates, converts, streams the result back
  container/test_server.py  unittest: multipart fields, qpdf argv, permission/level maps
  test/*.test.ts        vitest (node): tokens, Stripe form encoding, fetch-proxy URL guard, kinds
```

## Endpoints

All errors are JSON `{ "error": "...", "code": "..." }` with a real HTTP status. CORS is only
sent to origins listed in `SITE_ORIGINS` (`/fetch` is public and answers `*`).

| Method + path | Auth | What it does |
|---|---|---|
| `GET /health`, `GET /` | none | `{ok:true, version}` |
| `POST /convert/ppt-to-pdf` | optional Bearer | `.ppt .pptx .pps .ppsx .odp` -> PDF (LibreOffice) |
| `POST /convert/pdf-to-ppt` | optional Bearer | `.pdf` -> PPTX (LibreOffice pdf import) |
| `POST /convert/epub-to-pdf` | optional Bearer | `.epub` -> PDF (Calibre) |
| `POST /convert/mobi-to-pdf` | optional Bearer | `.mobi .azw .azw3 .prc` -> PDF (Calibre) |
| `POST /convert/protect-pdf` | optional Bearer | `.pdf` -> AES-256 encrypted PDF (qpdf) |
| `POST /convert/unlock-pdf` | optional Bearer | `.pdf` -> decrypted PDF (qpdf) |
| `POST /convert/pdf-to-pdfa` | optional Bearer | `.pdf` -> PDF/A-1b/2b/3b (LibreOffice) |
| `POST /convert/warm` | none | boots instance `conv-0` so the first real job is fast |
| `GET /fetch?url=` | none | fetches a public web page as `text/html` (5 MB, 15 s, http/https:80/443 only) |
| `POST /billing/checkout` | none | `{plan:'pro'|'api', email?}` -> Stripe Checkout `{url, id}` |
| `GET /billing/session?id=cs_…` | none | after checkout: verifies the session, mints the token `{token, email, plan, customerId, currentPeriodEnd}` |
| `GET /billing/me` | Bearer | live plan from Stripe (1 h cache) + `usage:{used,limit}`; includes a fresh `token` when the current one expires within 7 days |
| `POST /billing/portal` | Bearer or `{token}` | Stripe customer portal `{url}` |
| `POST /billing/rotate` | Bearer | revokes every older token for the customer, returns a new one |

Conversions: send `multipart/form-data` with a `file` part (or `application/octet-stream` plus an
`x-file-name` header, percent-encoded). Three of them take extra multipart text fields:

| Kind | Field | Values |
|---|---|---|
| `protect-pdf` | `password` (required), `ownerPassword` (optional, defaults to `password`), `permissions` | `all` \| `no-print` \| `no-copy` \| `no-print-copy` |
| `unlock-pdf` | `password` (may be empty) | |
| `pdf-to-pdfa` | `level` | `1b` \| `2b` \| `3b` (default `1b`) |

`permissions` maps to qpdf's 256-bit restriction flags: `no-print` -> `--print=none`,
`no-copy` -> `--extract=n`, `no-print-copy` -> both, `all` -> no flags. Accessibility
extraction is never disabled. Passwords are read from the multipart body straight into
memory, handed to qpdf through stdin (`qpdf @-` reads one argument per line), so they never
reach `/proc/<pid>/cmdline`, a temp file, or a log line; anything qpdf prints is scrubbed of
them before it is logged or returned.

`protect-pdf` refuses an already-encrypted input with `400 already_encrypted` rather than
double-encrypting. `unlock-pdf` answers `400 password_required` when the PDF needs a password
and none was sent, `400 wrong_password` when the one sent does not open it (both decided by
`qpdf --requires-password`: exit 0 = still needs one, 2 = not encrypted, 3 = correct), and
`500 conversion_failed` when the file is simply broken. An unencrypted PDF passes through. `Content-Length` is required, 100 MB max. The response is
the converted file with `content-disposition` and `x-pxp-usage: used/limit`. Status codes you will
see: `401 invalid_token`, `402 subscription_inactive`, `402 quota_exceeded` (free tier) /
`429 quota_exceeded` (paid tier), `413 too_large`, `415 unsupported_media_type`, `415 drm_protected`,
`400 password_required`, `400 wrong_password`, `400 already_encrypted`,
`429 rate_limited` (10 conversions per minute per IP), `503 busy` (all instances leased, retry
after 10 s), `504 timeout` (jobs are killed at 120 s).

Guard order in `handleConvert` (worth knowing when testing against a used-up quota): rate
limit -> `Content-Length` (411/400) -> `413 too_large` -> content-type `415` -> entitlement
(401/402) -> monthly quota (402/429) -> instance lease (503) -> the container. So the
container's own checks (wrong file type, bad `permissions`/`level`, passwords) run *after*
the quota check; only the Worker's own guards are reachable once the quota is spent.

Free users are identified by a salted hash of their IP; paid users by their Stripe customer id.
Quotas are per calendar month (UTC): `QUOTA_FREE=5`, `QUOTA_PRO=300`, `QUOTA_API=5000`.

Until `STRIPE_SECRET_KEY` is set, every billing route answers
`503 {"error":"Billing is not configured yet","code":"billing_not_configured"}`.

## Secrets

| Secret | Who sets it | Notes |
|---|---|---|
| `ENTITLEMENT_SECRET` | already set | HMAC key for tokens and the IP salt. Rotating it invalidates every token. |
| `STRIPE_SECRET_KEY` | you | see below |

Set the Stripe key with:

```bash
cd worker && npx wrangler secret put STRIPE_SECRET_KEY
```

Use a **restricted key** (Stripe Dashboard -> Developers -> API keys -> Create restricted key) with
exactly these permissions: Checkout Sessions **Write**, Customers **Read**, Subscriptions **Read**,
Billing Portal **Write**, Prices **Read**, Products **Read**. Nothing else is needed.

Then point the vars at your real prices: edit `PRICE_PRO` and `PRICE_API` in `wrangler.jsonc`
(the `price_...` ids of the recurring Pro and API prices) and redeploy. `SITE_ORIGINS` is the CORS
allow-list and also decides which origin the Stripe success/cancel URLs point back to.

## Commands

```bash
cd worker
npm install
npm run check          # tsc --noEmit
npm test               # vitest
npm run types          # regenerate worker-configuration.d.ts after editing wrangler.jsonc
npm run dev            # wrangler dev (needs Docker for the container)
npm run deploy         # wrangler deploy: builds + pushes the image, rolls the container out
npm run tail           # live logs: wrangler tail printxpdf-api --format pretty
npx wrangler containers list      # container application status
npx wrangler containers images list
npx wrangler deployments list     # then: npx wrangler rollback <version-id>
```

Deploying needs a running Docker daemon on this Mac (Colima):

```bash
colima start --cpu 4 --memory 6 --disk 40
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
```

If `docker build` complains about `docker-credential-desktop`, point Docker at a clean config for
the session: `mkdir -p /tmp/dockercfg && echo '{}' > /tmp/dockercfg/config.json && export DOCKER_CONFIG=/tmp/dockercfg`.

Skip the image when only Worker code changed: `npx wrangler deploy --containers-rollout=none`.

## How a conversion flows

1. Worker checks rate limit, `Content-Length`, content type, then the entitlement (token -> Stripe status, or IP hash -> free) and the month's quota in KV.
2. It asks Durable Objects `conv-0`, `conv-1` for a lease (`POST /_acquire`); each runs one job at a time.
3. The upload is streamed straight through to the container (`FixedLengthStream`, no buffering in the Worker), converted by LibreOffice or Calibre in a throwaway work dir, and streamed back.
4. On success the quota counter is incremented in the background and the file is returned with `x-pxp-usage`.

Instances sleep after 5 minutes idle; the first job after that pays a 20-60 s cold start, which is
what `POST /convert/warm` is for (call it when the user lands on a converter page).

## Operational notes (from the first deploy, 2026-09-10)

- Deployed as Worker `printxpdf-api`, container application `printxpdf-converter`
  (id `a03ecc13-125c-46dd-80c4-32748e070405`, `standard-1`, max 2 instances), custom domain
  `api.printxpdf.com` (Cloudflare created the DNS record and certificate itself).
- Image: ~460 MB, builds in ~7 min on the Mac; each conversion of a small file takes 1-3 s warm.
- `x-pxp-usage` and the quota counter live in KV, which caches reads for up to 60 s per location.
  Rapid bursts can under-count by one or two before the 402 kicks in; treat the header as informational.
- Cloudflare's edge buffers request bodies and supplies `Content-Length` even when a client streams
  with `Transfer-Encoding: chunked`, so the Worker's 411 path is effectively only a safety net.
- Right after a deploy the new hostname can take a few minutes to reach every resolver; to test early,
  `curl --resolve api.printxpdf.com:443:<cloudflare ip from dig>`.
- Free-tier quota is keyed by a salted IP hash; everyone behind one NAT shares it.

## Admin panel and publishing

The panel at `/admin` edits a draft in the browser. Publishing it commits to GitHub and Vercel
rebuilds, so the change reaches crawlers as prerendered HTML rather than only live visitors.

Three secrets turn publishing on. Until all three exist, `/admin/publish` answers 503 and the
panel says so, while the manual download-and-commit route keeps working.

```bash
# 1. A password only you know. The script prints a PBKDF2 hash; the password is never stored.
node scripts/admin-password.mjs
cd worker && npx wrangler secret put ADMIN_PASSWORD_HASH

# 2. Signs admin sessions. Separate from ENTITLEMENT_SECRET on purpose: a customer's paid
#    entitlement must never be presentable as an admin session.
openssl rand -base64 48 | npx wrangler secret put ADMIN_SECRET

# 3. A fine-grained GitHub PAT, scoped to this repository alone, Contents: read and write.
#    Nothing else. Create it at github.com/settings/personal-access-tokens
npx wrangler secret put GITHUB_TOKEN

npx wrangler deploy
```

`GITHUB_OWNER`, `GITHUB_REPO` and `GITHUB_BRANCH` are plain vars in `wrangler.jsonc`.

### What the endpoints do

| Route | Purpose |
| --- | --- |
| `POST /admin/login` | Password in, 12-hour session out. Rate limited, and locks out an IP for 15 minutes after 10 failures. |
| `GET /admin/me` | Confirms the session and returns the commit a draft should be published against. |
| `POST /admin/publish` | Re-runs the content rules, then writes one atomic commit. |
| `POST /admin/signout-everywhere` | Moves a watermark so every outstanding session stops working at once. |

### Why it is shaped this way

The GitHub token never reaches the browser. A stolen admin session expires the same day and can
only call these four routes; a stolen token would not expire and could rewrite the repository.

This module decides every path that gets written: the client sends content, never filenames, so an
authenticated session still cannot reach `.github/workflows` or the source of the site. Writes are
confined to `src/content/posts/*.json` and `public/site-config.json`.

The content rules in `src/content/validate.ts` run in the browser so a writer sees a problem while
typing, and again here because a client-side check protects nothing. A publish that would fail CI
is refused with a 422 listing what is wrong, so the build cannot be broken from the panel.
