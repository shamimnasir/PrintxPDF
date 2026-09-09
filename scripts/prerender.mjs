// Bakes static HTML for every content route after `vite build`.
//
// The site is a client-rendered SPA. Googlebot executes JavaScript, but most AI crawlers
// (GPTBot, ClaudeBot, PerplexityBot) and every social scraper do not, they would otherwise
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

// set from VITE_BASE in main(); GitHub Pages serves the site from /<repo>/
let BASE = ''
// the published design preset: crawlers and first paint should match what the runtime will apply
let DESIGN = 'blocks'
let DESIGN_FONT = null
const href = (p) => (p.startsWith('/') ? `${BASE}${p}` : p)

/** Content strings carry **bold**, [text](/path) and `code`. */
function rich(x = '') {
  return esc(x)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => `<a href="${href(url)}">${text}</a>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

/** Markdown stripped to plain text. Structured data is rendered verbatim by Google,
 *  so bracket-paren link syntax must never reach it. */
const plain = (x = '') =>
  String(x)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')

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
          return `<p><a href="${href(`/tools/${esc(b.tool)}`)}">${rich(b.x)}</a></p>`
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
     export { TOOLS } from ${JSON.stringify(path.join(ROOT, 'src/features/pdf/toolsMeta.ts'))}
     export { TOOL_CONTENT } from ${JSON.stringify(path.join(ROOT, 'src/content/tools/index.ts'))}
     export { fontHref, isDesignId } from ${JSON.stringify(path.join(ROOT, 'src/design/presets.ts'))}`,
  )
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent' })
  const mod = await import(pathToFileURL(out).href)
  await rm(dir, { recursive: true, force: true })
  return mod
}

function pageHtml(shell, { title, description, canonical, keywords, schema, bodyHtml, published, updated, noindex }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    keywords?.length ? `<meta name="keywords" content="${esc(keywords.join(', '))}">` : '',
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">`,
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

  if (!shell.includes('<div id="root"></div>')) {
    throw new Error('prerender: could not find <div id="root"></div> in dist/index.html, the shell changed, so no content would be baked in.')
  }
  if (!shell.includes('</head>')) throw new Error('prerender: no </head> in dist/index.html')
  const fontLink = DESIGN_FONT ? `<link id="pxp-design-font" rel="stylesheet" href="${esc(DESIGN_FONT)}">\n    ` : ''
  return shell
    .replace(/<html([^>]*)>/, (_m, attrs) => `<html${attrs.replace(/\s*data-design="[^"]*"/, '')} data-design="${DESIGN}">`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `  ${fontLink}${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`)
}

async function writeRoute(route, html) {
  const dir = path.join(DIST, route.replace(/^\//, ''))
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, 'index.html'), html)
}

