import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, Card, Color, ListEditor, Num, Text, Toggle } from './fields'
import { clearHits, discardDraft, exportConfig, getHits, importCarriesCode, importConfig, setPasscode, updateConfig, type SiteConfig } from './config'
import { inkIsTooLight } from './RuntimeEffects'
import { useToast } from '../components/ui/Toast'
import { downloadBlob } from '../lib/download'
import { TOOLS } from '../features/pdf/toolsMeta'
import { ALL_POSTS, CLUSTERS } from '../content'

type P = { cfg: SiteConfig }

/** Writes one section of the config. Returns false when the browser refused to store the
 *  draft, which callers surface so a field never silently snaps back to its old value. */
const set = <K extends keyof SiteConfig>(k: K, patch: Partial<SiteConfig[K]>) => updateConfig({ [k]: patch } as unknown as Partial<SiteConfig>)

/** Wraps `set` so a storage failure reaches the user instead of being swallowed. */
function useSet() {
  const { toast } = useToast()
  return <K extends keyof SiteConfig>(k: K, patch: Partial<SiteConfig[K]>) => {
    if (!set(k, patch)) toast('Browser storage is full, so that change was not saved', 'error')
  }
}

// ---------------------------------------------------------------- Dashboard
export function Dashboard({ cfg }: P) {
  const hits = getHits()
  const now = Date.now()
  const last7 = hits.filter((h) => now - h.t < 7 * 864e5)
  const byPath = useMemo(() => {
    const m = new Map<string, number>()
    last7.forEach((h) => m.set(h.path, (m.get(h.path) || 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [last7])
  const max = byPath[0]?.[1] || 1
  const hiddenTools = cfg.tools.hidden.length
  const hiddenPosts = cfg.content.hidden.length

  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="n">{TOOLS.length - hiddenTools}</div>
          <div className="k">Live tools</div>
        </div>
        <div className="stat">
          <div className="n">{CLUSTERS.length}</div>
          <div className="k">Topic clusters</div>
        </div>
        <div className="stat">
          <div className="n">{ALL_POSTS.length - hiddenPosts}</div>
          <div className="k">Published posts</div>
        </div>
        <div className="stat">
          <div className="n">{last7.length}</div>
          <div className="k">Views, 7 days</div>
        </div>
      </div>

      <Card title="Most viewed, last 7 days" desc="Counted in this browser only. Connect GA4, Plausible or Umami in Analytics for real traffic.">
        {byPath.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No views recorded yet. Browse the site in this browser and they will appear here.
          </p>
        ) : (
          byPath.map(([path, n]) => (
            <div className="bar-row" key={path}>
              <div>
                <div className="lbl">{path}</div>
                <div className="track">
                  <div style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </div>
              <div className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                {n}
              </div>
            </div>
          ))
        )}
      </Card>

      <Card title="Quick links">
        <div className="row" style={{ gap: '0.5rem' }}>
          <Link className="btn btn-sm" to="/">
            View site
          </Link>
          <Link className="btn btn-sm" to="/blog">
            Blog
          </Link>
          <Link className="btn btn-sm" to="/tools">
            Tools
          </Link>
          <a className="btn btn-sm" href={cfg.site.github} target="_blank" rel="noopener noreferrer">
            Repository
          </a>
        </div>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- General
export function General({ cfg }: P) {
  const set = useSet()
  return (
    <>
      <Card title="Site identity" desc="Used in the header, footer, page titles, Open Graph tags and structured data.">
        <Text label="Site name" value={cfg.site.name} onChange={(v) => set('site', { name: v })} />
        <Text label="Tagline" value={cfg.site.tagline} onChange={(v) => set('site', { tagline: v })} />
        <Area label="Description" rows={3} value={cfg.site.description} onChange={(v) => set('site', { description: v })} hint="Fallback meta description for pages that do not set their own." />
        <Text label="Canonical URL" value={cfg.site.url} onChange={(v) => set('site', { url: v })} hint="No trailing slash. Used for canonical tags and the sitemap." />
        <Text label="Contact email" value={cfg.site.email} onChange={(v) => set('site', { email: v })} />
        <Text label="GitHub URL" value={cfg.site.github} onChange={(v) => set('site', { github: v })} />
        <Text label="X / Twitter handle" value={cfg.site.twitter} onChange={(v) => set('site', { twitter: v })} placeholder="@handle" />
        <Text label="Footer note" value={cfg.site.footerNote} onChange={(v) => set('site', { footerNote: v })} />
      </Card>

      <Card title="Announcement bar" desc="A strip above the header. Good for launches and notices.">
        <Toggle label="Show the announcement bar" value={cfg.announcement.enabled} onChange={(v) => set('announcement', { enabled: v })} />
        <Text label="Text" value={cfg.announcement.text} onChange={(v) => set('announcement', { text: v })} />
        <Text label="Link text" value={cfg.announcement.linkText} onChange={(v) => set('announcement', { linkText: v })} />
        <Text label="Link URL" value={cfg.announcement.linkUrl} onChange={(v) => set('announcement', { linkUrl: v })} hint="Internal path like /tools/ocr-pdf, or a full URL." />
        <Toggle label="Visitors can dismiss it" value={cfg.announcement.dismissible} onChange={(v) => set('announcement', { dismissible: v })} />
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Appearance
export function Appearance({ cfg }: P) {
  const set = useSet()
  return (
    <>
      <Card title="Colours" desc="Applied live as CSS variables. The accent drives buttons, links, badges and highlights.">
        <Color label="Accent" value={cfg.theme.accent} onChange={(v) => set('theme', { accent: v })} />
        <Color label="Text on accent" value={cfg.theme.accentFg} onChange={(v) => set('theme', { accentFg: v })} hint="Keep contrast at 4.5:1 or better against the accent." />
        <Color label="Ink (dark surfaces, borders)" value={cfg.theme.ink} onChange={(v) => set('theme', { ink: v })} hint="Dark mode paints its background from this colour." />
        {inkIsTooLight(cfg.theme.ink) && (
          <div className="callout warn" style={{ marginTop: 0 }}>
            <span className="k">Watch out</span>
            <p>
              That ink is too light to sit behind white text, so dark mode keeps its default background and uses your colour
              for borders only. Pick something darker if you want it applied everywhere.
            </p>
          </div>
        )}
        <Color label="Alert" value={cfg.theme.alarm} onChange={(v) => set('theme', { alarm: v })} />
        <div className="row" style={{ gap: '1rem', marginTop: '1rem' }}>
          <span className="btn btn-acid btn-sm">Accent button</span>
          <span className="badge badge-acid">Badge</span>
          <span className="acid-mark">Highlight</span>
          <span className="alarm" style={{ fontWeight: 800 }}>
            Alert text
          </span>
        </div>
      </Card>

      <Card title="Shape">
        <Num label="Border width (px)" value={cfg.theme.borderWidth} onChange={(v) => set('theme', { borderWidth: v })} min={0} max={8} hint="3 is the brutalist default. 1 gives a quieter look." />
        <Num label="Corner radius (px)" value={cfg.theme.radius} onChange={(v) => set('theme', { radius: v })} min={0} max={24} hint="0 keeps hard corners." />
      </Card>

      <Card title="Default colour mode" desc="What a first-time visitor sees before they pick a mode.">
        <div className="seg">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button key={m} className={cfg.theme.defaultMode === m ? 'on' : ''} onClick={() => set('theme', { defaultMode: m })}>
              {m}
            </button>
          ))}
        </div>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Home & pages
export function Pages({ cfg }: P) {
  const set = useSet()
  const PAGE_KEYS = [
    ['about', 'About'],
    ['pricing', 'Pricing'],
    ['api', 'API'],
    ['wordpress', 'WordPress'],
    ['website-button', 'Website button'],
    ['extensions', 'Extensions'],
    ['blog', 'Blog hub'],
    ['tools', 'Tools index'],
  ] as const
  return (
    <>
      <Card title="Home page copy" desc="Every string in the hero and the section toggles below it.">
        <Text label="Eyebrow" value={cfg.home.eyebrow} onChange={(v) => set('home', { eyebrow: v })} />
        <Text label="Headline line 1" value={cfg.home.headline1} onChange={(v) => set('home', { headline1: v })} hint="Rendered with the accent highlight." />
        <Text label="Headline line 2" value={cfg.home.headline2} onChange={(v) => set('home', { headline2: v })} />
        <Area label="Lead paragraph" rows={3} value={cfg.home.lead} onChange={(v) => set('home', { lead: v })} />
        <Text label="File card title" value={cfg.home.fileCardTitle} onChange={(v) => set('home', { fileCardTitle: v })} />
        <Text label="File card subtitle" value={cfg.home.fileCardText} onChange={(v) => set('home', { fileCardText: v })} />
        <Text label="URL card title" value={cfg.home.urlCardTitle} onChange={(v) => set('home', { urlCardTitle: v })} />
        <Text label="URL card subtitle" value={cfg.home.urlCardText} onChange={(v) => set('home', { urlCardText: v })} />
      </Card>

      <Card title="Home sections">
        <Toggle label="Logo marquee" value={cfg.home.showMarquee} onChange={(v) => set('home', { showMarquee: v })} />
        <ListEditor label="Marquee names" items={cfg.home.marquee} onChange={(v) => set('home', { marquee: v })} placeholder="Company name" />
        <Toggle label='"How the web printer works" section' value={cfg.home.showHowItWorks} onChange={(v) => set('home', { showHowItWorks: v })} />
        <Toggle label="Four-products section" value={cfg.home.showProducts} onChange={(v) => set('home', { showProducts: v })} />
        <Toggle label="Privacy statement band" value={cfg.home.showPrivacy} onChange={(v) => set('home', { showPrivacy: v })} />
      </Card>

      <Card title="Other pages" desc="Override the title, meta description and intro of any page, or hide it from the navigation.">
        {PAGE_KEYS.map(([key, label]) => {
          const p = cfg.pages[key] || {}
          const patch = (x: Record<string, unknown>) => set('pages', { ...cfg.pages, [key]: { ...p, ...x } })
          return (
            <details key={key} style={{ borderBottom: '2px solid var(--bg-3)', padding: '0.75rem 0' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
                {label} {p.hidden && <span className="badge badge-alarm">hidden</span>}
              </summary>
              <div style={{ paddingTop: '1rem' }}>
                <Text label="Meta title" value={p.metaTitle || ''} onChange={(v) => patch({ metaTitle: v })} />
                <Area label="Meta description" rows={2} value={p.metaDescription || ''} onChange={(v) => patch({ metaDescription: v })} />
                <Text label="Heading override" value={p.heading || ''} onChange={(v) => patch({ heading: v })} />
                <Area label="Intro override" rows={3} value={p.intro || ''} onChange={(v) => patch({ intro: v })} />
                <Toggle label="Hide from navigation" value={!!p.hidden} onChange={(v) => patch({ hidden: v })} />
              </div>
            </details>
          )
        })}
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Tools
export function ToolsAdmin({ cfg }: P) {
  const set = useSet()
  const [q, setQ] = useState('')
  const list = TOOLS.filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()))
  const toggle = (slug: string) => {
    const hidden = cfg.tools.hidden.includes(slug) ? cfg.tools.hidden.filter((s) => s !== slug) : [...cfg.tools.hidden, slug]
    set('tools', { hidden })
  }
  const star = (slug: string) => {
    const featured = cfg.tools.featured.includes(slug) ? cfg.tools.featured.filter((s) => s !== slug) : [...cfg.tools.featured, slug]
    set('tools', { featured })
  }
  return (
    <Card title={`Tools (${TOOLS.length})`} desc="Hide a tool to remove it from the menus, the tools index and the home page. Starred tools are pinned to the top of the home page grid.">
      <input className="input" placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: '1rem' }} />
      <div className="admin-list">
        {list.map((t) => {
          const hidden = cfg.tools.hidden.includes(t.slug)
          const featured = cfg.tools.featured.includes(t.slug)
          const ov = cfg.tools.overrides[t.slug] || {}
          return (
            <details key={t.slug} className={`admin-row ${hidden ? 'off' : ''}`} style={{ display: 'block' }}>
              <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span aria-hidden>{t.icon}</span>
                <span className="grow">{ov.name || t.name}</span>
                {featured && <span className="badge badge-acid">★</span>}
                <span className="badge">{hidden ? 'hidden' : 'live'}</span>
              </summary>
              <div style={{ paddingTop: '0.9rem' }}>
                <Text label="Name" value={ov.name ?? t.name} onChange={(v) => set('tools', { overrides: { ...cfg.tools.overrides, [t.slug]: { ...ov, name: v } } })} />
                <Text label="Short description" value={ov.short ?? t.short} onChange={(v) => set('tools', { overrides: { ...cfg.tools.overrides, [t.slug]: { ...ov, short: v } } })} />
                <Area label="Long description" rows={3} value={ov.description ?? t.description} onChange={(v) => set('tools', { overrides: { ...cfg.tools.overrides, [t.slug]: { ...ov, description: v } } })} />
                <div className="row" style={{ gap: '0.5rem' }}>
                  <button className="btn btn-sm" onClick={() => toggle(t.slug)}>
                    {hidden ? 'Show tool' : 'Hide tool'}
                  </button>
                  <button className="btn btn-sm" onClick={() => star(t.slug)}>
                    {featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <Link className="btn btn-sm btn-ghost" to={`/tools/${t.slug}`}>
                    Open
                  </Link>
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------- Content
export function Content({ cfg }: P) {
  const set = useSet()
  const [q, setQ] = useState('')
  const posts = ALL_POSTS.filter((p) => !q || `${p.title} ${p.primaryKeyword}`.toLowerCase().includes(q.toLowerCase()))
  const toggle = (slug: string) => {
    const hidden = cfg.content.hidden.includes(slug) ? cfg.content.hidden.filter((s) => s !== slug) : [...cfg.content.hidden, slug]
    set('content', { hidden })
  }
  return (
    <>
      <Card title={`Blog posts (${ALL_POSTS.length} across ${CLUSTERS.length} clusters)`} desc="Edit the title, meta tags and the short answer that Google and AI assistants quote. Body content lives in the repository under src/content/posts.">
        <input className="input" placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: '1rem' }} />
        <div className="admin-list">
          {posts.map((p) => {
            const ov = cfg.content.overrides[p.slug] || {}
            const hidden = cfg.content.hidden.includes(p.slug)
            const patch = (x: Record<string, unknown>) => set('content', { overrides: { ...cfg.content.overrides, [p.slug]: { ...ov, ...x } } })
            return (
              <details key={p.slug} className={`admin-row ${hidden ? 'off' : ''}`} style={{ display: 'block' }}>
                <summary style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="grow">{ov.title || p.title}</span>
                  <span className="badge">{p.cluster}</span>
                </summary>
                <div style={{ paddingTop: '0.9rem' }}>
                  <Text label="Title" value={ov.title ?? p.title} onChange={(v) => patch({ title: v })} />
                  <Text label="Meta title" value={ov.metaTitle ?? p.metaTitle} onChange={(v) => patch({ metaTitle: v })} hint={`${(ov.metaTitle ?? p.metaTitle).length} characters — aim for under 60.`} />
                  <Area label="Meta description" rows={2} value={ov.metaDescription ?? p.metaDescription} onChange={(v) => patch({ metaDescription: v })} hint={`${(ov.metaDescription ?? p.metaDescription).length} characters — aim for 140-158.`} />
                  <Area label="Short answer" rows={3} value={ov.answer ?? p.answer} onChange={(v) => patch({ answer: v })} hint="40-60 words. This is the block featured snippets and AI assistants lift." />
                  <div className="row" style={{ gap: '0.5rem' }}>
                    <button className="btn btn-sm" onClick={() => toggle(p.slug)}>
                      {hidden ? 'Publish' : 'Unpublish'}
                    </button>
                    <Link className="btn btn-sm btn-ghost" to={`/blog/${p.cluster}/${p.slug}`}>
                      Open
                    </Link>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      </Card>

      <Card title="Clusters">
        <div className="admin-list">
          {CLUSTERS.map((c) => (
            <div className="admin-row" key={c.slug}>
              <span aria-hidden>{c.icon}</span>
              <span className="grow">{c.name}</span>
              <span className="badge">{c.posts.length} posts</span>
              <Link className="btn btn-sm btn-ghost" to={`/blog/${c.slug}`}>
                Open
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- SEO
export function Seo({ cfg }: P) {
  const set = useSet()
  const { toast } = useToast()
  const urls = [
    '/', '/print', '/tools', '/blog', '/pricing', '/about', '/api', '/wordpress', '/website-button', '/extensions/chrome', '/privacy', '/terms',
    ...TOOLS.filter((t) => !cfg.tools.hidden.includes(t.slug)).map((t) => `/tools/${t.slug}`),
    ...CLUSTERS.map((c) => `/blog/${c.slug}`),
    ...ALL_POSTS.filter((p) => !cfg.content.hidden.includes(p.slug)).map((p) => `/blog/${p.cluster}/${p.slug}`),
  ]
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${cfg.site.url}${u}</loc></url>`)
    .join('\n')}\n</urlset>`

  return (
    <>
      <Card title="Search defaults">
        <Text label="Title template" value={cfg.seo.titleTemplate} onChange={(v) => set('seo', { titleTemplate: v })} hint="%s is replaced by the page title." />
        <Area label="Default meta description" rows={2} value={cfg.seo.defaultDescription} onChange={(v) => set('seo', { defaultDescription: v })} />
        <ListEditor label="Global keywords" items={cfg.seo.keywords} onChange={(v) => set('seo', { keywords: v })} placeholder="keyword" />
        <Toggle label="Allow search engines to index the blog" value={cfg.seo.indexBlog} onChange={(v) => set('seo', { indexBlog: v })} />
        <Toggle label="Noindex the entire site" value={cfg.seo.noindexAll} onChange={(v) => set('seo', { noindexAll: v })} hint="Use while staging. Remember to switch it off before launch." />
      </Card>

      <Card title="Verification">
        <Text label="Google Search Console token" mono value={cfg.seo.googleVerification} onChange={(v) => set('seo', { googleVerification: v })} hint="The content value from the HTML tag method." />
        <Text label="Bing Webmaster token" mono value={cfg.seo.bingVerification} onChange={(v) => set('seo', { bingVerification: v })} />
      </Card>

      <Card title="robots.txt and llms.txt" desc="llms.txt is the emerging convention for telling AI assistants what a site is and which pages matter.">
        <Area label="robots.txt" rows={6} value={cfg.seo.robotsTxt} onChange={(v) => set('seo', { robotsTxt: v })} placeholder={`User-agent: *\nAllow: /\nSitemap: ${cfg.site.url}/sitemap.xml`} hint="Leave blank to use the generated default." />
        <Area label="llms.txt" rows={8} value={cfg.seo.llmsTxt} onChange={(v) => set('seo', { llmsTxt: v })} hint="Leave blank to generate one from your clusters at build time." />
      </Card>

      <Card title={`Sitemap preview (${urls.length} URLs)`} desc="The real sitemap.xml is written at build time by scripts/gen-seo.mjs. This preview reflects your current visibility settings.">
        <pre className="code" style={{ maxHeight: 240 }}>{sitemap.slice(0, 1600)}…</pre>
        <button
          className="btn btn-sm btn-acid"
          onClick={() => {
            downloadBlob(new Blob([sitemap], { type: 'application/xml' }), 'sitemap.xml')
            toast('sitemap.xml downloaded')
          }}
        >
          Download sitemap.xml
        </button>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Analytics
export function Analytics({ cfg }: P) {
  const set = useSet()
  const { toast } = useToast()
  const hits = getHits()
  const now = Date.now()
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * 864e5)
    const key = d.toISOString().slice(0, 10)
    return { key, n: hits.filter((h) => new Date(h.t).toISOString().slice(0, 10) === key).length }
  })
  const max = Math.max(1, ...days.map((d) => d.n))
  const refs = useMemo(() => {
    const m = new Map<string, number>()
    hits.forEach((h) => m.set(h.ref, (m.get(h.ref) || 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [hits])

  return (
    <>
      <Card title="Connect an analytics provider" desc="Scripts are injected on every page as soon as you fill in an ID. Leave a field blank to disable that provider.">
        <Text label="Google Analytics 4 measurement ID" mono value={cfg.analytics.ga4Id} onChange={(v) => set('analytics', { ga4Id: v })} placeholder="G-XXXXXXXXXX" />
        <Text label="Plausible domain" mono value={cfg.analytics.plausibleDomain} onChange={(v) => set('analytics', { plausibleDomain: v })} placeholder="printxpdf.vercel.app" />
        <Text label="Umami website ID" mono value={cfg.analytics.umamiId} onChange={(v) => set('analytics', { umamiId: v })} />
        <Text label="Umami script URL" mono value={cfg.analytics.umamiSrc} onChange={(v) => set('analytics', { umamiSrc: v })} />
        <Toggle label="Respect Do Not Track" value={cfg.analytics.respectDnt} onChange={(v) => set('analytics', { respectDnt: v })} hint="Skips all analytics for visitors who enabled the browser setting." />
        <Toggle label="Keep local view counts" value={cfg.analytics.localStats} onChange={(v) => set('analytics', { localStats: v })} hint="Stored in this browser only. Useful before you connect a provider." />
      </Card>

      <Card title="Local views, last 14 days" desc="Only counts visits made in this browser.">
        <div className="row" style={{ gap: 4, alignItems: 'flex-end', height: 120, marginBottom: '0.5rem' }}>
          {days.map((d) => (
            <div key={d.key} title={`${d.key}: ${d.n}`} style={{ flex: 1, background: 'var(--acid)', border: '2px solid var(--line)', height: `${(d.n / max) * 100}%`, minHeight: 4 }} />
          ))}
        </div>
        <div className="row between mono muted" style={{ fontSize: '0.7rem' }}>
          <span>{days[0].key}</span>
          <span>{days[days.length - 1].key}</span>
        </div>
        <h4 style={{ marginTop: '1.5rem' }}>Top referrers</h4>
        {refs.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Nothing yet.
          </p>
        ) : (
          refs.map(([r, n]) => (
            <div className="admin-row" key={r}>
              <span className="grow">{r}</span>
              <span className="mono">{n}</span>
            </div>
          ))
        )}
        <button
          className="btn btn-sm btn-alarm"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            clearHits()
            toast('Local stats cleared')
          }}
        >
          Clear local stats
        </button>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Code
export function Code({ cfg }: P) {
  const set = useSet()
  return (
    <>
      <Card title="Custom code" desc="Injected on every page of the live site. Scripts you paste here run with full access to the page.">
        <div className="callout warn" style={{ marginTop: 0 }}>
          <span className="k">Watch out</span>
          <p>Only paste code you wrote or trust. A third-party snippet can read anything on the page, including files a visitor has open in a tool.</p>
        </div>
        <Area label="Head HTML" rows={6} value={cfg.code.headHtml} onChange={(v) => set('code', { headHtml: v })} hint="Meta tags, preconnects, verification tags, tag-manager snippets." />
        <Area label="Body end HTML" rows={6} value={cfg.code.bodyEndHtml} onChange={(v) => set('code', { bodyEndHtml: v })} hint="Chat widgets and anything that should load last." />
        <Area label="Custom CSS" rows={8} value={cfg.code.css} onChange={(v) => set('code', { css: v })} hint="Applied after the site stylesheet, so it wins." />
        <Area label="Custom JavaScript" rows={8} value={cfg.code.js} onChange={(v) => set('code', { js: v })} />
      </Card>

      <Card title="Useful selectors" desc="Handy hooks for custom CSS.">
        <pre className="code">{`.header          /* top navigation */
.footer          /* site footer */
.btn-acid        /* primary buttons */
.card            /* every panel */
.pxp-page        /* the printable paper in the web cleaner */
body.pxp-editor-open  /* set while the cleaner is open */
@media print { }      /* print output */`}</pre>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------- Data
export function Data({ cfg }: P) {
  const { toast } = useToast()
  const [pass, setPass] = useState('')
  const json = exportConfig()
  return (
    <>
      <Card title="Publish your changes" desc="This site is static, so the panel saves a draft in your browser. To make changes live for every visitor, publish the config file into the repository.">
        <ol style={{ fontWeight: 600, paddingLeft: '1.2rem', lineHeight: 1.8 }}>
          <li>Download <code className="inline">site-config.json</code> below.</li>
          <li>Replace <code className="inline">public/site-config.json</code> in the repository with it.</li>
          <li>Commit and push. Vercel redeploys automatically and everyone sees the change.</li>
        </ol>
        <div className="row" style={{ gap: '0.5rem' }}>
          <button
            className="btn btn-acid"
            onClick={() => {
              downloadBlob(new Blob([json], { type: 'application/json' }), 'site-config.json')
              toast('site-config.json downloaded')
            }}
          >
            Download site-config.json
          </button>
          <button
            className="btn"
            onClick={() => {
              navigator.clipboard.writeText(json).then(
                () => toast('Config copied'),
                () => toast('Clipboard blocked', 'error'),
              )
            }}
          >
            Copy JSON
          </button>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            Import JSON
            <input
              type="file"
              accept=".json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                try {
                  const text = await f.text()
                  // an imported config can carry head/body HTML and JavaScript that this site
                  // then runs on every page, so it needs the same scrutiny as pasting a script
                  if (
                    importCarriesCode(text) &&
                    !confirm(
                      'This file contains custom HTML or JavaScript that will run on every page of your site, with access to anything a visitor has open.\n\nOnly continue if you trust where it came from. Import anyway?',
                    )
                  ) {
                    e.target.value = ''
                    return
                  }
                  importConfig(text)
                  toast('Config imported')
                } catch (err) {
                  toast(`Could not import: ${(err as Error).message}`, 'error')
                }
                e.target.value = ''
              }}
            />
          </label>
          <button
            className="btn btn-alarm"
            onClick={() => {
              if (!confirm('Discard every unpublished change and go back to the published config?')) return
              discardDraft()
              toast('Draft discarded')
            }}
          >
            Discard draft
          </button>
        </div>
      </Card>

      <Card title="Admin passcode" desc="Gates this panel in your browser. It is not a security boundary: anyone with the repository can change the site regardless.">
        <Text label="New passcode" value={pass} onChange={setPass} />
        <button
          className="btn btn-sm"
          onClick={() => {
            if (pass.length < 4) return toast('Use at least 4 characters', 'error')
            setPasscode(pass)
            setPass('')
            toast('Passcode updated in this browser')
          }}
        >
          Update passcode
        </button>
      </Card>

      <Card title="Current config" desc={`Version ${cfg.version}, last edited ${cfg.updatedAt}.`}>
        <pre className="code" style={{ maxHeight: 320 }}>{json}</pre>
      </Card>
    </>
  )
}
