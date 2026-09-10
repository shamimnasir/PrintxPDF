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
let CONFIG_JSON = '{}'
let MANIFEST = {}
let SHELL = ''

// Which lazy route module renders a path (mirrors the routes in src/App.tsx). Its chunk and
// the chunks it imports are preloaded from the page head, so the route hydrates as soon as
// the main bundle runs instead of after a second round trip.
const ROUTE_MODULES = [
  [/^\/$/, 'src/pages/Home.tsx'],
  [/^\/print$/, 'src/features/webclip/WebClipPage.tsx'],
  [/^\/tools$/, 'src/pages/ToolsIndex.tsx'],
  [/^\/tools\//, 'src/features/pdf/ToolPage.tsx'],
  [/^\/extensions/, 'src/pages/Extensions.tsx'],
  [/^\/extension-privacy$/, 'src/pages/ExtensionPrivacy.tsx'],
  [/^\/wordpress$/, 'src/pages/WordPress.tsx'],
  [/^\/website-button$/, 'src/pages/WebsiteButton.tsx'],
  [/^\/api$/, 'src/pages/Api.tsx'],
  [/^\/pricing$/, 'src/pages/Pricing.tsx'],
  [/^\/blog$/, 'src/pages/Blog.tsx'],
  [/^\/blog\/[^/]+$/, 'src/pages/ClusterPage.tsx'],
  [/^\/blog\/[^/]+\/[^/]+$/, 'src/pages/PostPage.tsx'],
  [/^\/author\//, 'src/pages/AuthorPage.tsx'],
  [/^\/about$/, 'src/pages/About.tsx'],
  [/^\/(privacy|terms)$/, 'src/pages/Legal.tsx'],
  [/^\/(signin|signup)$/, 'src/features/account/SignIn.tsx'],
  [/^\/account/, 'src/features/account/Account.tsx'],
]
function preloadLinks(route) {
  const mod = ROUTE_MODULES.find(([re]) => re.test(route))?.[1]
  if (!mod) return ''
  // a page that is also imported statically elsewhere (PostPage exports Rich) is a plain chunk keyed by its output name
  const name = mod.split('/').pop().replace(/\.tsx?$/, '')
  const key = MANIFEST[mod] ? mod : Object.keys(MANIFEST).find((k) => MANIFEST[k].name === name)
  if (!key) throw new Error(`prerender: ${mod} is not in dist/.vite/manifest.json, the route map in ROUTE_MODULES is stale`)
  const files = new Set()
  const walk = (k) => {
    const e = MANIFEST[k]
    if (!e || files.has(e.file)) return
    files.add(e.file)
    ;(e.imports || []).forEach(walk)
  }
  walk(key)
  return [...files]
    .filter((f) => !SHELL.includes(f)) // the entry chunk and its imports are already in the shell
    .map((f) => `<link rel="modulepreload" href="${href(`/${f}`)}">`)
    .join('\n    ')
}
const href = (p) => (p.startsWith('/') ? `${BASE}${p}` : p)

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

function pageHtml(shell, { route, title, description, canonical, keywords, schema, bodyHtml, published, updated, noindex }) {
  const head = [
    preloadLinks(route),
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
  // the published config, inline, so the first client render matches this HTML (src/admin/config.ts reads it)
  const configScript = `<script id="pxp-config" type="application/json">${CONFIG_JSON.replace(/</g, '\\u003c')}</script>\n    `
  return shell
    .replace(/<html([^>]*)>/, (_m, attrs) => `<html${attrs.replace(/\s*data-design="[^"]*"/, '')} data-design="${DESIGN}">`)
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `  ${fontLink}${configScript}${head}\n  </head>`)
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
  SHELL = shell
  MANIFEST = JSON.parse(await readFile(path.join(DIST, '.vite/manifest.json'), 'utf8'))
  CONFIG_JSON = JSON.stringify(cfg)
  // the app rendered to HTML (vite build --ssr), so every page ships its real markup and React hydrates it
  const { render } = await import(pathToFileURL(path.join(ROOT, 'dist-ssr/entry-server.js')).href)
  const ssr = async (route) => {
    const html = await render(route, cfg)
    if (html.includes('$RC') || html.includes('<div hidden id="S:')) throw new Error(`prerender: ${route} rendered with streaming instructions instead of inline HTML`)
    return html
  }
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

    const bodyHtml = await ssr(route)

    await writeRoute(
      route,
      pageHtml(shell, { route, noindex: noindexAll, title: p.metaTitle, description: p.metaDescription, canonical: `${SITE}${route}`, keywords: [p.primaryKeyword, ...p.secondaryKeywords], schema, bodyHtml, published: p.published, updated: p.updated }),
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
    const bodyHtml = await ssr(route)
    await writeRoute(route, pageHtml(shell, { route, noindex: noindexAll, title: c.metaTitle, description: c.metaDescription, canonical: `${SITE}${route}`, keywords: [c.primaryKeyword, ...c.entities], schema, bodyHtml }))
    count++
  }

  // ---------- blog hub ----------
  {
    const route = '/blog'
    const bodyHtml = await ssr(route)
    await writeRoute(
      route,
      pageHtml(shell, { route,
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
    const bodyHtml = await ssr(route)
    await writeRoute(route, pageHtml(shell, { route, noindex: noindexAll, title: c?.metaTitle || `${t.name} | ${t.status === 'server' ? 'Free Online Converter' : 'Free, In Your Browser'}`, description: c?.metaDescription || `${t.description} ${t.status === 'server' ? 'Free for 5 files a month.' : 'No upload, no sign-up.'}`.slice(0, 158), canonical: `${SITE}${route}`, keywords: [t.name.toLowerCase(), `${t.name.toLowerCase()} free`, `${t.name.toLowerCase()} online`], schema, bodyHtml }))
    count++
  }

  // ---------- tools index ----------
  {
    const route = '/tools'
    const bodyHtml = await ssr(route)
    await writeRoute(
      route,
      pageHtml(shell, { route,
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
  // The page markup comes from the app itself; only the head (title, description, schema) lives here.
  const STATIC_PAGES = [
    {
      route: '/',
      title: `${cfg?.site?.name || 'PrintxPDF'}, Print Only What Matters. Fix Any PDF.`,
      description: cfg?.site?.description || 'Turn any web page into a clean printout or PDF, then merge, sign, shrink, protect or convert any PDF free in your browser. Nothing is uploaded, no account.',
      h1: 'Print only what matters. Fix any PDF.',
      schema: [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: cfg?.site?.name || 'PrintxPDF', url: SITE, description: cfg?.site?.description || '', publisher: org },
        { '@context': 'https://schema.org', '@type': 'WebApplication', name: cfg?.site?.name || 'PrintxPDF', url: SITE, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher },
      ],
    },
    {
      route: '/print',
      title: 'Print Any Web Page as Just the Article',
      description: 'Paste a link and get a clean, printable version of any web page. Ads, menus and comments removed. Print it, save it as a PDF or email it. Free, nothing uploaded.',
      h1: 'Paste a link. Print just the article.',
    },
    {
      route: '/pricing',
      title: 'Pricing | Free PDF Tools, Pro and API Plans',
      description: 'Every browser PDF tool is free forever. Pro ($5 a month) adds 300 server conversions a month for PowerPoint and ebooks. API ($29 a month) adds 5,000.',
      h1: 'Free is free.',
    },
    {
      route: '/about',
      title: 'About PrintxPDF | Documents You Control',
      description: `PrintxPDF is a print and PDF toolkit founded by ${author.name}. Browser tools keep your files on your computer; a few heavy jobs run on our own server and are deleted right after.`,
      h1: 'Your documents. Your computer. Your call.',
      schema: [{ '@context': 'https://schema.org', ...org }],
    },
    {
      route: authorRoute,
      title: `${author.name} | ${author.title}`,
      description: (author.bio || `${author.name} is the founder of PrintxPDF and writes its guides on printing web pages cleanly and working with PDF files.`).slice(0, 158),
      h1: author.name,
      schema: [{ '@context': 'https://schema.org', '@type': 'ProfilePage', url: `${SITE}${authorRoute}`, mainEntity: { ...person, knowsAbout: CLUSTERS.map((c) => c.name) } }],
    },
    {
      route: '/api',
      title: 'PDF Conversion API | PowerPoint, EPUB and MOBI to PDF',
      description: 'A simple web API for developers: send a PowerPoint, EPUB or MOBI file and get a PDF back, or turn a PDF into PowerPoint. 5 free a month; the API plan has 5,000.',
      h1: 'Convert files from your own software.',
    },
    {
      route: '/wordpress',
      title: 'WordPress Print & PDF Button Plugin',
      description: 'Free WordPress plugin that adds Print, PDF and Email buttons to every post and page. Works with any theme, needs no account or key, and never contacts anyone.',
      h1: 'A print button your readers will actually use.',
    },
    {
      route: '/website-button',
      title: 'Print Button Generator for Any Website',
      description: 'Make a print and PDF button for your website in seconds. Copy one small piece of code and paste it into WordPress, Squarespace, Wix, Shopify or any other site.',
      h1: 'A print button for any site.',
    },
    {
      route: '/privacy',
      title: 'Privacy | Your Files Stay on Your Device',
      description: 'Browser tools never upload your files. A few server jobs send the file over a secure connection and delete it right after. Payments run through Stripe; no card details stored.',
      h1: 'Your files stay with you.',
    },
    {
      route: '/terms',
      title: 'Terms of Use',
      description: 'Terms for using PrintxPDF: free browser tools, a free monthly allowance of server conversions, and Pro and API subscriptions billed monthly by Stripe with a 14-day refund on the first charge.',
      h1: 'Terms, briefly.',
    },
    {
      route: '/extensions/chrome',
      title: 'PrintxPDF for Chrome | Print Any Page Clean',
      description: 'A free Chrome extension that opens the page you are on in the PrintxPDF cleaner: ads, menus and comments removed, ready to print or save as a PDF.',
      h1: 'Turn any page into a clean PDF',
    },
    { route: '/signin', title: 'Log in | PrintxPDF', description: 'Log in to PrintxPDF to keep your saved pages, signatures and settings on this device.', h1: 'Log in', noindex: true },
    { route: '/signup', title: 'Sign up | PrintxPDF', description: 'Create a free PrintxPDF account. No password: your saved pages, signatures and settings stay on this device.', h1: 'Sign up', noindex: true },
    { route: '/account', title: 'Your account | PrintxPDF', description: 'Your PrintxPDF account: your plan, monthly usage, saved documents, signatures and settings, all kept in this browser and never sent anywhere.', h1: 'Account', noindex: true },
    {
      route: '/extension-privacy',
      title: 'Chrome Extension Privacy Policy',
      description: 'The PrintxPDF Chrome extension collects nothing and sends nothing. It reads the address of the tab you click on, stores one preference, and puts a selection on your clipboard only when you ask.',
      h1: 'It collects nothing. It sends nothing.',
    },
  ]

  for (const pg of STATIC_PAGES) {
    const route = pg.route
    const bodyHtml = await ssr(route)
    const schema = [
      crumbs(pg.route === '/' ? [{ name: 'Home', path: '/' }] : [{ name: 'Home', path: '/' }, { name: pg.h1, path: pg.route }]),
      ...(pg.schema || []),
    ]
    const html = pageHtml(shell, { route, noindex: noindexAll || !!pg.noindex, title: pg.title, description: pg.description, canonical: pg.noindex ? '' : `${SITE}${pg.route}`, schema, bodyHtml })
    if (pg.route === '/') await writeFile(path.join(DIST, 'index.html'), html)
    else await writeRoute(pg.route, html)
    count++
  }

  // ---------- SPA shell ----------
  // Routes with no prerendered file (/account/billing, /admin/*, unknown URLs) fall back to this.
  // It must never carry another page's content: serving the home page here once flashed the
  // hero before React swapped in the real route. /account renders as header, a loading badge
  // and footer, which is the right first paint for any of those routes.
  const shellHtml = pageHtml(shell, {
    route: '/account',
    noindex: true,
    title: `${cfg?.site?.name || 'PrintxPDF'}, ${cfg?.site?.tagline || 'Print web pages clean. Master your PDFs.'}`,
    description: cfg?.site?.description || '',
    canonical: '',
    bodyHtml: await ssr('/account'),
  })
  await writeFile(path.join(DIST, 'app.html'), shellHtml)
  await writeFile(path.join(DIST, '404.html'), shellHtml)

  console.log(`prerender: ${count} static pages written into dist/ (plus app.html and 404.html shells)`)

}

main().catch((e) => {
  console.error('prerender failed:', e)
  process.exit(1)
})