async function main() {
  const { CLUSTERS, ALL_POSTS, TOOLS, TOOL_CONTENT, fontHref, isDesignId } = await loadData()
  let cfg = {}
  try {
    cfg = JSON.parse(await readFile(path.join(ROOT, 'public/site-config.json'), 'utf8'))
  } catch {
    /* defaults */
  }
  const SITE = (process.env.VITE_SITE_URL || cfg?.site?.url || 'https://printxpdf.com').replace(/\/$/, '')
  BASE = (process.env.VITE_BASE || '/').replace(/\/$/, '')
  DESIGN = isDesignId(cfg?.theme?.design) ? cfg.theme.design : 'blocks'
  DESIGN_FONT = fontHref(DESIGN)
  const hiddenTools = new Set(cfg?.tools?.hidden || [])
  const hiddenPosts = new Set(cfg?.content?.hidden || [])
  const noindexAll = !!cfg?.seo?.noindexAll
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8')
  const publisher = { '@type': 'Organization', name: 'PrintxPDF', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` } }
  // the founder is credited on every guide; the runtime reads the same block from site-config.json
  const author = { name: 'Nasir Uddin Shamim', title: 'Founder, PrintxPDF', bio: '', photo: '', links: {}, ...(cfg?.author || {}) }
  const authorRoute = `/author/${slugify(author.name)}`
  const person = {
    '@type': 'Person',
    '@id': `${SITE}${authorRoute}#person`,
    name: author.name,
    jobTitle: author.title,
    url: `${SITE}${authorRoute}`,
    ...(author.photo ? { image: author.photo } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    sameAs: Object.values(author.links || {}).filter(Boolean),
    worksFor: publisher,
  }
  const org = { ...publisher, founder: person }
  const avatar = author.photo ? `<img class="avatar" src="${esc(author.photo)}" alt="${esc(author.name)}" width="32" height="32">` : ''
  const byline = `<p class="byline">${avatar}By <a href="${href(authorRoute)}">${esc(author.name)}</a></p>`
  const authorBox = `<aside class="author-box">
  ${author.photo ? `<img class="avatar" src="${esc(author.photo)}" alt="${esc(author.name)}" width="72" height="72">` : ''}
  <div class="author-box-body">
    <span class="label">Written by</span>
    <h3><a href="${href(authorRoute)}">${esc(author.name)}</a></h3>
    <p class="author-box-title">${esc(author.title)}</p>
    ${author.bio ? `<p>${esc(author.bio)}</p>` : ''}
    <p><a href="${href(authorRoute)}">All guides by ${esc(author.name.split(' ')[0])}</a></p>
  </div>
</aside>`
  const crumbs = (trail) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: `${SITE}${t.path}` })),
  })

  let count = 0

  // ---------- posts ----------
  for (const p of ALL_POSTS.filter((x) => !hiddenPosts.has(x.slug))) {
    const cluster = CLUSTERS.find((c) => c.slug === p.cluster)
    const route = `/blog/${p.cluster}/${p.slug}`
    const stepBlocks = p.body.flatMap((b, i) => (b.t === 'steps' ? [{ block: b, index: i }] : []))
    const allSteps = stepBlocks.flatMap(({ block }) => block.items)
    const stepAnchors = stepBlocks.flatMap(({ block, index }) => block.items.map((_, i) => `step-${index}-${i + 1}`))
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
        abstract: plain(p.answer),
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${route}` },
        datePublished: p.published,
        dateModified: p.updated,
        author: person,
        publisher: org,
        keywords: [p.primaryKeyword, ...p.secondaryKeywords, ...p.entities].join(', '),
        timeRequired: `PT${p.readMinutes}M`,
        inLanguage: 'en',
        isAccessibleForFree: true,
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.post-answer', 'h1'] },
      },
      p.faqs?.length && {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: p.faqs.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
      },
      allSteps.length && {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: p.title,
        description: p.metaDescription,
        totalTime: 'PT3M',
        estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
        step: allSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: plain(s.h), text: plain(s.x), url: `${SITE}${route}#${stepAnchors[i]}` })),
      },
    ].filter(Boolean)

    const bodyHtml = `<article>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/blog')}">Guides</a> / <a href="${href(`/blog/${p.cluster}`)}">${esc(cluster?.name || p.cluster)}</a></nav>
  <h1>${esc(p.title)}</h1>
  ${byline}
  <p><em>Updated ${esc(p.updated)} · ${p.readMinutes} min read</em></p>
  <div class="post-answer"><p><strong>Short answer:</strong> ${rich(p.answer)}</p></div>
  ${blocksToHtml(p.body)}
  ${p.faqs?.length ? `<h2 id="faq">Frequently asked questions</h2>${p.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${rich(f.a)}</p>`).join('')}` : ''}
  ${p.relatedTools?.length ? `<h2>Tools</h2><ul>${p.relatedTools.map((t) => `<li><a href="${href(`/tools/${esc(t)}`)}">${esc(TOOLS.find((x) => x.slug === t)?.name || t)}</a></li>`).join('')}</ul>` : ''}
  ${authorBox}
  ${p.relatedPosts?.length ? `<h2>Keep reading</h2><ul>${p.relatedPosts.map((s) => { const r = ALL_POSTS.find((x) => x.slug === s); return r ? `<li><a href="${href(`/blog/${r.cluster}/${r.slug}`)}">${esc(r.title)}</a></li>` : '' }).join('')}</ul>` : ''}
