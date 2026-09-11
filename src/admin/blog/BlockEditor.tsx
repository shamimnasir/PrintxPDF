// The body: a list of typed blocks, each with a form that matches its own shape. Reordering and
// deleting live here too, because a body is a sequence and editing one in a single textarea means
// hand-writing the structure.
import type { Block } from '../../content/types'
import { TOOLS } from '../../features/pdf/toolsMeta'

const LABELS: Record<Block['t'], string> = {
  p: 'Paragraph',
  h2: 'Heading',
  h3: 'Subheading',
  ul: 'Bullet list',
  ol: 'Numbered list',
  steps: 'Steps',
  table: 'Table',
  note: 'Note',
  warn: 'Warning',
  tip: 'Tip',
  quote: 'Quote',
  cta: 'Tool button',
  code: 'Code',
}

const ORDER: Block['t'][] = ['p', 'h2', 'h3', 'ul', 'ol', 'steps', 'table', 'note', 'tip', 'warn', 'quote', 'cta', 'code']

function blank(t: Block['t']): Block {
  switch (t) {
    case 'ul':
    case 'ol':
      return { t, items: [''] }
    case 'steps':
      return { t, items: [{ h: '', x: '' }] }
    case 'table':
      return { t, head: ['', ''], rows: [['', '']] }
    case 'cta':
      return { t, tool: TOOLS[0]?.slug ?? '', x: '' }
    default:
      return { t, x: '' } as Block
  }
}

const area = (value: string, onChange: (v: string) => void, rows = 3, placeholder?: string) => (
  <textarea className="textarea" style={{ minHeight: rows * 22 }} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
)

function BlockBody({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  if (block.t === 'ul' || block.t === 'ol') {
    return (
      <div className="stack" style={{ gap: '0.4rem' }}>
        {block.items.map((it, i) => (
          <div className="row" key={i} style={{ gap: '0.4rem', flexWrap: 'nowrap' }}>
            <input className="input" value={it} onChange={(e) => onChange({ ...block, items: block.items.map((x, k) => (k === i ? e.target.value : x)) })} />
            <button className="icon-btn" onClick={() => onChange({ ...block, items: block.items.filter((_, k) => k !== i) })} aria-label="Remove item">
              ×
            </button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={() => onChange({ ...block, items: [...block.items, ''] })}>
          + Item
        </button>
      </div>
    )
  }

  if (block.t === 'steps') {
    return (
      <div className="stack" style={{ gap: '0.6rem' }}>
        {block.items.map((it, i) => (
          <div key={i} className="card card-flat" style={{ padding: '0.7rem' }}>
            <div className="row" style={{ gap: '0.4rem', flexWrap: 'nowrap', marginBottom: '0.4rem' }}>
              <span className="mono muted" style={{ fontSize: '0.75rem', paddingTop: '0.7rem' }}>{i + 1}.</span>
              <input className="input" placeholder="Step title" value={it.h} onChange={(e) => onChange({ ...block, items: block.items.map((x, k) => (k === i ? { ...x, h: e.target.value } : x)) })} />
              <button className="icon-btn" onClick={() => onChange({ ...block, items: block.items.filter((_, k) => k !== i) })} aria-label="Remove step">
                ×
              </button>
            </div>
            {area(it.x, (v) => onChange({ ...block, items: block.items.map((x, k) => (k === i ? { ...x, x: v } : x)) }), 2, 'What the reader does')}
          </div>
        ))}
        <button className="btn btn-sm" onClick={() => onChange({ ...block, items: [...block.items, { h: '', x: '' }] })}>
          + Step
        </button>
      </div>
    )
  }

  if (block.t === 'table') {
    const setCell = (r: number, c: number, v: string) => onChange({ ...block, rows: block.rows.map((row, i) => (i === r ? row.map((cell, k) => (k === c ? v : cell)) : row)) })
    const cols = block.head.length
    return (
      <div className="stack" style={{ gap: '0.5rem' }}>
        <div className="table-scroll" tabIndex={0}>
          <table className="table" style={{ minWidth: 420 }}>
            <thead>
              <tr>
                {block.head.map((h, c) => (
                  <th key={c} style={{ padding: '0.3rem' }}>
                    <input className="input" style={{ fontSize: '0.8rem' }} value={h} onChange={(e) => onChange({ ...block, head: block.head.map((x, k) => (k === c ? e.target.value : x)) })} />
                  </th>
                ))}
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ padding: '0.3rem' }}>
                      <input className="input" style={{ fontSize: '0.8rem' }} value={cell} onChange={(e) => setCell(r, c, e.target.value)} />
                    </td>
                  ))}
                  <td style={{ padding: '0.3rem' }}>
                    <button className="icon-btn" onClick={() => onChange({ ...block, rows: block.rows.filter((_, k) => k !== r) })} aria-label="Remove row">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ gap: '0.4rem' }}>
          <button className="btn btn-sm" onClick={() => onChange({ ...block, rows: [...block.rows, Array(cols).fill('')] })}>
            + Row
          </button>
          <button className="btn btn-sm" onClick={() => onChange({ ...block, head: [...block.head, ''], rows: block.rows.map((r) => [...r, '']) })}>
            + Column
          </button>
          {cols > 1 && (
            <button className="btn btn-sm btn-ghost" onClick={() => onChange({ ...block, head: block.head.slice(0, -1), rows: block.rows.map((r) => r.slice(0, -1)) })}>
              − Column
            </button>
          )}
        </div>
        <input className="input" placeholder="Caption (optional)" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })} />
      </div>
    )
  }

  if (block.t === 'cta') {
    return (
      <div className="stack" style={{ gap: '0.4rem' }}>
        {/* a picker, not a text field: a CTA naming a tool that does not exist fails the build */}
        <select className="input" value={block.tool} onChange={(e) => onChange({ ...block, tool: e.target.value })}>
          {TOOLS.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        {area(block.x, (v) => onChange({ ...block, x: v }), 2, 'The line above the button')}
      </div>
    )
  }

  return area(block.x, (v) => onChange({ ...block, x: v } as Block), block.t === 'p' ? 4 : 2)
}

export function BlockEditor({ body, onChange }: { body: Block[]; onChange: (b: Block[]) => void }) {
  const replace = (i: number, b: Block) => onChange(body.map((x, k) => (k === i ? b : x)))
  const move = (i: number, by: number) => {
    const j = i + by
    if (j < 0 || j >= body.length) return
    const next = [...body]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="stack" style={{ gap: '0.9rem' }}>
      {body.map((b, i) => (
        <div key={i} className="card card-flat" style={{ padding: '0.85rem' }}>
          <div className="row between" style={{ marginBottom: '0.5rem', alignItems: 'center' }}>
            <span className="badge">{LABELS[b.t]}</span>
            <div className="row" style={{ gap: '0.25rem' }}>
              <button className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                ↑
              </button>
              <button className="icon-btn" onClick={() => move(i, 1)} disabled={i === body.length - 1} aria-label="Move down">
                ↓
              </button>
              <button className="icon-btn" onClick={() => onChange(body.filter((_, k) => k !== i))} aria-label="Delete block">
                ×
              </button>
            </div>
          </div>
          <BlockBody block={b} onChange={(next) => replace(i, next)} />
        </div>
      ))}

      <div className="row" style={{ gap: '0.35rem', flexWrap: 'wrap' }}>
        {ORDER.map((t) => (
          <button key={t} className="btn btn-sm btn-ghost" onClick={() => onChange([...body, blank(t)])}>
            + {LABELS[t]}
          </button>
        ))}
      </div>
    </div>
  )
}
