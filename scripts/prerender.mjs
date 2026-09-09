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

// set from VITE_BASE in main(); GitHub Pages serves the site from /<repo>/
let BASE = ''
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
     export { TOOLS } from ${JSON.stringify(path.join(ROOT, 'src/features/pdf/toolsMeta.ts'))}`,
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
    `<link rel="canonical" href="${esc(canonical)}">`,
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
    throw new Error('prerender: could not find <div id="root"></div> in dist/index.html — the shell changed, so no content would be baked in.')
  }
  if (!shell.includes('</head>')) throw new Error('prerender: no </head> in dist/index.html')
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
  BASE = (process.env.VITE_BASE || '/').replace(/\/$/, '')
  const hiddenTools = new Set(cfg?.tools?.hidden || [])
  const hiddenPosts = new Set(cfg?.content?.hidden || [])
  const noindexAll = !!cfg?.seo?.noindexAll
  const shell = await readFile(path.join(DIST, 'index.html'), 'utf8')
  const publisher = { '@type': 'Organization', name: 'PrintxPDF', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` } }
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
  <p><em>Updated ${esc(p.updated)} · ${p.readMinutes} min read</em></p>
  <div class="post-answer"><p><strong>Short answer:</strong> ${rich(p.answer)}</p></div>
  ${blocksToHtml(p.body)}
  ${p.faqs?.length ? `<h2 id="faq">Frequently asked questions</h2>${p.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${rich(f.a)}</p>`).join('')}` : ''}
  ${p.relatedTools?.length ? `<h2>Tools</h2><ul>${p.relatedTools.map((t) => `<li><a href="${href(`/tools/${esc(t)}`)}">${esc(TOOLS.find((x) => x.slug === t)?.name || t)}</a></li>`).join('')}</ul>` : ''}
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
  <div class="post-answer"><p><strong>Short answer:</strong> ${rich(c.answer)}</p></div>
  <p>${esc(c.intro)}</p>
  <h2>Every guide in this topic</h2>
  <ul>${c.posts.map((p) => `<li><a href="${href(`/blog/${c.slug}/${p.slug}`)}">${esc(p.title)}</a> — ${esc(p.metaDescription)}</li>`).join('')}</ul>
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
  for (const t of TOOLS.filter((x) => !hiddenTools.has(x.slug))) {
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
        mainEntity: guides.map((g) => ({ '@type': 'Question', name: plain(g.title), acceptedAnswer: { '@type': 'Answer', text: plain(g.answer) } })),
      },
    ].filter(Boolean)
    const bodyHtml = `<main>
  <nav><a href="${href('/')}">Home</a> / <a href="${href('/tools')}">Tools</a></nav>
  <h1>${esc(t.name)}</h1>
  <p>${esc(t.description)}</p>
  <p>${t.status === 'real' ? 'Runs entirely in your browser. Your file is never uploaded.' : t.status === 'best-effort' ? 'Best-effort conversion in your browser.' : 'Demo interface — this format needs server-side conversion.'}</p>
  ${guides.length ? `<h2>Guides that use this tool</h2><ul>${guides.map((g) => `<li><a href="${href(`/blog/${g.cluster}/${g.slug}`)}">${esc(g.title)}</a></li>`).join('')}</ul>` : ''}
