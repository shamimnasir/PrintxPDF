import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone, FileList } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar, ResultList } from '../../components/ui/ResultList'
import { downloadBlob } from '../../lib/download'
import type { Output } from './engines'
import type { ToolMeta } from './toolsMeta'

type Field =
  | { key: string; label: string; type: 'select'; options: [string, string][]; default: string; help?: string }
  | { key: string; label: string; type: 'text'; default: string; placeholder?: string; help?: string }
  | { key: string; label: string; type: 'number'; default: number; min?: number; max?: number; step?: number; help?: string }
  | { key: string; label: string; type: 'range'; default: number; min: number; max: number; step: number; help?: string }

type Opts = Record<string, string | number>

const FIELDS: Record<string, Field[]> = {
  'split-pdf': [
    { key: 'mode', label: 'Split by', type: 'select', options: [['ranges', 'Custom ranges'], ['every', 'Every N pages'], ['single', 'Every page']], default: 'ranges' },
    { key: 'ranges', label: 'Ranges', type: 'text', default: '1-2, 3-', placeholder: '1-3, 4-6, 7-', help: 'Comma-separated. "7-" means page 7 to the end.' },
    { key: 'every', label: 'N pages per file', type: 'number', default: 2, min: 1 },
  ],
  'rotate-pdf': [
    { key: 'angle', label: 'Rotate', type: 'select', options: [['90', '90° clockwise'], ['180', '180°'], ['270', '90° counter-clockwise']], default: '90' },
    { key: 'pages', label: 'Pages', type: 'text', default: '', placeholder: 'All pages (or e.g. 1, 3-5)' },
  ],
  'delete-pages': [{ key: 'pages', label: 'Pages to delete', type: 'text', default: '', placeholder: 'e.g. 2, 5-7' }],
  'extract-pages': [{ key: 'pages', label: 'Pages to keep', type: 'text', default: '', placeholder: 'e.g. 1, 3-4' }],
  'compress-pdf': [
    {
      key: 'level',
      label: 'Compression',
      type: 'select',
      options: [['light', 'Light · lossless, keeps text'], ['medium', 'Medium · pages become images'], ['strong', 'Strong · smallest, lower quality']],
      default: 'light',
      help: 'Light rewrites the file structure and strips metadata. Medium/Strong rasterise pages, which is what shrinks scans.',
    },
  ],
  'pdf-to-jpg': [
    { key: 'format', label: 'Format', type: 'select', options: [['jpg', 'JPG'], ['png', 'PNG']], default: 'jpg' },
    { key: 'scale', label: 'Resolution', type: 'select', options: [['1', 'Screen · 72 dpi'], ['2', 'Print · 144 dpi'], ['3', 'High · 216 dpi']], default: '2' },
    { key: 'pages', label: 'Pages', type: 'text', default: '', placeholder: 'All pages (or e.g. 1-3)' },
  ],
  'jpg-to-pdf': [
    { key: 'pageSize', label: 'Page size', type: 'select', options: [['A4', 'A4'], ['Letter', 'Letter'], ['auto', 'Same as image']], default: 'A4' },
    { key: 'fit', label: 'Image fit', type: 'select', options: [['fit', 'Fit inside margins'], ['fill', 'Fill page'], ['original', 'Original size']], default: 'fit' },
    { key: 'margin', label: 'Margin (pt)', type: 'number', default: 36, min: 0, max: 144 },
  ],
  'add-watermark': [
    { key: 'text', label: 'Text', type: 'text', default: 'CONFIDENTIAL' },
    { key: 'position', label: 'Position', type: 'select', options: [['center', 'Center'], ['tile', 'Tiled'], ['top', 'Top'], ['bottom', 'Bottom']], default: 'center' },
    { key: 'size', label: 'Font size', type: 'range', default: 60, min: 12, max: 160, step: 2 },
    { key: 'opacity', label: 'Opacity', type: 'range', default: 0.25, min: 0.05, max: 1, step: 0.05 },
    { key: 'rotation', label: 'Rotation', type: 'range', default: 35, min: -90, max: 90, step: 5 },
    { key: 'color', label: 'Color', type: 'select', options: [['grey', 'Grey'], ['red', 'Red'], ['blue', 'Blue'], ['black', 'Black']], default: 'grey' },
  ],
  'page-numbers': [
    { key: 'position', label: 'Position', type: 'select', options: [['bottom-center', 'Bottom center'], ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['top-right', 'Top right'], ['top-center', 'Top center']], default: 'bottom-center' },
    { key: 'format', label: 'Format', type: 'select', options: [['n', '1, 2, 3'], ['n-of-total', '1 / 12'], ['page-n', 'Page 1']], default: 'n' },
    { key: 'size', label: 'Font size', type: 'number', default: 11, min: 6, max: 36 },
    { key: 'start', label: 'Start at', type: 'number', default: 1, min: 0 },
  ],
  'edit-metadata': [
    { key: 'title', label: 'Title', type: 'text', default: '' },
    { key: 'author', label: 'Author', type: 'text', default: '' },
    { key: 'subject', label: 'Subject', type: 'text', default: '' },
    { key: 'keywords', label: 'Keywords', type: 'text', default: '', placeholder: 'comma, separated' },
  ],
  'html-to-pdf': [{ key: 'pageSize', label: 'Page size', type: 'select', options: [['A4', 'A4'], ['Letter', 'Letter']], default: 'A4' }],
}

