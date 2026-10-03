import { Link, Navigate, useParams } from 'react-router-dom'
import { languagePack, guideAlternates, guidePath, hubAlternates } from '../content/localizedGuides'
import { breadcrumbSchema, faqSchema, SITE_URL, useSeo } from '../lib/seo'
import { useTool } from '../features/pdf/useTools'
import '../content/blog.css'

export default function LocalizedGuidePage() {
  const { locale = '', hub = '', slug } = useParams()
  const pack = languagePack(locale, hub)
  const guide = pack?.guides.find((item) => item.slug === slug)
  const path = pack ? guidePath(pack, guide?.slug) : `/${locale}/${hub}${slug ? `/${slug}` : ''}`
  const tool = useTool(guide?.tool || '')
  const alternates = guide ? guideAlternates(guide.topic, SITE_URL) : pack ? hubAlternates(SITE_URL) : []

  useSeo({
    title: guide?.metaTitle || pack?.hubTitle || 'Not found',
    description: guide?.metaDescription || pack?.hubDescription || '',
    path,
    type: guide ? 'article' : 'website',
    published: guide ? '2026-10-03' : undefined,
    updated: guide ? '2026-10-03' : undefined,
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
                datePublished: '2026-10-03',
                dateModified: '2026-10-03',
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

  if (!pack) return <Navigate to="/blog" replace />

  if (!guide) {
    return (
      <div className="container section">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">{pack.homeLabel}</Link> <span aria-hidden="true">/</span> <span>{pack.hubTitle}</span>
        </nav>
        <div className="post-wrap">
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
          <p><Link to="/blog">English guides</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{pack.homeLabel}</Link> <span aria-hidden="true">/</span> <Link to={guidePath(pack)}>{pack.hubTitle}</Link> <span aria-hidden="true">/</span> <span>{guide.title}</span>
      </nav>
      <article className="post-wrap">
        <span className="eyebrow">{pack.readLabel} · {pack.name}</span>
        <h1>{guide.title}</h1>
        <p className="post-meta muted">{pack.updated}</p>
        <div className="post-answer">
          <span className="label">{pack.readLabel}</span>
          <p>{guide.answer}</p>
        </div>
        <div className="prose">
          {guide.sections.map((section) => (
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
          <Link to={`/tools/${guide.tool}`} className="btn btn-acid">{guide.ctaLabel} →</Link>
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
        <p style={{ marginTop: '2rem' }}><Link to={guidePath(pack)}>{pack.backLabel}</Link> · <Link to="/blog">English guides</Link></p>
      </article>
    </div>
  )
}
