import { Link } from 'react-router-dom'
import { useAllPosts, useClusters } from '../content/usePosts'
import { authorPath, authorPerson, breadcrumbSchema, SITE_URL, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'
import '../content/blog.css'

export default function Blog() {
  const CLUSTERS = useClusters()
  const ALL_POSTS = useAllPosts()
  const cfg = useSiteConfig()
  const recent = [...ALL_POSTS].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 8)
  useSeo({
    title: 'Printing & PDF Guides — PrintxPDF Blog',
    description: `${ALL_POSTS.length} free guides on printing web pages without ads, merging and compressing PDFs, e-signatures, OCR and more. Every method runs in your browser.`,
    path: '/blog',
    keywords: ['pdf tutorials', 'how to print a web page', 'pdf guides', 'printer friendly'],
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/blog' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'PrintxPDF guides',
        url: `${SITE_URL}/blog`,
        description: 'Guides on printing web pages and working with PDF files in the browser.',
        author: authorPerson(cfg.author),
        hasPart: CLUSTERS.map((c) => ({ '@type': 'WebPage', name: c.title, url: `${SITE_URL}/blog/${c.slug}` })),
      },
    ],
  })

  return (
    <div className="container section">
      <span className="eyebrow">
        {CLUSTERS.length} topics · {ALL_POSTS.length} guides
      </span>
      <h1>
        How to print, convert
        <br />
        and <span className="acid-mark">fix any document.</span>
      </h1>
      <p className="lead" style={{ marginBottom: '2.5rem' }}>
        Plain-English guides to printing web pages without the clutter and getting PDFs to behave. Every method here works
        in a normal browser, free, with no upload.
      </p>
      <p className="muted" style={{ marginTop: '-1.5rem', marginBottom: '2.5rem' }}>
        Written and maintained by <Link to={authorPath(cfg.author)}>{cfg.author.name}</Link>, founder of {cfg.site.name}.
      </p>

      <div className="grid grid-3">
        {CLUSTERS.map((c) => (
          <Link key={c.slug} to={`/blog/${c.slug}`} className="card card-hover cluster-card">
            <div className="row" style={{ gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="tool-icon" style={{ width: 40, height: 40, fontSize: '1.1rem', margin: 0 }} aria-hidden>
                {c.icon}
              </span>
              <span className="badge">{c.posts.length} guides</span>
            </div>
            <h3>{c.name}</h3>
            <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>
              {c.metaDescription}
            </p>
            <ul>
              {c.posts.slice(0, 3).map((p) => (
                <li key={p.slug}>{p.title}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>

      <div className="section-tight" style={{ marginTop: '3rem' }}>
        <h2>Recently updated</h2>
        <div style={{ maxWidth: 820 }}>
          {recent.map((p) => (
            <Link key={p.slug} to={`/blog/${p.cluster}/${p.slug}`} className="post-row">
              <span className="post-row-title">{p.title}</span>
              <span className="mono">{p.updated}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
