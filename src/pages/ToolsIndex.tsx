import { useState } from 'react'
import { CATEGORY_LABEL, type ToolCategory, type ToolMeta } from '../features/pdf/toolsMeta'
import { useVisibleTools } from '../features/pdf/useTools'
import { breadcrumbSchema, useSeo } from '../lib/seo'
import { ToolCard } from '../features/pdf/ToolCard'
import '../features/pdf/tools.css'

export default function ToolsIndex() {
  const [q, setQ] = useState('')
  const TOOLS = useVisibleTools()
  const cats = Object.keys(CATEGORY_LABEL) as ToolCategory[]
  const match = (t: ToolMeta) => !q || `${t.name} ${t.short} ${t.description}`.toLowerCase().includes(q.toLowerCase())
  useSeo({
    title: `All ${TOOLS.length} PDF Tools — Free, In Your Browser`,
    description: `Merge, split, compress, convert, sign, watermark and OCR PDFs free. ${TOOLS.length} tools that run in your browser with no upload and no sign-up.`,
    path: '/tools',
    keywords: ['free pdf tools', 'merge pdf', 'compress pdf', 'pdf converter', 'sign pdf online'],
    schema: [
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Tools', path: '/tools' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'PDF tools',
        numberOfItems: TOOLS.length,
        itemListElement: TOOLS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, description: t.short, url: `/tools/${t.slug}` })),
      },
    ],
  })

  return (
    <div className="container section">
      <span className="eyebrow">
        {TOOLS.length} tools · {TOOLS.filter((t) => t.status === 'real').length} fully in-browser
      </span>
      <h1>All PDF tools</h1>
      <p className="lead">Every tool tells you up front whether it runs in your browser, is best-effort, or needs a server we don't have.</p>
      <input className="input" style={{ maxWidth: 480, marginBottom: '2rem' }} placeholder="Search tools…" value={q} onChange={(e) => setQ(e.target.value)} />

      {cats.map((c) => {
        const list = TOOLS.filter((t) => t.category === c && match(t))
        if (!list.length) return null
        return (
          <div key={c} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem' }}>{CATEGORY_LABEL[c]}</h2>
            <div className="grid grid-3">
              {list.map((t) => (
                <ToolCard key={t.slug} tool={t} showStatus />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
