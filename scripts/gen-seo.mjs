// Generates public/sitemap.xml, public/robots.txt and public/llms.txt from the real
// content and tool data. Runs before `vite build` so the files ship with the site.
//
// The content modules are plain TypeScript data with no React imports, so we bundle
// them with esbuild (an explicit devDependency) and import the result.

import { build } from 'esbuild'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

async function loadData() {
  const dir = await mkdtemp(path.join(tmpdir(), 'pxp-seo-'))
  const entry = path.join(dir, 'entry.mjs')
  const out = path.join(dir, 'bundle.mjs')
  await writeFile(
    entry,
    `export { CLUSTERS, ALL_POSTS } from ${JSON.stringify(path.join(ROOT, 'src/content/index.ts'))}
     export { TOOLS } from ${JSON.stringify(path.join(ROOT, 'src/features/pdf/toolsMeta.ts'))}`,
  )
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent' })
  const mod = await import(pathToFileURL(out).href)
  await rm(dir, { recursive: true, force: true })
  return mod
}

async function siteConfig() {
  const file = path.join(PUBLIC, 'site-config.json')
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return {}
  }
}

const iso = (d) => new Date(d).toISOString().slice(0, 10)

async function main() {
  const { CLUSTERS, ALL_POSTS, TOOLS } = await loadData()
  const cfg = await siteConfig()
  const SITE = (process.env.VITE_SITE_URL || cfg?.site?.url || 'https://printxpdf.com').replace(/\/$/, '')
  const hiddenTools = new Set(cfg?.tools?.hidden || [])
  const hiddenPosts = new Set(cfg?.content?.hidden || [])
  const today = iso(Date.now())
  const authorName = cfg?.author?.name || 'Nasir Uddin Shamim'
  const authorRoute = `/author/${String(authorName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`

  // ---------- sitemap ----------
  const urls = [
    { loc: '/', pri: '1.0', freq: 'weekly', mod: today },
    { loc: '/print', pri: '0.9', freq: 'monthly', mod: today },
    { loc: '/tools', pri: '0.9', freq: 'weekly', mod: today },
    { loc: '/blog', pri: '0.8', freq: 'weekly', mod: today },
    { loc: '/pricing', pri: '0.6', freq: 'monthly', mod: today },
    { loc: '/about', pri: '0.5', freq: 'yearly', mod: today },
    { loc: authorRoute, pri: '0.5', freq: 'monthly', mod: today },
    { loc: '/api', pri: '0.6', freq: 'monthly', mod: today },
    { loc: '/wordpress', pri: '0.6', freq: 'monthly', mod: today },
    { loc: '/website-button', pri: '0.6', freq: 'monthly', mod: today },
    { loc: '/extensions/chrome', pri: '0.6', freq: 'monthly', mod: today },
    { loc: '/extension-privacy', pri: '0.3', freq: 'yearly', mod: today },
    { loc: '/privacy', pri: '0.3', freq: 'yearly', mod: today },
    { loc: '/terms', pri: '0.3', freq: 'yearly', mod: today },
    ...TOOLS.filter((t) => !hiddenTools.has(t.slug)).map((t) => ({ loc: `/tools/${t.slug}`, pri: t.status === 'best-effort' ? '0.4' : '0.8', freq: 'monthly', mod: today })),
    ...CLUSTERS.map((c) => ({ loc: `/blog/${c.slug}`, pri: '0.7', freq: 'monthly', mod: today })),
    ...ALL_POSTS.filter((p) => !hiddenPosts.has(p.slug)).map((p) => ({ loc: `/blog/${p.cluster}/${p.slug}`, pri: '0.7', freq: 'monthly', mod: iso(p.updated) })),
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${SITE}${u.loc}</loc>\n    <lastmod>${u.mod}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n')}
</urlset>
`
  await writeFile(path.join(PUBLIC, 'sitemap.xml'), sitemap)

  // ---------- robots ----------
  const robots =
    cfg?.seo?.robotsTxt?.trim() ||
    `# ${SITE}
User-agent: *
Allow: /
Disallow: /admin
Disallow: /account

# AI crawlers are welcome to read and cite these guides.
# A crawler obeys only its most specific matching group, so each one repeats the Disallow
# rules, otherwise these would be the only bots permitted into /admin and /account.
User-agent: GPTBot
Allow: /
Disallow: /admin
Disallow: /account

User-agent: ClaudeBot
Allow: /
Disallow: /admin
Disallow: /account

User-agent: PerplexityBot
Allow: /
Disallow: /admin
Disallow: /account

User-agent: Google-Extended
Allow: /
Disallow: /admin
Disallow: /account

Sitemap: ${SITE}/sitemap.xml
`
  await writeFile(path.join(PUBLIC, 'robots.txt'), robots + '\n')

  // ---------- llms.txt ----------
  const llms =
    cfg?.seo?.llmsTxt?.trim() ||
    `# PrintxPDF

> Free browser-based tools for printing web pages without ads and for working with PDF files. Every browser tool runs client-side using pdf-lib, pdf.js and Tesseract.js, so files stay on the visitor's machine; a few server jobs (PowerPoint ↔ PDF, EPUB and MOBI → PDF, password protect/unlock, PDF/A) run on PrintxPDF's own server at api.printxpdf.com and delete the file the moment they finish.

PrintxPDF has two halves: a web-page cleaner that extracts an article with Mozilla Readability and lets you delete anything left before printing or saving as PDF, and ${TOOLS.length} PDF tools covering merge, split, organise, compress, OCR, sign, watermark, convert and QR generation. A few jobs that need a real engine (PowerPoint ↔ PDF, EPUB and MOBI → PDF, password protect/unlock, PDF/A) run on PrintxPDF's own server at api.printxpdf.com: the file is uploaded over HTTPS, converted and deleted immediately. Free for 5 files a month; more on the Pro ($5/month) and API ($29/month) plans.

Written and maintained by ${authorName}, founder of PrintxPDF: ${SITE}${authorRoute}

## Tools
${TOOLS.filter((t) => !hiddenTools.has(t.slug) && (t.status === 'real' || t.status === 'server'))
  .map((t) => `- [${t.name}](${SITE}/tools/${t.slug}): ${t.short}. ${t.description}`)
  .join('\n')}

## Guides
${CLUSTERS.map(
  (c) => `### ${c.name}
${c.answer}
${c.posts
  .filter((p) => !hiddenPosts.has(p.slug))
  .map((p) => `- [${p.title}](${SITE}/blog/${p.cluster}/${p.slug}): ${p.answer}`)
  .join('\n')}`,
).join('\n\n')}

## Key pages
- [Web page printer](${SITE}/print): paste a URL, strip ads and menus, edit the result, then print or export PDF.
- [All tools](${SITE}/tools): the full index with a status badge on each tool.
- [Print button generator](${SITE}/website-button): a copy-paste HTML snippet that adds a print button to any site.
- [About the founder](${SITE}${authorRoute}): who writes and maintains these guides.
- [Privacy](${SITE}/privacy): browser tools never upload; the server jobs delete the file the moment they finish.
`
  await writeFile(path.join(PUBLIC, 'llms.txt'), llms)

  console.log(`gen-seo: ${urls.length} URLs in sitemap.xml, robots.txt and llms.txt written for ${SITE}`)
}

main().catch((e) => {
  console.error('gen-seo failed:', e)
  process.exit(1)
})
