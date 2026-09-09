// Bakes static HTML for every content route after `vite build`.
//
// The site is a client-rendered SPA. Googlebot executes JavaScript, but most AI crawlers
// (GPTBot, ClaudeBot, PerplexityBot) and every social scraper do not — they would otherwise
// see an empty <div id="root">. This writes a real <title>, meta tags, JSON-LD and the full
// article text into dist/<route>/index.html. React replaces the markup on mount, so users
// get the interactive app and crawlers get the content.

import { build } from 'esbuild'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST = path.join(ROOT, 'dist')

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Content strings carry **bold**, [text](/path) and `code`. */
function rich(x = '') {
  return esc(x)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function blocksToHtml(body = []) {
  return body
    .map((b) => {
      switch (b.t) {
        case 'p':
          return `<p>${rich(b.x)}</p>`
        case 'h2':
          return `<h2 id="${slugify(b.x)}">${esc(b.x)}</h2>`
        case 'h3':
          return `<h3 id="${slugify(b.x)}">${esc(b.x)}</h3>`
        case 'ul':
          return `<ul>${b.items.map((i) => `<li>${rich(i)}</li>`).join('')}</ul>`
        case 'ol':
          return `<ol>${b.items.map((i) => `<li>${rich(i)}</li>`).join('')}</ol>`
        case 'steps':
          return `<ol>${b.items.map((i) => `<li><strong>${esc(i.h)}</strong> ${rich(i.x)}</li>`).join('')}</ol>`
        case 'table':
          return `<table><thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${rich(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>${b.caption ? `<p><small>${esc(b.caption)}</small></p>` : ''}`
        case 'note':
        case 'tip':
        case 'warn':
          return `<p><strong>${b.t === 'warn' ? 'Watch out' : b.t === 'tip' ? 'Tip' : 'Note'}:</strong> ${rich(b.x)}</p>`
        case 'quote':
          return `<blockquote>${rich(b.x)}</blockquote>`
        case 'code':
          return `<pre><code>${esc(b.x)}</code></pre>`
        case 'cta':
          return `<p><a href="/tools/${esc(b.tool)}">${rich(b.x)}</a></p>`
        default:
          return ''
      }
    })
    .join('\n')
}

async function loadData() {
  const dir = await mkdtemp(path.join(tmpdir(), 'pxp-pre-'))
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

function pageHtml(shell, { title, description, canonical, keywords, schema, bodyHtml, published, updated }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    keywords?.length ? `<meta name="keywords" content="${esc(keywords.join(', '))}">` : '',
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta property="og:type" content="${published ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="PrintxPDF">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    published ? `<meta property="article:published_time" content="${esc(published)}">` : '',
    updated ? `<meta property="article:modified_time" content="${esc(updated)}">` : '',
    ...(schema || []).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ')

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
}

async function writeRoute(route, html) {
  const dir = path.join(DIST, route.replace(/^\//, ''))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), html)
}

async function main() {
  const { CLUSTERS, ALL_POSTS, TOOLS } = await loadData()
  let cfg = {}
  try {
    cfg = JSON.parse(await readFile(path.join(ROOT, 'public/site-config.json'), 'utf8'))
  } catch {
    /* defaults */
  }
  const SITE = (process.env.VITE_SITE_URL || cfg?.site?.url || 'https://printxpdf.vercel.app').replace(/\/$/, '')
  // GitHub Pages serves from /<repo>/, so crawler-visible links need that prefix too
  const BASE = (process.env.VITE_BASE || '/').replace(/\/$/, '')
  const href = (p) => `${BASE}${p}`
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8')
  const publisher = { '@type': 'Organization', name: 'PrintxPDF', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` } }
  const crumbs = (trail) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${SITE}${t.path}` })),
  })

  let count = 0

  // ---------- posts ----------
  for (const p of ALL_POSTS) {
    const cluster = CLUSTERS.find((c) => c.slug === p.cluster)
    const route = `/blog/${p.cluster}/${p.slug}`
    const steps = p.body.find((b) => b.t === 'steps')
    const schema = [
      crumbs([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/blog' },
        { name: cluster?.name || p.cluster, path: `/blog/${p.cluster}` },
        { name: p.title, path: route },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: p.title,
        description: p.metaDescription,
        abstract: p.answer,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${route}` },
        datePublished: p.published,
        dateModified: p.updated,
        author: publisher,
        publisher,
        keywords: [p.primaryKeyword, ...p.secondaryKeywords, ...p.entities].join(', '),
        timeRequired: `PT${p.readMinutes}M`,
        inLanguage: 'en',
        isAccessibleForFree: true,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.post-answer', 'h1'] },
      },
      p.faqs?.length && {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
      steps && {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: p.title,
        description: p.metaDescription,
        totalTime: 'PT3M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
        step: steps.items.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.h, text: s.x, url: `${SITE}${route}#step-${i + 1}` })),
      },
    ].filter(Boolean)

    const bodyHtml = `<article>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/blog')}">Guides</a> / <a href="${href(`/blog/${p.cluster}`)}">${esc(cluster?.name || p.cluster)}</a></nav>
  <h1>${esc(p.title)}</h1>
  <p><em>Updated ${esc(p.updated)} · ${p.readMinutes} min read</em></p>
  <div class="post-answer"><p><strong>Short answer:</strong> ${esc(p.answer)}</p></div>
  ${blocksToHtml(p.body)}
  ${p.faqs?.length ? `<h2 id="faq">Frequently asked questions</h2>${p.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${rich(f.a)}</p>`).join('')}` : ''}
  ${p.relatedTools?.length ? `<h2>Tools</h2><ul>${p.relatedTools.map((t) => `<li><a href="${href(`/tools/${esc(t)}`)}">${esc(TOOLS.find((x) => x.slug === t)?.name || t)}</a></li>`).join('')}</ul>` : ''}
  ${p.relatedPosts?.length ? `<h2>Keep reading</h2><ul>${p.relatedPosts.map((s) => { const r = ALL_POSTS.find((x) => x.slug === s); return r ? `<li><a href="${href(`/blog/${r.cluster}/${r.slug}`)}">${esc(r.title)}</a></li>` : '' }).join('')}</ul>` : ''}
</article>`

    await writeRoute(
      route,
      pageHtml(shell, { title: p.metaTitle, description: p.metaDescription, canonical: `${SITE}${route}`, keywords: [p.primaryKeyword, ...p.secondaryKeywords], schema, bodyHtml, published: p.published, updated: p.updated }),
    )
    count++
  }

  // ---------- cluster pillars ----------
  for (const c of CLUSTERS) {
    const route = `/blog/${c.slug}`
    const schema = [
      crumbs([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/blog' },
        { name: c.name, path: route },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: c.title,
        description: c.metaDescription,
        url: `${SITE}${route}`,
        about: c.entities.map((e) => ({ '@type': 'Thing', name: e })),
        hasPart: c.posts.map((p) => ({ '@type': 'Article', headline: p.title, url: `${SITE}/blog/${c.slug}/${p.slug}` })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: c.posts.map((p) => ({ '@type': 'Question', name: p.title, acceptedAnswer: { '@type': 'Answer', text: p.answer } })),
      },
    ]
    const bodyHtml = `<main>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/blog')}">Guides</a></nav>
  <h1>${esc(c.title)}</h1>
  <div class="post-answer"><p><strong>Short answer:</strong> ${esc(c.answer)}</p></div>
  <p>${esc(c.intro)}</p>
  <h2>Every guide in this topic</h2>
  <ul>${c.posts.map((p) => `<li><a href="${href(`/blog/${c.slug}/${p.slug}`)}">${esc(p.title)}</a> — ${esc(p.metaDescription)}</li>`).join('')}</ul>
  <h2>Tools for this job</h2>
  <ul>${c.tools.map((t) => `<li><a href="${href(`/tools/${esc(t)}`)}">${esc(TOOLS.find((x) => x.slug === t)?.name || t)}</a></li>`).join('')}</ul>
</main>`
    await writeRoute(route, pageHtml(shell, { title: c.metaTitle, description: c.metaDescription, canonical: `${SITE}${route}`, keywords: [c.primaryKeyword, ...c.entities], schema, bodyHtml }))
    count++
  }

  // ---------- blog hub ----------
  {
    const route = '/blog'
    const bodyHtml = `<main>
  <h1>Printing and PDF guides</h1>
  <p>${esc(ALL_POSTS.length)} guides across ${CLUSTERS.length} topics on printing web pages without ads and working with PDF files in the browser.</p>
  ${CLUSTERS.map((c) => `<h2><a href="${href(`/blog/${c.slug}`)}">${esc(c.name)}</a></h2><p>${esc(c.answer)}</p><ul>${c.posts.map((p) => `<li><a href="${href(`/blog/${c.slug}/${p.slug}`)}">${esc(p.title)}</a></li>`).join('')}</ul>`).join('')}
</main>`
    await writeRoute(
      route,
      pageHtml(shell, {
        title: 'Printing & PDF Guides — PrintxPDF Blog',
        description: `${ALL_POSTS.length} free guides on printing web pages without ads, merging and compressing PDFs, e-signatures, OCR and more.`,
        canonical: `${SITE}${route}`,
        schema: [
          crumbs([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/blog' },
          ]),
          { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'PrintxPDF guides', url: `${SITE}/blog`, hasPart: CLUSTERS.map((c) => ({ '@type': 'WebPage', name: c.title, url: `${SITE}/blog/${c.slug}` })) },
        ],
        bodyHtml,
      }),
    )
    count++
  }

  // ---------- tools ----------
  for (const t of TOOLS) {
    const route = `/tools/${t.slug}`
    const guides = ALL_POSTS.filter((p) => p.relatedTools?.includes(t.slug)).slice(0, 5)
    const schema = [
      crumbs([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools' },
        { name: t.name, path: route },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t.name,
        description: t.description,
        url: `${SITE}${route}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (web browser)',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher,
      },
      guides.length && {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guides.map((g) => ({ '@type': 'Question', name: g.title, acceptedAnswer: { '@type': 'Answer', text: g.answer } })),
      },
    ].filter(Boolean)
    const bodyHtml = `<main>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/tools')}">Tools</a></nav>
  <h1>${esc(t.name)}</h1>
  <p>${esc(t.description)}</p>
  <p>${t.status === 'real' ? 'Runs entirely in your browser. Your file is never uploaded.' : t.status === 'best-effort' ? 'Best-effort conversion in your browser.' : 'Demo interface — this format needs server-side conversion.'}</p>
  ${guides.length ? `<h2>Guides that use this tool</h2><ul>${guides.map((g) => `<li><a href="${href(`/blog/${g.cluster}/${g.slug}`)}">${esc(g.title)}</a></li>`).join('')}</ul>` : ''}
</main>`
    await writeRoute(route, pageHtml(shell, { title: `${t.name} — Free, In Your Browser`, description: `${t.description} No upload, no sign-up.`.slice(0, 158), canonical: `${SITE}${route}`, keywords: [t.name.toLowerCase(), `${t.name.toLowerCase()} free`, `${t.name.toLowerCase()} online`], schema, bodyHtml }))
    count++
  }

  // ---------- tools index ----------
  {
    const route = '/tools'
    const bodyHtml = `<main><h1>All ${TOOLS.length} PDF tools</h1><ul>${TOOLS.map((t) => `<li><a href="${href(`/tools/${t.slug}`)}">${esc(t.name)}</a> — ${esc(t.short)}</li>`).join('')}</ul></main>`
    await writeRoute(
      route,
      pageHtml(shell, {
        title: `All ${TOOLS.length} PDF Tools — Free, In Your Browser`,
        description: `Merge, split, compress, convert, sign, watermark and OCR PDFs free. ${TOOLS.length} tools that run in your browser with no upload.`,
        canonical: `${SITE}${route}`,
        schema: [
          crumbs([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
          ]),
          { '@context': 'https://schema.org', '@type': 'ItemList', numberOfItems: TOOLS.length, itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SITE}/tools/${t.slug}` })) },
        ],
        bodyHtml,
      }),
    )
    count++
  }

  console.log(`prerender: ${count} static pages written into dist/`)
}

main().catch((e) => {
  console.error('prerender failed:', e)
  process.exit(1)
})