const DEMO_TEXT: Record<string, string> = {
  'pdf-to-ppt': 'Turning PDF pages into editable slides needs a layout engine (LibreOffice or a commercial SDK) running on a server. Our browser demo stops here, but the merge, split, image and sign tools are fully working.',
  'ppt-to-pdf': 'Rendering PowerPoint faithfully requires the Office layout engine. Export from PowerPoint with File → Save As → PDF, then use any tool here on the result.',
  'epub-to-pdf': 'EPUB is zipped HTML. A faithful conversion needs a paginating renderer on a server. Tip: open the EPUB in your reader app and print to PDF, then clean it up here.',
  'mobi-to-pdf': 'MOBI is a proprietary Kindle container; decoding it in the browser is not practical. Convert with Calibre, then use our PDF tools on the output.',
}

export function GenericTool({ tool }: { tool: ToolMeta }) {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [opts, setOpts] = useState<Opts>(() => Object.fromEntries((FIELDS[tool.slug] || []).map((f) => [f.key, f.default])))
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ f: number; msg?: string } | null>(null)
  const [results, setResults] = useState<Output[]>([])
  const [error, setError] = useState<string | null>(null)
  const [html, setHtml] = useState('')

  useEffect(() => {
    // pre-fill metadata form from the file
    if (tool.slug === 'edit-metadata' && files[0]) {
      import('./engines')
        .then((E) => E.readMetadata(files[0]))
        .then((m) => setOpts((o) => ({ ...o, title: m.title, author: m.author, subject: m.subject, keywords: m.keywords })))
        .catch(() => {})
    }
  }, [files, tool.slug])

  const addFiles = (incoming: File[]) => {
    setResults([])
    setError(null)
    setFiles((cur) => (tool.multiple ? [...cur, ...incoming] : incoming.slice(0, 1)))
  }
  const move = (from: number, to: number) =>
    setFiles((cur) => {
      const next = [...cur]
      const [x] = next.splice(from, 1)
      next.splice(to, 0, x)
      return next
    })

  const run = async () => {
    setBusy(true)
    setError(null)
    setResults([])
    setProgress({ f: 0 })
    const onP = (f: number, msg?: string) => setProgress({ f, msg })
    const s = (k: string) => String(opts[k] ?? '')
    const n = (k: string) => Number(opts[k] ?? 0)
    try {
      // engines pull in pdf-lib / pdf.js / jsPDF; load them only when a tool actually runs
      const E = await import('./engines')
      const f = files[0]
      let out: Output[] = []
      switch (tool.slug) {
        case 'merge-pdf':
          if (files.length < 2) throw new Error('Add at least two PDFs to merge')
          out = await E.merge(files, onP)
          break
        case 'split-pdf':
          out = await E.split(f, { mode: s('mode') as 'ranges' | 'every' | 'single', ranges: s('ranges'), every: n('every') }, onP)
          break
        case 'rotate-pdf':
          out = await E.rotate(f, n('angle') as 90 | 180 | 270, s('pages'))
          break
        case 'delete-pages':
          out = await E.deletePages(f, s('pages'))
          break
        case 'extract-pages':
          out = await E.extractPages(f, s('pages'))
          break
        case 'compress-pdf':
          out = await E.compress(f, { level: s('level') as 'light' | 'medium' | 'strong' }, onP)
          break
        case 'repair-pdf':
          out = await E.repair(f)
          break
        case 'pdf-to-jpg':
          out = await E.pdfToImages(f, { format: s('format') as 'jpg' | 'png', scale: n('scale'), pages: s('pages') }, onP)
          break
        case 'jpg-to-pdf':
          out = await E.imagesToPdf(files, { fit: s('fit') as 'fit' | 'fill' | 'original', pageSize: s('pageSize') as 'A4' | 'Letter' | 'auto', margin: n('margin') }, onP)
          break
        case 'pdf-to-text':
          out = await E.pdfToText(f, onP)
          break
        case 'word-to-pdf':
          out = await E.wordToPdf(f, onP)
          break
        case 'excel-to-pdf':
          out = await E.excelToPdf(f, onP)
          break
        case 'html-to-pdf': {
          const src = f ? await f.text() : html
          if (!src.trim()) throw new Error('Upload an .html file or paste markup')
          out = await E.htmlToPdf(src, f?.name || 'document', s('pageSize') as 'A4' | 'Letter')
          break
        }
        case 'pdf-to-word':
          out = await E.pdfToWord(f, onP)
          break
        case 'pdf-to-excel':
          out = await E.pdfToExcel(f, onP)
          break
        case 'add-watermark':
          out = await E.watermark(f, { text: s('text'), size: n('size'), opacity: n('opacity'), rotation: n('rotation'), color: s('color') as 'grey', position: s('position') as 'center' })
          break
        case 'page-numbers':
          out = await E.pageNumbers(f, { position: s('position') as 'bottom-center', format: s('format') as 'n', size: n('size'), start: n('start') })
          break
        case 'edit-metadata':
          out = await E.setMetadata(f, { title: s('title'), author: s('author'), subject: s('subject'), keywords: s('keywords') })
          break
        case 'remove-metadata':
          out = await E.removeMetadata(f)
          break
        case 'flatten-pdf':
          out = await E.flatten(f)
          break
        default:
          throw new Error('This tool has no browser engine.')
      }
      setResults(out)
      toast(`Done: ${out.length} file${out.length > 1 ? 's' : ''} ready`)
      if (out.length === 1) downloadBlob(out[0].blob, out[0].name)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const fields = (FIELDS[tool.slug] || []).filter((fd) => {
    if (tool.slug !== 'split-pdf') return true
    if (fd.key === 'ranges') return opts.mode === 'ranges'
    if (fd.key === 'every') return opts.mode === 'every'
    return true
  })
  const needsFile = tool.slug !== 'html-to-pdf' || !html.trim()
  const canRun = !busy && (needsFile ? files.length > 0 : true)

  if (tool.status === 'demo') {
    return (
      <div className="tool-grid">
        <div className="stack">
          <Dropzone accept={tool.accept} multiple={false} onFiles={addFiles} />
          <FileList files={files} onRemove={(i) => setFiles(files.filter((_, k) => k !== i))} />
          <div className="card" style={{ borderColor: 'var(--alarm)', boxShadow: '6px 6px 0 0 var(--alarm)' }}>
            <span className="badge badge-alarm">Server-side conversion</span>
            <p style={{ margin: '0.75rem 0 0' }}>{DEMO_TEXT[tool.slug]}</p>
          </div>
        </div>
        <div className="card card-ink">
          <h4 style={{ color: 'var(--acid-dim)' }}>Why is this a demo?</h4>
          <p>
            This site ships as static files (Vercel, Cloudflare Pages, GitHub Pages). Everything that can run in a browser
            does. This one format cannot, so we tell you instead of pretending.
          </p>
          <Link to="/api" className="btn btn-acid btn-sm">
            See the API plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="tool-grid">
      <div className="stack">
        {tool.slug === 'html-to-pdf' && (
          <textarea className="textarea" placeholder="…or paste HTML here" value={html} onChange={(e) => setHtml(e.target.value)} />
        )}
        <Dropzone accept={tool.accept} multiple={!!tool.multiple} onFiles={addFiles} label={tool.multiple ? 'Drop files here' : 'Drop a file here'} />
        <FileList files={files} onRemove={(i) => setFiles(files.filter((_, k) => k !== i))} onMove={tool.multiple ? move : undefined} />

        {progress && busy && <ProgressBar value={progress.f} msg={progress.msg} />}
        {error && (
          <div className="card" style={{ borderColor: 'var(--alarm)', boxShadow: '6px 6px 0 0 var(--alarm)' }}>
            <strong className="alarm">Something went wrong.</strong> {error}
          </div>
        )}
        <ResultList outputs={results} />
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Options</h4>
        {fields.length === 0 && <p className="muted" style={{ margin: 0 }}>No options. Add a file and run.</p>}
        {fields.map((fd) => (
          <div className="field" key={fd.key} style={{ margin: 0 }}>
            <label className="label" htmlFor={fd.key}>
              {fd.label}
              {fd.type === 'range' && <span className="mono"> · {opts[fd.key]}</span>}
            </label>
            {fd.type === 'select' && (
              <select id={fd.key} className="select" value={String(opts[fd.key])} onChange={(e) => setOpts({ ...opts, [fd.key]: e.target.value })}>
                {fd.options.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            )}
            {fd.type === 'text' && (
              <input id={fd.key} className="input" value={String(opts[fd.key])} placeholder={fd.placeholder} onChange={(e) => setOpts({ ...opts, [fd.key]: e.target.value })} />
            )}
            {fd.type === 'number' && (
              <input id={fd.key} className="input" type="number" min={fd.min} max={fd.max} step={fd.step} value={Number(opts[fd.key])} onChange={(e) => setOpts({ ...opts, [fd.key]: Number(e.target.value) })} />
            )}
            {fd.type === 'range' && (
              <input id={fd.key} type="range" min={fd.min} max={fd.max} step={fd.step} value={Number(opts[fd.key])} onChange={(e) => setOpts({ ...opts, [fd.key]: Number(e.target.value) })} style={{ width: '100%', accentColor: 'var(--ink)' }} />
            )}
            {fd.help && <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>{fd.help}</div>}
          </div>
        ))}
        <button className="btn btn-acid btn-lg btn-block" disabled={!canRun} onClick={run}>
          {busy ? 'Working…' : `Run ${tool.name}`}
        </button>
        <p className="mono muted" style={{ fontSize: '0.7rem', margin: 0 }}>
          Files never leave this tab. Close it and they are gone.
        </p>
      </div>
    </div>
  )
}