</main>`
    await writeRoute(route, pageHtml(shell, { noindex: noindexAll, title: `${t.name} — Free, In Your Browser`, description: `${t.description} No upload, no sign-up.`.slice(0, 158), canonical: `${SITE}${route}`, keywords: [t.name.toLowerCase(), `${t.name.toLowerCase()} free`, `${t.name.toLowerCase()} online`], schema, bodyHtml }))
    count++
  }

  // ---------- tools index ----------
  {
    const route = '/tools'
    const bodyHtml = `<main><h1>All ${TOOLS.length} PDF tools</h1><ul>${TOOLS.map((t) => `<li><a href="${href(`/tools/${t.slug}`)}">${esc(t.name)}</a> — ${esc(t.short)}</li>`).join('')}</ul></main>`
    await writeRoute(
      route,
      pageHtml(shell, {
        noindex: noindexAll,
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

// ---------- marketing + legal routes ----------
  // These have no content model, so their crawler-visible copy lives here. Without it the
  // homepage — the highest-priority URL in the sitemap — serves an empty <div id="root">.
  const STATIC_PAGES = [
    {
      route: '/',
      title: `${cfg?.site?.name || 'PrintxPDF'} — Print Web Pages Clean, Master Your PDFs`,
      description: cfg?.site?.description || 'Strip ads from web pages before you print, and run every common PDF job in your browser. Free, no upload, no sign-up.',
      h1: 'Cut the clutter. Own your PDFs.',
      body: [
        'PrintxPDF does two things. It strips ads, menus, sidebars and comment walls out of any web page so you can print or save just the article. And it runs every common PDF job — merge, split, organise, compress, OCR, sign, watermark, convert — entirely inside your browser.',
        'Nothing is uploaded. There is no server-side application and no upload endpoint, so your files are processed in memory by your own browser using pdf-lib, pdf.js and Tesseract, and are gone when you close the tab.',
      ],
      links: [['/print', 'Print a web page'], ['/tools', `All ${TOOLS.length} PDF tools`], ['/blog', 'Guides'], ['/pricing', 'Pricing']],
      schema: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg?.site?.name || 'PrintxPDF', url: SITE, description: cfg?.site?.description || '', publisher },
        { '@context': 'https://schema.org', '@type': 'WebApplication', name: cfg?.site?.name || 'PrintxPDF', url: SITE, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher },
      ],
    },
    {
      route: '/print',
      title: 'Print Any Web Page Without Ads',
      description: 'Paste a URL and get a clean, printable version of any web page. Ads, menus and comment walls removed. Print, save as PDF or email it, free and with no upload.',
      h1: 'Paste a link. Lose the junk.',
      body: [
        'Paste a web address and PrintxPDF fetches the page, runs Mozilla Readability over it and shows you just the article. Delete anything left over by clicking it, resize the text, shrink or drop the images, then print, download a PDF, save a PNG or email it to yourself.',
        'If a site blocks readers, paste the page source or upload a saved .html file instead. Both always work, because the cleaning happens in your browser.',
      ],
      links: [['/blog/print-web-pages/print-web-page-without-ads', 'How to print a web page without ads'], ['/tools', 'PDF tools']],
    },
    {
      route: '/pricing',
      title: 'Pricing — Every Browser Tool Is Free',
      description: 'Every PDF tool and the web-page cleaner are free forever, because they run in your browser. Pro and API tiers cover the WordPress plugin and server-side jobs.',
      h1: 'Free is free.',
      body: ['Every tool that runs in your browser costs nothing and always will, because there is no server cost to recover. The Pro tier covers the WordPress plugin, removing branding from printed pages and print analytics. The API tier covers server-side conversions.'],
      links: [['/tools', 'PDF tools'], ['/api', 'API']],
    },
    {
      route: '/about',
      title: 'About PrintxPDF — Print Less Junk',
      description: 'PrintxPDF is a browser-only print and PDF toolkit. No upload endpoint exists, so your files never leave your computer. Built with Readability, pdf-lib, pdf.js and Tesseract.',
      h1: 'Print less junk. More of what matters.',
      body: ['PrintxPDF is a demonstration of what a modern print-and-PDF toolkit looks like when it refuses to run a server. Every tool is static HTML, CSS and JavaScript. It removes ads and navigation before you print, lets you preview and edit exactly what you are about to output, and exports clean PDFs with working links.'],
      links: [['/privacy', 'Privacy'], ['/blog', 'Guides']],
    },
    {
      route: '/api',
      title: 'PDF API and Self-Hosted Fetch Proxy',
      description: 'Deploy a one-file Cloudflare Worker so the web-page cleaner fetches reliably from your own domain, plus the specification for a URL-to-PDF API endpoint.',
      h1: 'Clean PDFs, programmatically.',
      body: ['Public reader proxies are rate-limited. Deploying the single-file Cloudflare Worker in this repository routes every URL fetch through your own edge instead. The URL-to-PDF API is published here as a specification rather than a live endpoint, because this deployment has no backend.'],
      links: [['/website-button', 'Print button generator'], ['/wordpress', 'WordPress plugin']],
    },
    {
      route: '/wordpress',
      title: 'WordPress Print & PDF Button Plugin',
      description: 'Add a Print, PDF and Email button to every WordPress post. Works with standard themes, custom post types, Gutenberg blocks, Elementor and WooCommerce orders.',
      h1: 'A print button your readers will actually use.',
      body: ['Drop a Print, PDF and Email button onto every post and page. Readers get a clean version of your content with the ads, widgets, share bars and comments removed, and they can delete paragraphs, resize text and drop images before printing.'],
      links: [['/blog/publishers-wordpress/add-print-button-to-wordpress', 'How to add a print button to WordPress'], ['/website-button', 'Button generator']],
    },
    {
      route: '/website-button',
      title: 'Print Button Generator for Any Website',
      description: 'Generate a copy-paste print and PDF button for any site. Plain HTML with inline styles, so it works in WordPress, Squarespace, Wix, Shopify and static sites.',
      h1: 'A print button for any site.',
      body: ['Paste one snippet into your template. When a reader clicks it, the page they are on opens in the PrintxPDF cleaner, ready to print, save as PDF or email. It is plain HTML with inline styles, so it works in any CMS, static site or email template that allows links.'],
      links: [['/blog/publishers-wordpress/print-button-any-website', 'How to add a print button to any website'], ['/wordpress', 'WordPress plugin']],
    },
    {
      route: '/privacy',
      title: 'Privacy — Nothing Is Uploaded',
      description: 'PrintxPDF has no server-side application and no upload endpoint. Files are processed in your browser and discarded when you close the tab. No cookies.',
      h1: 'We cannot see your files.',
      body: ['This site has no server-side application, so there is nothing to store your documents in. Files you open are processed in your browser memory and discarded when you close the tab. Account data, saved documents, signatures and settings live in your browser localStorage and never leave it. When you clean a page by URL, only that address is sent to a reader proxy so the page can be fetched. There are no cookies.'],
      links: [['/terms', 'Terms'], ['/about', 'About']],
    },
    {
      route: '/terms',
      title: 'Terms of Use',
      description: 'Terms for using PrintxPDF: a free, as-is demonstration of browser-based printing and PDF tools. No payment is collected and no paid service is delivered.',
      h1: 'Terms, briefly.',
      body: ['PrintxPDF is provided as-is, free of charge, for demonstration purposes. Only clean, print or convert content you have the right to use, and respect the terms of the sites you fetch. Conversions are best-effort, so check the output before relying on it. Pricing, plans and the API are illustrative: no payment is collected.'],
      links: [['/privacy', 'Privacy']],
    },
    ...['chrome', 'firefox', 'safari', 'edge'].map((b) => ({
      route: `/extensions/${b}`,
      title: `Print Web Pages Cleanly in ${b[0].toUpperCase()}${b.slice(1)}`,
      description: `Print or save any page as a clean PDF in ${b[0].toUpperCase()}${b.slice(1)}. Reader mode, the print dialog settings that matter, and a bookmarklet that works today with no install.`,
      h1: `Turn any page into a clean PDF in ${b[0].toUpperCase()}${b.slice(1)}`,
      body: [
        `Remove ads, navigation and distractions from any web page before you print or save it as a PDF. The extension listing on this site is a design demonstration and is not published to any store; the bookmarklet on this page works today in every browser with no install and no permissions.`,
      ],
      links: [['/print', 'Print a web page'], ['/blog/browser-extensions/bookmarklet-vs-extension', 'Bookmarklet vs extension']],
    })),
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

  console.log(`prerender: ${count} static pages written into dist/`)

}

main().catch((e) => {
  console.error('prerender failed:', e)
  process.exit(1)
})
