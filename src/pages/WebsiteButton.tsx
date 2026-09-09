import { useState } from 'react'
import { useToast } from '../components/ui/Toast'
import { Seg } from '../components/ui/Seg'

export default function WebsiteButton() {
  const { toast } = useToast()
  const [label, setLabel] = useState('Print / PDF')
  const [style, setStyle] = useState<'acid' | 'ink' | 'outline'>('acid')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [icon, setIcon] = useState(true)

  const safeLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const origin = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, '')
  const colors = { acid: ['#2B5BFF', '#FFFFFF'], ink: ['#0B0B0F', '#FFFFFF'], outline: ['transparent', '#0B0B0F'] }[style]
  const pad = { sm: '6px 12px', md: '10px 18px', lg: '14px 26px' }[size]
  const fs = { sm: '12px', md: '14px', lg: '16px' }[size]

  const snippet = `<!-- PrintxPDF button -->
<a href="${origin}/print?url=" class="printxpdf-btn" onclick="this.href='${origin}/print?url='+encodeURIComponent(location.href)" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:${pad};font:800 ${fs}/1 system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;text-decoration:none;color:${colors[1]};background:${colors[0]};border:3px solid #0B0B0F;box-shadow:4px 4px 0 #0B0B0F">
  ${icon ? '&#9113; ' : ''}${safeLabel}
</a>`

  return (
    <div className="container section">
      <span className="eyebrow">Website tools</span>
      <h1>
        A print button for <span className="acid-mark">any site.</span>
      </h1>
      <p className="lead">Paste one snippet. When a reader clicks it, the current page opens in the PrintxPDF cleaner, ready to print, PDF or email.</p>

      <div className="tool-grid" style={{ marginTop: '2rem' }}>
        <div className="stack">
          <div className="card" style={{ background: 'var(--bg-2)' }}>
            <span className="label">Preview</span>
            <div dangerouslySetInnerHTML={{ __html: snippet.replace('onclick', 'data-onclick') }} />
          </div>
          <div className="card">
            <div className="row between" style={{ marginBottom: '0.75rem' }}>
              <span className="label" style={{ margin: 0 }}>Embed code</span>
              <button className="btn btn-sm btn-acid" onClick={() => navigator.clipboard.writeText(snippet).then(() => toast('Snippet copied'))}>
                Copy
              </button>
            </div>
            <pre className="code" style={{ whiteSpace: 'pre-wrap' }}>{snippet}</pre>
          </div>
        </div>
        <div className="card stack">
          <h4 style={{ margin: 0 }}>Customize</h4>
          <div>
            <label className="label">Label</label>
            <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <label className="label">Style</label>
            <Seg label="Style" value={style} options={[['acid', 'Cobalt'], ['ink', 'Ink'], ['outline', 'Outline']]} onChange={setStyle} />
          </div>
          <div>
            <label className="label">Size</label>
            <Seg label="Size" value={size} options={[['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large']]} onChange={setSize} />
          </div>
          <label className="check">
            <input type="checkbox" checked={icon} onChange={(e) => setIcon(e.target.checked)} /> Show printer icon
          </label>
          <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            The button is plain HTML with inline styles, so it works in any CMS, static site or email template that allows links.
          </p>
        </div>
      </div>
    </div>
  )
}
