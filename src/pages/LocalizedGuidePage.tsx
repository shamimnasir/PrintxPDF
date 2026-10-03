import { Link, Navigate, useParams } from 'react-router-dom'
import { guideAlternates, guidePath, hubAlternates } from '../content/localizedGuides'
import type { LanguagePack } from '../content/localizedGuides'
import { breadcrumbSchema, faqSchema, SITE_URL, useSeo } from '../lib/seo'
import { useTool } from '../features/pdf/useTools'
import type { Block } from '../content/types'
import '../content/blog.css'

function InlineCopy({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  // Keep internal tool and guide links navigable inside translated copy.
  const links = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(((?:[^()]|\([^()]*\))+?)\)|`([^`]+)`/g
  while ((match = links.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1] !== undefined) nodes.push(<strong key={key++}>{match[1]}</strong>)
    else if (match[2] !== undefined && match[3] !== undefined) nodes.push(match[3].startsWith('/')
      ? <Link key={key++} to={match[3]}>{match[2]}</Link>
      : <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>)
    else if (match[4] !== undefined) nodes.push(<code key={key++} className="inline">{match[4]}</code>)
    last = links.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}

function LocalizedBlock({ block }: { block: Block }) {
  switch (block.t) {
    case 'p': return <p><InlineCopy text={block.x} /></p>
    case 'h2': return <h2>{block.x}</h2>
    case 'h3': return <h3>{block.x}</h3>
    case 'ul': return <ul>{block.items.map((item, i) => <li key={i}><InlineCopy text={item} /></li>)}</ul>
    case 'ol': return <ol>{block.items.map((item, i) => <li key={i}><InlineCopy text={item} /></li>)}</ol>
    case 'steps': return <ol className="steps">{block.items.map((item, i) => <li key={i}><strong>{item.h}</strong><InlineCopy text={item.x} /></li>)}</ol>
    case 'table': return <div className="table-scroll" tabIndex={0}><table className="table">{block.caption && <caption>{block.caption}</caption>}<thead><tr>{block.head.map((item) => <th key={item} scope="col">{item}</th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((item, j) => <td key={j}><InlineCopy text={item} /></td>)}</tr>)}</tbody></table></div>
    case 'note':
    case 'tip':
    case 'warn': return <aside className={`callout ${block.t}`}><p><InlineCopy text={block.x} /></p></aside>
    case 'quote': return <blockquote><InlineCopy text={block.x} /></blockquote>
    case 'code': return <pre className="code">{block.x}</pre>
    case 'cta': return <p><InlineCopy text={block.x} /> <Link to={`/tools/${block.tool}`}>{block.tool}</Link></p>
  }
}

const toolDirectoryLabel: Record<string, string> = { es: 'Todas las herramientas', 'pt-BR': 'Todas as ferramentas', hi: 'सभी टूल', ar: 'كل الأدوات', bn: 'সব টুল', vi: 'Tất cả công cụ', 'zh-CN': '查看所有工具' }
const localizedToolPath = (slug: string) => slug === 'website-to-pdf' ? '/print' : `/tools/${slug}`

export default function LocalizedGuidePage({ pack }: { pack: LanguagePack }) {
  const { locale = '', hub = '', slug } = useParams()
  const matchingRoute = pack.locale.toLowerCase() === locale.toLowerCase() && pack.hub === hub
  const guide = pack?.guides.find((item) => item.slug === slug)
  const path = pack ? guidePath(pack, guide?.slug) : `/${locale}/${hub}${slug ? `/${slug}` : ''}`
  const tool = useTool(guide?.tool || '')
  const alternates = guide ? guideAlternates(guide.topic, SITE_URL) : pack ? hubAlternates(SITE_URL) : []

  useSeo({
    title: guide?.metaTitle || pack?.hubTitle || 'Not found',
    description: guide?.metaDescription || pack?.hubDescription || '',
    path,
    type: guide ? 'article' : 'website',
    published: guide ? guide.published || '2026-10-03' : undefined,
    updated: guide ? guide.updated || '2026-10-03' : undefined,
    keywords: guide ? [guide.keyword, ...guide.secondaryKeywords] : [],
    lang: pack?.locale || 'en',
    dir: pack?.dir || 'ltr',
    alternates,
    noindex: !pack || (!!slug && !guide),
    schema: pack
      ? [
          breadcrumbSchema(
            guide
              ? [
                  { name: pack.homeLabel, path: '/' },
                  { name: pack.hubTitle, path: guidePath(pack) },
                  { name: guide.title, path },
                ]
              : [
                  { name: pack.homeLabel, path: '/' },
                  { name: pack.hubTitle, path },
                ],
          ),
          guide
            ? {
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: guide.title,
                description: guide.metaDescription,
                abstract: guide.answer,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${path}` },
                datePublished: guide.published || '2026-10-03',
                dateModified: guide.updated || '2026-10-03',
                author: { '@type': 'Organization', name: 'PrintxPDF' },
                publisher: { '@type': 'Organization', name: 'PrintxPDF', url: SITE_URL },
                keywords: [guide.keyword, ...guide.secondaryKeywords].join(', '),
                inLanguage: pack.locale,
                isAccessibleForFree: true,
              }
            : {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: pack.hubTitle,
                description: pack.hubDescription,
                url: `${SITE_URL}${path}`,
                inLanguage: pack.locale,
                hasPart: pack.guides.map((item) => ({ '@type': 'Article', headline: item.title, url: `${SITE_URL}${guidePath(pack, item.slug)}` })),
              },
          ...(guide?.faqs.length ? [faqSchema(guide.faqs)] : []),
        ]
      : [],
  })

  if (!matchingRoute) return <Navigate to="/blog" replace />

  if (!guide) {
    return (
      <div className="container section">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">{pack.homeLabel}</Link> <span aria-hidden="true">/</span> <span>{pack.hubTitle}</span>
        </nav>
        <div className="localized-guide-content">
          <span className="eyebrow">{pack.name}</span>
          <h1>{pack.hubTitle}</h1>
          <p className="lead">{pack.hubIntro}</p>
          <div className="post-answer">
            <span className="label">{pack.readLabel}</span>
            <p>{pack.hubAnswer}</p>
          </div>
          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            {pack.guides.map((item) => (
              <Link key={item.slug} to={guidePath(pack, item.slug)} className="card card-hover" style={{ textDecoration: 'none' }}>
                <span className="badge badge-acid">{item.keyword}</span>
                <h2 style={{ fontSize: '1.35rem', marginTop: '0.8rem' }}>{item.title}</h2>
                <p>{item.answer}</p>
                <span className="btn btn-acid btn-sm">{pack.guideLabel} →</span>
              </Link>
            ))}
          </div>
          <p className="muted" style={{ marginTop: '1.5rem' }}>{pack.toolNote}</p>
          <p><Link to="/tools">{toolDirectoryLabel[pack.locale] || 'All tools'}</Link> · <Link to="/blog">English guides</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{pack.homeLabel}</Link> <span aria-hidden="true">/</span> <Link to={guidePath(pack)}>{pack.hubTitle}</Link> <span aria-hidden="true">/</span> <span>{guide.title}</span>
      </nav>
      <article className="localized-guide-content">
        <span className="eyebrow">{pack.readLabel} · {pack.name}</span>
        <h1 className="localized-guide-title" lang={pack.locale}>{guide.title}</h1>
        <p className="post-meta muted">{pack.updated}</p>
        <div className="post-answer">
          <span className="label">{pack.readLabel}</span>
          <p>{guide.answer}</p>
        </div>
        <div className="prose">
          {guide.body ? guide.body.map((block, index) => <LocalizedBlock key={index} block={block} />) : guide.sections?.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
              {section.steps && (
                <ol className="steps">
                  {section.steps.map((step) => <li key={step.heading}><strong>{step.heading}</strong><span>{step.text}</span></li>)}
                </ol>
              )}
            </section>
          ))}
        </div>
        <div className="inline-cta">
          <p>{guide.ctaLabel}</p>
          <Link to={localizedToolPath(guide.tool)} className="btn btn-acid">{guide.ctaLabel} →</Link>
          {tool && <span className="muted">{tool.name}</span>}
        </div>
        <p className="muted">{pack.toolNote}</p>
        <section aria-labelledby="localized-faqs">
          <h2 id="localized-faqs">{pack.faqsLabel}</h2>
          <div className="stack" style={{ gap: '0.8rem' }}>
            {guide.faqs.map((faq) => (
              <details className="card faq-item" key={faq.q}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{faq.q}</summary>
                <p style={{ marginBottom: 0 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
        <p style={{ marginTop: '2rem' }}><Link to={`/tools/${guide.tool}`}>{tool?.name || guide.tool}</Link> · <Link to="/tools">{toolDirectoryLabel[pack.locale] || 'All tools'}</Link> · <Link to={guidePath(pack)}>{pack.backLabel}</Link> · <Link to="/blog">English guides</Link></p>
      </article>
    </div>
  )
}
