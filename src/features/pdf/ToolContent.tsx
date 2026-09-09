import { Link } from 'react-router-dom'
import type { ToolMeta } from './toolsMeta'
import type { ToolContent } from '../../content/tools'
import { Rich } from '../../pages/PostPage'

/** Anchor id for HowTo step n of a tool, shared with the prerenderer and the HowTo schema. */
export const stepAnchor = (n: number) => `how-step-${n}`

/** The editorial half of a tool page: what, why, how, FAQ. Rendered under the tool itself. */
export function ToolContentSections({ tool, c }: { tool: ToolMeta; c: ToolContent }) {
  return (
    <div className="prose tool-content" style={{ maxWidth: 820 }}>
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
  )
}
