# printxpdf-api

The PrintxPDF backend: one Cloudflare Worker (`printxpdf-api`, served at `https://api.printxpdf.com`)
plus one Cloudflare Container image (`printxpdf-converter`: Debian + LibreOffice + Calibre) that does
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
  container/Dockerfile  LibreOffice Impress + Calibre + fonts, LO profile warmed at build time
  container/server.py   stdlib HTTP server: validates, converts, streams the result back
  test/*.test.ts        vitest (node): tokens, Stripe form encoding, fetch-proxy URL guard
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
| `POST /convert/warm` | none | boots instance `conv-0` so the first real job is fast |
| `GET /fetch?url=` | none | fetches a public web page as `text/html` (5 MB, 15 s, http/https:80/443 only) |
| `POST /billing/checkout` | none | `{plan:'pro'|'api', email?}` -> Stripe Checkout `{url, id}` |
| `GET /billing/session?id=cs_…` | none | after checkout: verifies the session, mints the token `{token, email, plan, customerId, currentPeriodEnd}` |
| `GET /billing/me` | Bearer | live plan from Stripe (1 h cache) + `usage:{used,limit}`; includes a fresh `token` when the current one expires within 7 days |
| `POST /billing/portal` | Bearer or `{token}` | Stripe customer portal `{url}` |
| `POST /billing/rotate` | Bearer | revokes every older token for the customer, returns a new one |

Conversions: send `multipart/form-data` with a `file` part (or `application/octet-stream` plus an
`x-file-name` header, percent-encoded). `Content-Length` is required, 100 MB max. The response is
the converted file with `content-disposition` and `x-pxp-usage: used/limit`. Status codes you will
see: `401 invalid_token`, `402 subscription_inactive`, `402 quota_exceeded` (free tier) /
`429 quota_exceeded` (paid tier), `413 too_large`, `415 unsupported_media_type`, `415 drm_protected`,
`429 rate_limited` (10 conversions per minute per IP), `503 busy` (all instances leased, retry
after 10 s), `504 timeout` (jobs are killed at 120 s).

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