</article>`

    await writeRoute(
      route,
      pageHtml(shell, { noindex: noindexAll, title: p.metaTitle, description: p.metaDescription, canonical: `${SITE}${route}`, keywords: [p.primaryKeyword, ...p.secondaryKeywords], schema, bodyHtml, published: p.published, updated: p.updated }),
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
        mainEntity: c.posts.map((p) => ({ '@type': 'Question', name: plain(p.title), acceptedAnswer: { '@type': 'Answer', text: plain(p.answer) } })),
      },
    ]
    const bodyHtml = `<main>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/blog')}">Guides</a></nav>
  <h1>${esc(c.title)}</h1>
  ${byline}
  <div class="post-answer"><p><strong>Short answer:</strong> ${rich(c.answer)}</p></div>
  <p>${esc(c.intro)}</p>
  <h2>Every guide in this topic</h2>
  <ul>${c.posts.map((p) => `<li><a href="${href(`/blog/${c.slug}/${p.slug}`)}">${esc(p.title)}</a>, ${esc(p.metaDescription)}</li>`).join('')}</ul>
  <h2>Tools for this job</h2>
  <ul>${c.tools.map((t) => `<li><a href="${href(`/tools/${esc(t)}`)}">${esc(TOOLS.find((x) => x.slug === t)?.name || t)}</a></li>`).join('')}</ul>
