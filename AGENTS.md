# Working on PrintxPDF

Conventions an agent needs before touching this repository. `README.md` explains what the product
is; this file explains how to change it without breaking things that have broken before.

## Commands

```bash
npm run dev            # vite, port 5179
npm run build          # gen-seo -> tsc -> vite -> ssr build -> prerender. 177 static pages.
npm test               # 135 tests
npm run lint           # oxlint
npx tsc --noEmit -p tsconfig.app.json

cd worker && npm test  # 67 tests, Worker only
cd worker && npx tsc --noEmit
```

Audits need a built `dist/` and a server on 4175 (`npx serve dist -l 4175`):

```bash
npm run audit:site     # static: links, assets, sitemap, schema. Fast.
npm run audit:layout   # every route in a real browser, desktop and phone. ~8 min.
npm run audit:tools    # all 44 tools with real files, output verified. ~6 min.
npm run audit:features # 21 end-to-end journeys. Runs against production by default.
```

Run `tsc`, `npm test` and `npm run build` before claiming anything works. Run the browser audits
before a release or after touching layout, CSS or tool code.

Do not pipe a test command through `grep` in an `&&` chain. The pipe hides the exit code and a
failing suite will sail through; this has already put a broken commit on `main` once.

## Non-obvious rules

**No em dashes, anywhere.** A test enforces it across source, content and scripts
(`src/content/__tests__/no-em-dash.test.ts`). Use a colon, a comma or a full stop.

**Content rules live in `src/content/validate.ts`**, not in the test file. Three callers run them:
the admin editor as you type, the Worker before it commits, and CI. Change the rules there and all
three follow. Every rule has a fixture that breaks it in `validate.test.ts`; keep that true.

**Blog posts are JSON**, at `src/content/posts/*.json`, one file per cluster, typed as `Cluster` in
`src/content/types.ts`. They were TypeScript until the admin editor needed to write them back.
`src/content/index.ts` holds the slug-to-file map the editor publishes through.

**Browser tools versus server tools.** Most tools run entirely in the tab. Eight upload to the
Worker: `ppt-to-pdf`, `pdf-to-ppt`, `epub-to-pdf`, `mobi-to-pdf`, `protect-pdf`, `unlock-pdf`,
`pdf-to-pdfa`, `ebook-converter`. Never write copy claiming nothing is uploaded on a page that
touches one. This has been wrong three separate times and it is the site's whole positioning.

**Plan labels and quotas come from `PLAN_LABEL` and `PLAN_QUOTA` in `src/lib/api.ts`.** They used
to be re-derived in four ternaries, and `lifetime` was missing from all of them, so a paying
customer saw their plan as Free. Add a plan in one place.

**Workers cap PBKDF2 at 100,000 iterations.** Node does not, so a unit test will happily pass
something the runtime refuses. `MAX_PBKDF2_ITERATIONS` in `worker/src/adminAuth.ts` is a ceiling.

**Prerendering is the SEO surface.** 177 pages are baked at build time. Anything that only appears
after hydration is invisible to crawlers. When changing the content pipeline, prove the output did
not shift: hash `dist/**/*.html` before and after, normalising asset filenames
(`/assets/NAME-HASH.js`), and compare.

## Publishing and secrets

The admin panel at `/admin` edits a draft in the browser. Publishing commits `site-config.json` and
`src/content/posts/*.json` to GitHub through the Worker, and Vercel rebuilds.

The passcode on the `/admin` gate hides the interface and nothing more. The real check is the
Worker: a password hash, a 12-hour signed session, and a GitHub token that never reaches the
browser. Keep it that way. `worker/src/admin.ts` decides every path that may be written; the client
sends content, never filenames.

Secrets are Worker secrets, set with `wrangler secret put`. Never commit one, never print one, and
never ask the user to paste one into the conversation:

| Secret | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | billing and promotion codes |
| `ENTITLEMENT_SECRET` | signs customer entitlement tokens |
| `ADMIN_SECRET` | signs admin sessions, deliberately separate from the above |
| `ADMIN_PASSWORD_HASH` | from `node scripts/admin-password.mjs` |
| `GITHUB_TOKEN` | fine-grained, this repository only, Contents: read and write |

## House style for copy

Plain words over jargon. Say what a thing does, then what it does not do. Never claim a capability
the product lacks, and never hide one it has: three guides once told readers to go and use Acrobat
for jobs this site had started doing.

Numbers in copy must be checked against the code. The OCR page limits, the quotas and the tool
count are all enforced somewhere; find it before writing it.

## Deploying

```bash
git push origin main                              # Vercel builds and deploys the site
cd worker && npx wrangler deploy --containers-rollout none   # Worker only
```

`--containers-rollout none` skips rebuilding the 1.8 GB converter image, which needs Docker and
takes a long time to produce an identical result. Drop the flag only when `worker/container/` has
actually changed.

After a content change, tell IndexNow: `npm run indexnow`. It reaches Bing, Yandex, Seznam and
Naver. Google does not participate in IndexNow, so nothing there speeds Google up.

## Where the history is

`tasks/todo.md` records each phase and what it found. `tasks/lessons.md` records mistakes worth not
repeating. Read both before a large change; they are why several of the rules above exist.
