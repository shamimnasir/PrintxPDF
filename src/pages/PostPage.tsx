import { Link, Navigate, useParams } from 'react-router-dom'
import { useAllPosts, useCluster, usePost } from '../content/usePosts'
import type { Block } from '../content/types'
import { useTool } from '../features/pdf/useTools'
import { articleSchema, authorPath, breadcrumbSchema, faqSchema, howToSchema, useSeo } from '../lib/seo'
import { useSiteConfig } from '../admin/useSiteConfig'
import { Avatar } from '../components/ui/Avatar'
import { AuthorBox } from '../components/ui/AuthorBox'
import '../content/blog.css'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Renders inline markup: **bold**, [text](/path) and `code`. Content is authored by us, not user input. */
export function Rich({ x }: { x: string }) {
  const nodes: React.ReactNode[] = []
  // link paths may contain balanced parentheses, e.g. /blog/x/y(2)
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+)\)|`([^`]+)`/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(x))) {
    if (m.index > last) nodes.push(x.slice(last, m.index))
    // dispatch on which group matched, not on truthiness, the literal "0" is falsy
    if (m[1] !== undefined) nodes.push(<strong key={i++}>{m[1]}</strong>)
    else if (m[2] !== undefined && m[3] !== undefined)
      nodes.push(
        m[3].startsWith('/') ? (
          <Link key={i++} to={m[3]}>
            {m[2]}
          </Link>
        ) : (
          <a key={i++} href={m[3]} target="_blank" rel="noopener noreferrer">
            {m[2]}
          </a>
        ),
      )
    else if (m[4] !== undefined) nodes.push(<code key={i++} className="inline">{m[4]}</code>)
    last = re.lastIndex
  }
  if (last < x.length) nodes.push(x.slice(last))
  return <>{nodes}</>
}

function CtaBlock({ slug, x }: { slug: string; x: string }) {
  const tool = useTool(slug)
  if (!tool) return null
  return (
    <div className="inline-cta">
      <p>{x}</p>
      <Link to={`/tools/${tool.slug}`} className="btn btn-acid btn-sm">
        {tool.name} →
      </Link>
    </div>
  )
}

function BlockView({ b, n }: { b: Block; n: number }) {
  switch (b.t) {
    case 'p':
      return (
        <p>
          <Rich x={b.x} />
        </p>
      )
    case 'h2':
      return <h2 id={slugify(b.x)}>{b.x}</h2>
    case 'h3':
      return <h3 id={slugify(b.x)}>{b.x}</h3>
    case 'ul':
      return (
        <ul>
          {b.items.map((it, i) => (
            <li key={i}>
              <Rich x={it} />
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol>
          {b.items.map((it, i) => (
            <li key={i}>
              <Rich x={it} />
            </li>
          ))}
        </ol>
      )
    case 'steps':
      return (
        <ol className="steps">
          {b.items.map((it, i) => (
            // a post may contain several procedures, so anchors are namespaced by block
            <li key={i} id={`step-${n}-${i + 1}`}>
              <strong>{it.h}</strong>
              <Rich x={it.x} />
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <div className="table-scroll" tabIndex={0} role="region" aria-label={b.caption || 'Table'}>
        <table className="table">
          {b.caption && <caption className="muted" style={{ captionSide: 'bottom', fontSize: '0.8rem', paddingTop: '0.5rem', textAlign: 'left' }}>{b.caption}</caption>}
          <thead>
            <tr>
              {b.head.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>
                    <Rich x={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )
    case 'note':
    case 'tip':
    case 'warn':
      return (
        <div className={`callout ${b.t}`}>
          <span className="k">{b.t === 'warn' ? 'Watch out' : b.t === 'tip' ? 'Tip' : 'Note'}</span>
          <p>
            <Rich x={b.x} />
          </p>
        </div>
      )
    case 'quote':
      return (
        <blockquote style={{ borderLeft: '4px solid var(--acid)', paddingLeft: '1rem', fontStyle: 'italic', margin: '1.5rem 0' }}>
          <Rich x={b.x} />
        </blockquote>
      )
    case 'code':
      return <pre className="code">{b.x}</pre>
    case 'cta':
      return <CtaBlock slug={b.tool} x={b.x} key={n} />
    default:
      return null
  }
}

function AsideTool({ slug }: { slug: string }) {
  const tool = useTool(slug)
  return tool ? (
    <Link to={`/tools/${tool.slug}`} className="btn btn-sm btn-acid btn-block">
      {tool.name}
    </Link>
  ) : null
}

export default function PostPage() {
  const { cluster: clusterSlug = '', post: postSlug = '' } = useParams()
  const post = usePost(postSlug)
  const cluster = useCluster(clusterSlug)
  const allPosts = useAllPosts()
  const cfg = useSiteConfig()
  const valid = post && cluster && post.cluster === cluster.slug
  const path = `/blog/${clusterSlug}/${postSlug}`
  // a post can document more than one procedure; HowTo gets all of them, in order
  const stepBlocks = (post?.body || []).flatMap((b, i) => (b.t === 'steps' ? [{ block: b, index: i }] : []))
  const allSteps = stepBlocks.flatMap(({ block }) => block.items)
  const stepAnchors = stepBlocks.flatMap(({ block, index }) => block.items.map((_, i) => `step-${index}-${i + 1}`))

  useSeo({
    title: post?.metaTitle || 'Not found',
    description: post?.metaDescription || '',
    path,
    type: 'article',
    published: post?.published,
    updated: post?.updated,
    keywords: post ? [post.primaryKeyword, ...post.secondaryKeywords] : [],
    noindex: !valid,
    schema:
      valid && post
        ? [
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Guides', path: '/blog' },
              { name: cluster.name, path: `/blog/${cluster.slug}` },
              { name: post.title, path },
            ]),
            articleSchema({
              title: post.title,
              description: post.metaDescription,
              path,
              published: post.published,
              updated: post.updated,
              keywords: [post.primaryKeyword, ...post.secondaryKeywords, ...post.entities],
              answer: post.answer,
              readMinutes: post.readMinutes,
              author: cfg.author,
            }),
            ...(post.faqs.length ? [faqSchema(post.faqs)] : []),
            ...(allSteps.length ? [howToSchema({ title: post.title, description: post.metaDescription, steps: allSteps, path, anchors: stepAnchors })] : []),
          ]
        : [],
  })

  if (!valid) return <Navigate to="/blog" replace />

  const headings = post.body.filter((b): b is Extract<Block, { t: 'h2' }> => b.t === 'h2')
  const related = post.relatedPosts.map((s) => allPosts.find((p) => p.slug === s)).filter((p) => !!p)

  return (
    <div className="container section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> <span aria-hidden>/</span> <Link to="/blog">Guides</Link> <span aria-hidden>/</span>{' '}
        <Link to={`/blog/${cluster.slug}`}>{cluster.name}</Link> <span aria-hidden>/</span> <span>{post.title}</span>
      </nav>

      <div className="post-wrap">
        <article>
          <header className="post-head">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="byline">
                <Avatar src={cfg.author.photo} name={cfg.author.name} size={32} />
                <span>
                  By <Link to={authorPath(cfg.author)}>{cfg.author.name}</Link>
                </span>
              </span>
              <span>Updated {new Date(post.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>{post.readMinutes} min read</span>
              <span>{cluster.name}</span>
            </div>
          </header>

          <div className="post-answer">
            <span className="label">Short answer</span>
            <p>{post.answer}</p>
          </div>

          <div className="prose">
            {post.body.map((b, i) => (
              <BlockView key={i} b={b} n={i} />
            ))}

            {post.faqs.length > 0 && (
              <>
                <h2 id="faq">Frequently asked questions</h2>
                <div>
                  {post.faqs.map((f) => (
                    <div className="faq-item" key={f.q}>
                      <h3>{f.q}</h3>
                      <p>
                        <Rich x={f.a} />
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <AuthorBox />

          {related.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h2>Keep reading</h2>
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.cluster}/${r.slug}`} className="post-row">
                  <span className="post-row-title">{r.title}</span>
                  <span className="mono">{r.readMinutes} min</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside className="post-aside">
          {headings.length > 2 && (
            <nav className="toc" aria-label="On this page">
              <span className="label" style={{ margin: 0 }}>
                On this page
              </span>
              <ol>
                {headings.map((h) => (
                  <li key={h.x}>
                    <a href={`#${slugify(h.x)}`}>{h.x}</a>
                  </li>
                ))}
                {post.faqs.length > 0 && (
                  <li>
                    <a href="#faq">FAQ</a>
                  </li>
                )}
              </ol>
            </nav>
          )}

          {post.relatedTools.length > 0 && (
            <div className="card card-ink">
              <span className="label" style={{ color: 'var(--acid-dim)' }}>
                Do it now, free
              </span>
              <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                {post.relatedTools.map((t) => (
                  <AsideTool key={t} slug={t} />
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '0.75rem 0 0' }}>
                Runs in your browser. No sign-up, no upload.
              </p>
            </div>
          )}

          <div className="card card-flat">
            <span className="label">Topics covered</span>
            <div className="kw-list">
              {post.entities.slice(0, 10).map((e) => (
                <span key={e} className="badge">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