</main>`
    await writeRoute(route, pageHtml(shell, { noindex: noindexAll, title: c.metaTitle, description: c.metaDescription, canonical: `${SITE}${route}`, keywords: [c.primaryKeyword, ...c.entities], schema, bodyHtml }))
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
        noindex: noindexAll,
        title: 'Printing & PDF Guides | PrintxPDF Blog',
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
  for (const t of TOOLS.filter((x) => !hiddenTools.has(x.slug))) {
    const route = `/tools/${t.slug}`
    const guides = ALL_POSTS.filter((p) => p.relatedTools?.includes(t.slug)).slice(0, 5)
    const tc = TOOL_CONTENT[t.slug]
    const c = tc && tc.answer.trim() ? tc : null
    const contentHtml = c
      ? `
  <div class="post-answer"><p><strong>Short answer:</strong> ${esc(c.answer)}</p></div>
  <h2 id="what">${esc(c.whatHeading || `What is ${t.name}?`)}</h2>
  ${c.what.map((w) => `<h3>${esc(w.term)}</h3><p>${rich(w.definition)}</p>`).join('')}
  <h2 id="why">${esc(c.whyHeading || `Why use ${t.name}?`)}</h2>
  <ul>${c.why.map((b) => `<li><strong>${esc(b.h)}.</strong> ${rich(b.x)}</li>`).join('')}</ul>
  <h2 id="how">${esc(c.howHeading || `How to use ${t.name}, step by step`)}</h2>
  <ol>${c.how.map((s, i) => `<li id="how-step-${i + 1}"><strong>${esc(s.h)}</strong> ${rich(s.x)}</li>`).join('')}</ol>
  ${c.faqs.length ? `<h2 id="faq">Frequently asked questions</h2>${c.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${rich(f.a)}</p>`).join('')}` : ''}`
      : ''
    const contentSchema = c
      ? [
          { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) },
          { '@context': 'https://schema.org', '@type': 'HowTo', name: c.howHeading || `How to use ${t.name}`, description: plain(c.answer), totalTime: 'PT2M', estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' }, tool: [{ '@type': 'HowToTool', name: 'A web browser' }], step: c.how.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: plain(s.h), text: plain(s.x), url: `${SITE}${route}#how-step-${i + 1}` })) },
        ]
      : []
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
      ...contentSchema,
      !c && guides.length && {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: guides.map((g) => ({ '@type': 'Question', name: plain(g.title), acceptedAnswer: { '@type': 'Answer', text: plain(g.answer) } })),
      },
    ].filter(Boolean)
    const bodyHtml = `<main>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/tools')}">Tools</a></nav>
  <h1>${esc(t.name)}</h1>
  <p>${esc(t.description)}</p>
  <p>${t.status === 'real' ? 'Runs entirely in your browser. Your file is never uploaded.' : t.status === 'best-effort' ? 'Best-effort conversion in your browser.' : 'Runs on our server: the file is sent over HTTPS, converted with LibreOffice or Calibre, returned and deleted immediately. Free for 5 files a month; Pro includes 300.'}</p>
  ${contentHtml}
  ${guides.length ? `<h2>Guides that use this tool</h2><ul>${guides.map((g) => `<li><a href="${href(`/blog/${g.cluster}/${g.slug}`)}">${esc(g.title)}</a></li>`).join('')}</ul>` : ''}
</main>`
    await writeRoute(route, pageHtml(shell, { noindex: noindexAll, title: c?.metaTitle || `${t.name} | ${t.status === 'server' ? 'Free Online Converter' : 'Free, In Your Browser'}`, description: c?.metaDescription || `${t.description} ${t.status === 'server' ? 'Free for 5 files a month.' : 'No upload, no sign-up.'}`.slice(0, 158), canonical: `${SITE}${route}`, keywords: [t.name.toLowerCase(), `${t.name.toLowerCase()} free`, `${t.name.toLowerCase()} online`], schema, bodyHtml }))
    count++
  }

  // ---------- tools index ----------
  {
    const route = '/tools'
    const bodyHtml = `<main><h1>All ${TOOLS.length} PDF tools</h1><ul>${TOOLS.map((t) => `<li><a href="${href(`/tools/${t.slug}`)}">${esc(t.name)}</a>, ${esc(t.short)}</li>`).join('')}</ul></main>`
    await writeRoute(
      route,
      pageHtml(shell, {
        noindex: noindexAll,
        title: `All ${TOOLS.length} PDF Tools | Free, In Your Browser`,
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

// ---------- marketing + legal routes ----------
  // These have no content model, so their crawler-visible copy lives here. Without it the
  // homepage, the highest-priority URL in the sitemap, serves an empty <div id="root">.
  const STATIC_PAGES = [
    {
      route: '/',
      title: `${cfg?.site?.name || 'PrintxPDF'}, Print Only What Matters. Fix Any PDF.`,
      description: cfg?.site?.description || 'Turn any web page into a clean printout or PDF, then do everything else to a PDF, merge, sign, compress, OCR, protect, convert, with free tools that run on your own computer. No account, nothing to install.',
      h1: 'Print only what matters. Fix any PDF.',
      body: [
        'PrintxPDF does two things. Paste a link and it keeps just the article, no ads, menus, sidebars or comment threads, so you can print it or save it as a PDF. Drop in a PDF and it does everything else: merge, split, organise, crop, compress, OCR, sign, fill forms, redact, compare, protect and convert, with thirty-nine tools in one place.',
        'Browser tools never upload anything: your files are processed in memory by your own browser using pdf-lib, pdf.js and Tesseract, and are gone when you close the tab. A few jobs that need a real engine, PowerPoint, ebooks, PDF encryption, PDF/A, run on our own server, say so on their page, and delete the file the moment they finish.',
      ],
      links: [['/print', 'Print a web page'], ['/tools', `All ${TOOLS.length} PDF tools`], ['/blog', 'Guides'], ['/pricing', 'Pricing']],
      schema: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg?.site?.name || 'PrintxPDF', url: SITE, description: cfg?.site?.description || '', publisher: org },
        { '@context': 'https://schema.org', '@type': 'WebApplication', name: cfg?.site?.name || 'PrintxPDF', url: SITE, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher },
      ],
    },
    {
      route: '/print',
      title: 'Print Any Web Page as Just the Article',
      description: 'Paste a URL and get a clean, printable version of any web page. Ads, menus and comment walls removed. Print, save as PDF or email it, free and with no upload.',
      h1: 'Paste a link. Print just the article.',
      body: [
        'Paste a web address and PrintxPDF fetches the page inside your browser and reduces it to the article itself. Click anything left over to remove it, resize the text, shrink or drop the images, then print, save a PDF or PNG, or email it to yourself.',
        'If a site blocks readers, paste the page source or upload a saved .html file instead. Both always work, because the cleaning happens in your browser.',
      ],
      links: [['/blog/print/print-web-page-without-ads', 'How to print a web page without ads'], ['/tools', 'PDF tools']],
    },
    {
      route: '/pricing',
      title: 'Pricing | Free Browser Tools, Pro Server Conversions',
      description: 'Every browser PDF tool is free forever. Pro ($5/mo) adds 300 server conversions a month for PowerPoint and ebook formats; API ($29/mo) adds key-based access with 5,000 a month.',
      h1: 'Free is free.',
      body: [
        'Every tool that runs in your browser costs nothing and always will. Paid plans cover the handful of jobs that need a real engine on our server, PowerPoint to PDF, PDF to PowerPoint, EPUB and MOBI to PDF, password protect and unlock, and PDF/A, and the API.',
        'Free: all browser tools, 5 server conversions a month, OCR up to 30 pages. Pro, $5 a month: 300 server conversions, OCR up to 200 pages, priority support. API, $29 a month: 5,000 conversions and an access key for the HTTPS API. Payments are handled by Stripe; cancel any time; refund on request within 14 days of the first charge.',
      ],
      links: [['/tools', 'PDF tools'], ['/api', 'API']],
    },
    {
      route: '/about',
      title: 'About PrintxPDF | Documents You Control',
      description: `PrintxPDF is a print and PDF toolkit founded by ${author.name}. Every browser tool keeps your files on your computer; a few heavy jobs run on our own server. Built with Readability, pdf-lib, pdf.js and Tesseract.`,
      h1: 'Your documents. Your computer. Your call.',
      body: [
        `PrintxPDF is a print-and-PDF toolkit founded by ${author.name}. Everything that can run in a browser does: the web-page cleaner and the merge, split, compress, sign and OCR tools are plain HTML, CSS and JavaScript that keep your files on your own computer. A few jobs that need a real engine, PowerPoint, ebooks, PDF encryption, PDF/A, run on our own server and say so on the tool page.`,
        'It removes ads and navigation before you print, lets you edit the result, and exports clean PDFs, PNG screenshots and emails. Built with Mozilla Readability, DOMPurify, pdf-lib, pdf.js, Tesseract.js, jsPDF and html2canvas.',
      ],
      links: [['/privacy', 'Privacy'], ['/blog', 'Guides'], [authorRoute, `Founder: ${author.name}`]],
      schema: [{ '@context': 'https://schema.org', ...org }],
    },
    {
      route: authorRoute,
      title: `${author.name} | ${author.title}`,
      description: (author.bio || `${author.name} is the founder of PrintxPDF and writes its guides on printing web pages cleanly and working with PDF files.`).slice(0, 158),
      h1: author.name,
      body: [
        author.title,
        author.bio || `${author.name} founded PrintxPDF and writes and maintains every guide on the site.`,
        `${ALL_POSTS.length} guides across ${CLUSTERS.length} topics, listed below with the most recently updated first.`,
      ],
      links: [...ALL_POSTS].filter((p) => !hiddenPosts.has(p.slug)).sort((a, b) => b.updated.localeCompare(a.updated)).map((p) => [`/blog/${p.cluster}/${p.slug}`, p.title]),
      schema: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${SITE}${authorRoute}`, mainEntity: { ...person, knowsAbout: CLUSTERS.map((c) => c.name) } }],
    },
    {
      route: '/api',
      title: 'PDF Conversion API | PowerPoint, EPUB and MOBI to PDF',
      description: 'An HTTPS API that converts PowerPoint to PDF, PDF to PowerPoint, EPUB to PDF and MOBI to PDF. Send a file, get a file back. 5 free conversions a month; the API plan includes 5,000.',
      h1: 'Convert files, programmatically.',
      body: [
        'POST a file as multipart form data to /convert/ppt-to-pdf, /convert/pdf-to-ppt, /convert/epub-to-pdf or /convert/mobi-to-pdf on api.printxpdf.com and the converted file comes back in the response. Without a key you get 5 conversions a month per IP address; Pro keys get 300 and API keys 5,000, sent as an Authorization: Bearer header.',
        'Files are limited to 100 MB and jobs to two minutes. They are processed in an isolated container and deleted the moment the response is sent. Errors are JSON with an error message and a code. The whole API is open source in the repository and can be self-hosted on Cloudflare.',
      ],
      links: [['/website-button', 'Print button generator'], ['/wordpress', 'WordPress plugin']],
    },
    {
      route: '/wordpress',
      title: 'WordPress Print & PDF Button Plugin',
      description: 'Free plugin that adds Print, PDF and Email buttons to every WordPress post or page: any public post type, shortcode or block editor, no account, no API key.',
      h1: 'A print button your readers will actually use.',
      body: ['Drop a Print, PDF and Email button onto every post and page. Readers get a clean version of your content with the ads, widgets, share bars and comments removed, and they can delete paragraphs, resize text and drop images before printing.'],
      links: [['/blog/publishers/add-print-button-to-wordpress', 'How to add a print button to WordPress'], ['/website-button', 'Button generator']],
    },
    {
      route: '/website-button',
      title: 'Print Button Generator for Any Website',
      description: 'Generate a copy-paste print and PDF button for any site. Plain HTML with inline styles, so it works in WordPress, Squarespace, Wix, Shopify and static sites.',
      h1: 'A print button for any site.',
      body: ['Paste one snippet into your template. When a reader clicks it, the page they are on opens in the PrintxPDF cleaner, ready to print, save as PDF or email. It is plain HTML with inline styles, so it works in any CMS, static site or email template that allows links.'],
      links: [['/blog/publishers/print-button-any-website', 'How to add a print button to any website'], ['/wordpress', 'WordPress plugin']],
    },
    {
      route: '/privacy',
      title: 'Privacy | Your Files Stay on Your Device',
      description: 'Browser tools never upload your files. A few server jobs send the file over HTTPS and delete it the moment they finish. Payments run through Stripe; no card data is stored here.',
      h1: 'Your files stay with you.',
      body: [
        'Every browser tool processes your documents on your own computer, in memory, and discards them when you close the tab. Account data, saved documents, signatures, settings and your access key live in your browser and are never sent to us.',
        'Two things leave your device. Cleaning a web page by URL sends only the address to our fetch proxy so the page can be retrieved. The server jobs upload the file over HTTPS to an isolated container, hold it for the length of the job (at most two minutes) and delete it; nothing is kept or logged. Free-tier usage is counted per month against a salted hash of your IP address for 40 days. Payments are hosted by Stripe; we never see card numbers. This site sets no cookies; Stripe sets its own on its pages.',
      ],
      links: [['/terms', 'Terms'], ['/about', 'About']],
    },
    {
      route: '/terms',
      title: 'Terms of Use',
      description: 'Terms for using PrintxPDF: free browser tools, a free monthly allowance of server conversions, and Pro and API subscriptions billed monthly by Stripe with a 14-day refund on the first charge.',
      h1: 'Terms, briefly.',
      body: [
        'PrintxPDF is provided as-is. Only clean, print or convert content you have the right to use; do not use the converter to circumvent DRM or to attack the service. Conversions are best-effort: check the output before relying on it.',
        'Pro ($5 per month) and API ($29 per month) are billed monthly by Stripe and renew until cancelled from Account → Subscription; access continues to the end of the paid period. Refund on request within 14 days of the first charge. Quotas of 5, 300 and 5,000 conversions a month reset on the first of the month; files are limited to 100 MB and jobs to two minutes.',
      ],
      links: [['/privacy', 'Privacy']],
    },
    {
      route: '/extensions/chrome',
      title: 'PrintxPDF for Chrome | Print Any Page Clean',
      description: 'A Chrome extension that opens the page you are on in the PrintxPDF cleaner: ads, menus and comment walls stripped, ready to print or save as PDF. Free, and it reads nothing until you click it.',
      h1: 'Turn any page into a clean PDF',
      body: [
        'Click the toolbar button and the page you are on opens in the PrintxPDF cleaner, ready to print, save as PDF or email. Right-click entries clean the current page, a link you are hovering, or just the text you selected. It also works in Brave, Edge, Opera, Vivaldi and Arc, which all run Chrome extensions.',
        'The extension is not in the Chrome Web Store yet, so it installs in developer mode: download the ZIP, unzip it, open chrome://extensions, turn on Developer mode and choose Load unpacked. It asks only for activeTab, contextMenus and storage, it cannot read pages in the background, sends nothing anywhere and contains no analytics. If you would rather install nothing, the bookmarklet on this page does the same job in any browser, including Firefox and Safari.',
      ],
      links: [['/print', 'Print a web page'], ['/blog/extensions/bookmarklet-vs-extension', 'Bookmarklet vs extension'], ['/extension-privacy', 'Extension privacy policy']],
    },
    {
      route: '/extension-privacy',
      title: 'Chrome Extension Privacy Policy',
      description: 'The PrintxPDF Chrome extension collects nothing and sends nothing. It reads the address of the tab you click on, stores one preference, and puts a selection on your clipboard only when you ask.',
      h1: 'It collects nothing. It sends nothing.',
      body: [
        'Last updated 10 September 2026. The extension has no server of its own, no account, no analytics, no tracking, no advertising and no third party. It stores two values on your own machine: the "Open in a new tab" preference (chrome.storage.sync, synchronised between your own Chrome profiles by Google) and a timestamp plus a "was the copy blocked?" flag from the last "Print just this selection" (chrome.storage.local), never the selected text. Both are deleted when you uninstall.',
        'It reads the address of the tab you are on only when you click the icon, choose a right-click item or press the shortcut (Chrome\'s activeTab permission: one tab, your gesture, no standing access to any website). For "Print just this selection" it turns your selected text into HTML and places it on your clipboard (the clipboardWrite permission); it goes nowhere else. It makes no network requests and contains no remote code. Opening printxpdf.com/print is an ordinary page visit governed by the site privacy policy. We collect no user data, so we sell, share and transfer none, meeting the Chrome Web Store Limited Use requirements; it collects nothing from children; uninstalling removes both values; any change to these practices is published here before it ships.',
      ],
      links: [['/extensions/chrome', 'Chrome extension'], ['/privacy', 'Site privacy policy']],
    },
  ]

  for (const pg of STATIC_PAGES) {
    const bodyHtml = `<main>
  <h1>${esc(pg.h1)}</h1>
  ${pg.body.map((t) => `<p>${esc(t)}</p>`).join('\n  ')}
  <ul>${pg.links.map(([to, label]) => `<li><a href="${href(to)}">${esc(label)}</a></li>`).join('')}</ul>
</main>`
    const schema = [
      crumbs(pg.route === '/' ? [{ name: 'Home', path: '/' }] : [{ name: 'Home', path: '/' }, { name: pg.h1, path: pg.route }]),
      ...(pg.schema || []),
    ]
    const html = pageHtml(shell, { noindex: noindexAll, title: pg.title, description: pg.description, canonical: `${SITE}${pg.route}`, schema, bodyHtml })
    if (pg.route === '/') await writeFile(path.join(DIST, 'index.html'), html)
    else await writeRoute(pg.route, html)
    count++
  }

  // ---------- SPA shell ----------
  // Routes with no prerendered file (/account, /signin, /admin/*) fall back to this. It must NOT
  // be the home page: serving dist/index.html there flashed the home hero for a second before
  // React replaced it with the real route. The shell carries the same <head> (design attribute,
  // fonts) but an empty #root, so those routes paint nothing until the app renders.
  const shellHtml = pageHtml(shell, {
    noindex: true,
    title: `${cfg?.site?.name || 'PrintxPDF'}, ${cfg?.site?.tagline || 'Print web pages clean. Master your PDFs.'}`,
    description: cfg?.site?.description || '',
    canonical: '',
    bodyHtml: '',
  })
  await writeFile(path.join(DIST, 'app.html'), shellHtml)
  await writeFile(path.join(DIST, '404.html'), shellHtml)

  console.log(`prerender: ${count} static pages written into dist/ (plus app.html and 404.html shells)`)

}

main().catch((e) => {
  console.error('prerender failed:', e)
  process.exit(1)
})
