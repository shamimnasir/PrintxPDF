import { Link, Navigate, useParams } from 'react-router-dom'
import { CLUSTERS } from '../content'
import { useCluster } from '../content/usePosts'
import { useTool } from '../features/pdf/useTools'
import { ToolCard } from '../features/pdf/ToolCard'
import { authorPath, breadcrumbSchema, faqSchema, SITE_URL, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'
import { Avatar } from '../components/ui/Avatar'
import '../content/blog.css'
import '../features/pdf/tools.css'

function ClusterTool({ slug }: { slug: string }) {
  const tool = useTool(slug)
  return tool ? <ToolCard tool={tool} /> : null
}

export default function ClusterPage() {
  const { cluster: slug = '' } = useParams()
  const cluster = useCluster(slug)
  const cfg = useSiteConfig()

  useSeo({
    title: cluster?.metaTitle || 'Not found',
    description: cluster?.metaDescription || '',
    path: `/blog/${slug}`,
    keywords: cluster ? [cluster.primaryKeyword, ...cluster.entities] : [],
    schema: cluster
      ? [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/blog' },
            { name: cluster.name, path: `/blog/${cluster.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: cluster.title,
            description: cluster.metaDescription,
            url: `${SITE_URL}/blog/${cluster.slug}`,
            about: cluster.entities.map((e) => ({ '@type': 'Thing', name: e })),
            hasPart: cluster.posts.map((p) => ({ '@type': 'Article', headline: p.title, url: `${SITE_URL}/blog/${cluster.slug}/${p.slug}` })),
          },
          // the same answers are rendered on the cards below, which Google requires for FAQ markup
          ...(cluster.posts.length ? [faqSchema(cluster.posts.map((p) => ({ q: p.title, a: p.answer })))] : []),
        ]
      : [],
    noindex: !cluster,
  })

  if (!cluster || cluster.posts.length === 0) return <Navigate to="/blog" replace />

  const others = CLUSTERS.filter((c) => c.slug !== cluster.slug).slice(0, 6)

  return (
    <div className="container section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden>/</span> <Link to="/blog">Guides</Link> <span aria-hidden>/</span>{' '}
        <span>{cluster.name}</span>
      </nav>

      <div style={{ maxWidth: 780 }}>
        <span className="eyebrow">{cluster.posts.length}-part guide</span>
        <h1>{cluster.title}</h1>
        <div className="post-meta">
          <span className="byline">
            <Avatar src={cfg.author.photo} name={cfg.author.name} size={32} />
            <span>
              By <Link to={authorPath(cfg.author)}>{cfg.author.name}</Link> · {cfg.author.title}
            </span>
          </span>
          <span>{cluster.posts.length} guides</span>
        </div>
        <div className="post-answer">
          <span className="label">Short answer</span>
          <p>{cluster.answer}</p>
        </div>
        <p className="lead">{cluster.intro}</p>
      </div>

      <h2 style={{ marginTop: '2.5rem' }}>Every guide in this topic</h2>
      <div className="grid grid-2">
        {cluster.posts.map((p) => (
          <Link key={p.slug} to={`/blog/${cluster.slug}/${p.slug}`} className="card card-hover" style={{ textDecoration: 'none' }}>
            <div className="row" style={{ gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-acid">{p.intent === 'howto' ? 'How-to' : p.intent === 'comparison' ? 'Comparison' : p.intent === 'troubleshooting' ? 'Fix it' : p.intent === 'listicle' ? 'List' : 'Explainer'}</span>
              <span className="mono muted" style={{ fontSize: '0.7rem' }}>
                {p.readMinutes} min
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: '-0.01em', fontWeight: 900, fontSize: '1.2rem' }}>{p.title}</h3>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{p.answer}</p>
          </Link>
        ))}
      </div>

      {cluster.tools.length > 0 && (
        <>
          <h2 style={{ marginTop: '3rem' }}>Tools for this job</h2>
          <div className="grid grid-4">
            {cluster.tools.map((t) => (
              <ClusterTool key={t} slug={t} />
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: '3rem' }}>Other topics</h2>
      <div className="grid grid-3">
        {others.map((c) => (
          <Link key={c.slug} to={`/blog/${c.slug}`} className="card card-hover cluster-card">
            <h3>{c.name}</h3>
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              {c.metaDescription}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
