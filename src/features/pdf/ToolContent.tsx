import { Link } from 'react-router-dom'
import type { ToolMeta } from './toolsMeta'
import type { ToolContent } from '../../content/tools'
import { Rich } from '../../pages/PostPage'
import { ToolShot } from '../../components/ui/ToolShot'
import { ToolCard } from './ToolCard'
import '../../content/blog.css'

/** Anchor id for HowTo step n of a tool, shared with the prerenderer and the HowTo schema. */
export const stepAnchor = (n: number) => `how-step-${n}`

/** The editorial half of a tool page: what, why, how, FAQ. Rendered under the tool itself. */
export function ToolContentSections({ tool, c, related = [] }: { tool: ToolMeta; c: ToolContent; related?: ToolMeta[] }) {
  const toc = [
    ['what', c.whatHeading || `What is ${tool.name}?`],
    ['why', c.whyHeading || `Why use ${tool.name}?`],
    ['how', c.howHeading || `How to use ${tool.name}, step by step`],
    ...(c.faqs.length ? [['faq', 'Frequently asked questions']] : []),
  ]
  return (
    <div className="post-wrap tool-content-wrap">
    <div className="prose tool-content">
      <div className="post-answer">
        <span className="label">Short answer</span>
        <p>{c.answer}</p>
      </div>

      <h2 id="what">{c.whatHeading || `What is ${tool.name}?`}</h2>
      {c.what.map((w) => (
        <div key={w.term}>
          <h3>{w.term}</h3>
          <p>
            <Rich x={w.definition} />
          </p>
        </div>
      ))}

      <h2 id="why">{c.whyHeading || `Why use ${tool.name}?`}</h2>
      <ul>
        {c.why.map((b) => (
          <li key={b.h}>
            <strong>{b.h}.</strong> <Rich x={b.x} />
          </li>
        ))}
      </ul>

      <h2 id="how">{c.howHeading || `How to use ${tool.name}, step by step`}</h2>
      <ToolShot slug={tool.slug} caption={`${tool.name} with a file loaded: the steps below follow this screen.`} />
      <ol className="steps">
        {c.how.map((s, i) => (
          <li key={s.h} id={stepAnchor(i + 1)}>
            <strong>{s.h}</strong> <Rich x={s.x} />
          </li>
        ))}
      </ol>

      {c.faqs.length > 0 && (
        <>
          <h2 id="faq">Frequently asked questions</h2>
          {c.faqs.map((f) => (
            <div className="faq-item" key={f.q}>
              <h3>{f.q}</h3>
              <p>
                <Rich x={f.a} />
              </p>
            </div>
          ))}
        </>
      )}
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        Looking for the long version? The <Link to="/blog">guides</Link> cover each of these jobs in depth.
      </p>
    </div>

    <aside className="post-aside">
      <nav className="toc" aria-label="On this page">
        <span className="label" style={{ margin: 0 }}>
          On this page
        </span>
        <ol>
          {toc.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {related.length > 0 && (
        <div className="card card-flat">
          <span className="label">Related tools</span>
          <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      )}

      {c.entities.length > 0 && (
        <div className="card card-flat">
          <span className="label">Topics covered</span>
          <div className="kw-list">
            {c.entities.slice(0, 10).map((e) => (
              <span key={e} className="badge">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
    </div>
  )
}
