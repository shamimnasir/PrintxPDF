import { Link, Navigate, useParams } from 'react-router-dom'
import { useSiteConfig } from '../admin/useSiteConfig'
import { useAllPosts, useClusters } from '../content/usePosts'
import { authorPath, breadcrumbSchema, profileSchema, slugify, useSeo } from '../lib/seo'
import '../content/blog.css'

const LABEL: Record<string, string> = { linkedin: 'LinkedIn', x: 'X / Twitter', github: 'GitHub', website: 'Website' }

/** Profile page for the founder: the entity every Article.author and Organization.founder points at. */
export default function AuthorPage() {
  const { slug = '' } = useParams()
  const cfg = useSiteConfig()
  const clusters = useClusters()
  const posts = [...useAllPosts()].sort((a, b) => b.updated.localeCompare(a.updated))
  const a = cfg.author
  const valid = slug === slugify(a.name)
  const path = authorPath(a)
  const links = Object.entries(a.links).filter(([, v]) => v)
  const first = a.name.split(' ')[0]

  useSeo({
    title: `${a.name} — ${a.title}`,
    description: (a.bio || `${a.name} is the founder of ${cfg.site.name} and writes its guides on printing web pages cleanly and working with PDF files.`).slice(0, 158),
    path,
    noindex: !valid,
    schema: valid
      ? [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/blog' },
            { name: a.name, path },
          ]),
          profileSchema(a, clusters.map((c) => c.name)),
        ]
      : [],
  })

  if (!valid) return <Navigate to="/blog" replace />

  return (
    <div className="container section" style={{ maxWidth: 900 }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden>/</span> <Link to="/blog">Guides</Link> <span aria-hidden>/</span> <span>{a.name}</span>
      </nav>
      <span className="eyebrow">Author · Founder</span>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {a.photo && <img src={a.photo} alt={a.name} width={120} height={120} style={{ objectFit: 'cover', flex: '0 0 auto' }} />}
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.6rem)' }}>{a.name}</h1>
          <p className="lead" style={{ marginTop: 0 }}>{a.title}</p>
          {a.bio && <p>{a.bio}</p>}
          {links.length > 0 && (
            <div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              {links.map(([k, v]) => (
                <a key={k} href={v} className="btn btn-sm" rel="me noopener" target="_blank">
                  {LABEL[k] || k}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 style={{ marginTop: '3rem' }}>Guides by {first}</h2>
      <p className="muted">
        {posts.length} guides across {clusters.length} topics, written and kept current by the founder. Most recently updated first.
      </p>
      <div className="stack">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.cluster}/${p.slug}`} className="post-row">
            <span className="post-row-title">{p.title}</span>
            <span className="mono">{p.updated}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
