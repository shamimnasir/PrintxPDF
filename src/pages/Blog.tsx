import { Link, useParams } from 'react-router-dom'
import { POSTS } from './blogPosts'

export default function Blog() {
  const { slug } = useParams()
  const post = POSTS.find((p) => p.slug === slug)

  if (post) {
    return (
      <div className="container section" style={{ maxWidth: 760 }}>
        <Link to="/blog" className="badge">
          ← Blog
        </Link>
        <h1 style={{ marginTop: '1rem' }}>{post.title}</h1>
        <div className="mono muted" style={{ marginBottom: '2rem' }}>
          {post.date}
        </div>
        {post.body.map((p, i) => (
          <p key={i} style={{ fontSize: '1.15rem', lineHeight: 1.7 }}>
            {p}
          </p>
        ))}
        <div className="card card-acid" style={{ marginTop: '2rem' }}>
          <strong>Try it on this post:</strong>{' '}
          <Link to={`/print?post=${post.slug}`}>open in the cleaner →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <span className="eyebrow">Blog</span>
      <h1>Notes on paper, pixels and PDFs</h1>
      <div className="grid grid-3" style={{ marginTop: '2rem' }}>
        {POSTS.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="card card-hover" style={{ textDecoration: 'none' }}>
            <div className="mono muted" style={{ fontSize: '0.75rem' }}>
              {p.date}
            </div>
            <h3 style={{ marginTop: '0.5rem' }}>{p.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{p.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
