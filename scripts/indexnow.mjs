// Tells IndexNow that pages changed, instead of waiting for a crawler to notice.
//
//   node scripts/indexnow.mjs                 every URL in the sitemap
//   node scripts/indexnow.mjs /pricing /blog  just these
//   node scripts/indexnow.mjs --dry-run       show what would be sent
//
// Who actually listens: Bing, Yandex, Seznam and Naver share one IndexNow pool, so submitting
// once reaches all of them. Google does not participate in IndexNow at all; it finds changes
// through the sitemap and Search Console, and nothing here speeds that up.
//
// The key is public by design. It proves control of the domain only because it is readable at
// https://<host>/<key>.txt, so there is nothing to hide and nothing to rotate unless the file goes.
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const HOST = 'printxpdf.com'
const ORIGIN = `https://${HOST}`
/** IndexNow caps a single submission at 10,000 URLs. */
const MAX_URLS = 10_000

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const explicit = args.filter((a) => !a.startsWith('--'))

/** The key file in public/ is the single source of truth, so the two can never disagree. */
async function findKey() {
  const files = await readdir(path.join(ROOT, 'public'))
  const candidates = files.filter((f) => /^[a-f0-9]{8,128}\.txt$/i.test(f))
  if (candidates.length !== 1) {
    throw new Error(
      candidates.length
        ? `Found ${candidates.length} key files in public/: ${candidates.join(', ')}. Keep exactly one.`
        : 'No IndexNow key file in public/. Create one: KEY=$(openssl rand -hex 16); printf "%s" "$KEY" > "public/$KEY.txt"',
    )
  }
  const key = candidates[0].replace(/\.txt$/i, '')
  const contents = (await readFile(path.join(ROOT, 'public', candidates[0]), 'utf8')).trim()
  if (contents !== key) throw new Error(`public/${candidates[0]} must contain exactly "${key}", but holds "${contents}"`)
  return key
}

async function sitemapUrls() {
  const xml = await readFile(path.join(ROOT, 'dist/sitemap.xml'), 'utf8').catch(() => {
    throw new Error('dist/sitemap.xml is missing. Run `npm run build` first.')
  })
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const key = await findKey()
const urlList = (explicit.length ? explicit.map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`)) : await sitemapUrls()).slice(0, MAX_URLS)

const foreign = urlList.filter((u) => !u.startsWith(`${ORIGIN}/`) && u !== ORIGIN)
if (foreign.length) throw new Error(`These are not on ${HOST}, and IndexNow rejects the whole batch for one: ${foreign.slice(0, 3).join(', ')}`)

const body = { host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList }

console.log(`IndexNow: ${urlList.length} URLs`)
console.log(`  key      ${key}`)
console.log(`  verified ${body.keyLocation}`)

if (dryRun) {
  console.log('\n--dry-run, nothing sent. First five:')
  urlList.slice(0, 5).forEach((u) => console.log(`  ${u}`))
  process.exit(0)
}

// The key file has to be reachable before the endpoint will trust the submission, so check the
// live site rather than the local copy: a key that only exists in public/ has not shipped yet.
const check = await fetch(body.keyLocation).catch(() => null)
if (!check?.ok || (await check.text()).trim() !== key) {
  console.error(`\nThe key file is not live at ${body.keyLocation}.`)
  console.error('Deploy first: the endpoint fetches this to confirm you control the domain.')
  process.exit(1)
}
console.log('  key file is live and matches')

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})

const MEANING = {
  200: 'accepted',
  202: 'accepted, key still being validated',
  400: 'bad request: the payload was malformed',
  403: 'key rejected: the key file did not verify',
  422: 'rejected: a URL does not belong to this host, or the key does not match',
  429: 'too many requests: slow down',
}
const text = await res.text().catch(() => '')
console.log(`\n${res.status} ${MEANING[res.status] ?? res.statusText}${text ? ` — ${text.slice(0, 200)}` : ''}`)
process.exit(res.status === 200 || res.status === 202 ? 0 : 1)
