import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone, FileList } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar, ResultList } from '../../components/ui/ResultList'
import { downloadBlob } from '../../lib/download'
import type { Output } from './engines'
import type { ToolMeta } from './toolsMeta'
import { convertRemote, describeError, isConvertKind, warmConverter } from '../../lib/api'
import { useUser } from '../account/useUser'

type Field =
  | { key: string; label: string; type: 'select'; options: [string, string][]; default: string; help?: string }
  | { key: string; label: string; type: 'text'; default: string; placeholder?: string; help?: string }
  | { key: string; label: string; type: 'password'; default: string; placeholder?: string; help?: string }
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
    { key: 'scale', label: 'Resolution', type: 'select', options: [['1', 'Screen · 72 dpi'], ['2', 'Draft print · 144 dpi'], ['3', 'Good print · 216 dpi'], ['4.167', 'Full print · 300 dpi']], default: '2' },
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
    { key: 'pages', label: 'Pages', type: 'text', default: '', placeholder: 'All pages (or e.g. 1, 3-5)', help: 'Leave blank to mark every page.' },
  ],
  'page-numbers': [
    { key: 'position', label: 'Position', type: 'select', options: [['bottom-center', 'Bottom center'], ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['top-right', 'Top right'], ['top-center', 'Top center']], default: 'bottom-center' },
    { key: 'format', label: 'Format', type: 'select', options: [['n', '1, 2, 3'], ['n-of-total', '1 / 12'], ['page-n', 'Page 1']], default: 'n' },
    { key: 'size', label: 'Font size', type: 'number', default: 11, min: 6, max: 36 },
    { key: 'start', label: 'Start at', type: 'number', default: 1, min: 0 },
    { key: 'skipFirst', label: 'Leave first N pages unnumbered', type: 'number', default: 0, min: 0, help: 'Use 1 to skip a cover page. Numbering then starts on page 2.' },
  ],
  'edit-metadata': [
    { key: 'title', label: 'Title', type: 'text', default: '' },
    { key: 'author', label: 'Author', type: 'text', default: '' },
    { key: 'subject', label: 'Subject', type: 'text', default: '' },
    { key: 'keywords', label: 'Keywords', type: 'text', default: '', placeholder: 'comma, separated' },
  ],
  'html-to-pdf': [{ key: 'pageSize', label: 'Page size', type: 'select', options: [['A4', 'A4'], ['Letter', 'Letter']], default: 'A4' }],
  'crop-pdf': [
    {
      key: 'mode',
      label: 'Crop by',
      type: 'select',
      options: [['auto', 'Auto-detect content'], ['margins', 'Margins'], ['box', 'Region']],
      default: 'auto',
      help: 'Auto trims the white space around whatever is printed. Margins cuts the amount you type off each side. Region keeps the rectangle between those four edges, all measured from the top-left corner of the page.',
    },
    { key: 'unit', label: 'Unit', type: 'select', options: [['mm', 'Millimetres'], ['pt', 'Points'], ['percent', 'Percent of the page']], default: 'mm' },
    { key: 'top', label: 'Top', type: 'number', default: 10, min: 0, step: 1 },
    { key: 'right', label: 'Right', type: 'number', default: 10, min: 0, step: 1 },
    { key: 'bottom', label: 'Bottom', type: 'number', default: 10, min: 0, step: 1 },
    { key: 'left', label: 'Left', type: 'number', default: 10, min: 0, step: 1 },
    { key: 'pages', label: 'Pages', type: 'text', default: '', placeholder: 'All pages (or e.g. 1, 3-5)' },
  ],
  'pdf-to-markdown': [
    {
      key: 'headings',
      label: 'Headings',
      type: 'select',
      options: [['yes', 'Detect from font size'], ['no', 'Plain paragraphs only']],
      default: 'yes',
      help: 'Lines set noticeably larger than the body text become #, ## or ###.',
    },
    { key: 'pageBreaks', label: 'Page breaks', type: 'select', options: [['no', 'One continuous document'], ['yes', 'Rule (---) between pages']], default: 'no' },
  ],
  'protect-pdf': [
    { key: 'password', label: 'Password', type: 'password', default: '', placeholder: 'At least 4 characters', help: 'Needed every time the file is opened. Nobody can recover it for you, so keep a copy.' },
    { key: 'confirm', label: 'Confirm password', type: 'password', default: '', placeholder: 'Type it again' },
    {
      key: 'permissions',
      label: 'Once open, allow',
      type: 'select',
      options: [['all', 'Everything'], ['no-print', 'No printing'], ['no-copy', 'No copying text'], ['no-print-copy', 'No printing or copying']],
      default: 'all',
    },
  ],
  'unlock-pdf': [
    { key: 'password', label: 'Password', type: 'password', default: '', placeholder: 'Leave blank if it opens without one', help: 'Only for files you have the right to open. Leave this empty if the PDF opens fine but blocks printing or copying.' },
  ],
  'ebook-converter': [
    {
      key: 'to',
      label: 'Convert to',
      type: 'select',
      options: [
        ['epub', 'EPUB (most readers, Apple Books, Kobo)'],
        ['azw3', 'AZW3 (Kindle)'],
        ['mobi', 'MOBI (older Kindles)'],
        ['fb2', 'FB2'],
        ['txt', 'Plain text'],
      ],
      default: 'epub',
      help: 'Calibre does the conversion on our server. Pick the format your reader opens.',
    },
  ],
  'pdf-to-pdfa': [
    {
      key: 'level',
      label: 'Conformance',
      type: 'select',
      options: [['1b', 'PDF/A-1b · widest support'], ['2b', 'PDF/A-2b · recommended'], ['3b', 'PDF/A-3b · allows attachments']],
      default: '2b',
      help: 'PDF/A-2b suits almost every archive. Pick 1b only if you were asked for it by name.',
    },
  ],
}

/**
 * Extra multipart fields for the server tools, validated here so a typo never costs an upload.
 * Passwords go straight from this object into the request body: they are never logged, shown in an
 * error, or written into a result note.
 */
function serverFields(slug: string, opts: Opts): Record<string, string> | undefined {
  const s = (k: string) => String(opts[k] ?? '')
  if (slug === 'protect-pdf') {
    const password = s('password')
    if (!password) throw new Error('Enter the password you want the file to ask for.')
    if (password.length < 4) throw new Error('Use a password of at least 4 characters.')
    if (password !== s('confirm')) throw new Error('The two passwords do not match. Type the same one twice.')
    return { password, permissions: s('permissions') || 'all' }
  }
  if (slug === 'unlock-pdf') return { password: s('password') }
  if (slug === 'pdf-to-pdfa') return { level: s('level') || '2b' }
  if (slug === 'ebook-converter') return { to: s('to') || 'epub' }
  return undefined
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
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null)
  const [errorHint, setErrorHint] = useState<{ upgrade?: boolean; account?: boolean } | null>(null)
  const user = useUser()
  const server = isConvertKind(tool.slug)

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
    setErrorHint(null)
    // wake the container while the person is still looking at the options
    if (server && incoming.length) warmConverter()
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
    setErrorHint(null)
    setResults([])
    setProgress({ f: 0 })
    const onP = (f: number, msg?: string) => setProgress({ f, msg })
    const s = (k: string) => String(opts[k] ?? '')
    const n = (k: string) => Number(opts[k] ?? 0)
    try {
      if (isConvertKind(tool.slug)) {
        const f = files[0]
        const fields = serverFields(tool.slug, opts) // validated before a single byte is uploaded
        setProgress({ f: 0, msg: 'Starting the converter…' })
        const r = await convertRemote(tool.slug, f, {
          token: user?.entitlement?.token,
          fields,
          onProgress: (frac, phase) =>
            onP(phase === 'upload' ? frac * 0.6 : 0.6 + frac * 0.4, phase === 'upload' ? `Uploading… ${Math.round(frac * 100)}%` : 'Converting on the server…'),
        })
        if (r.usage) setUsage(r.usage)
        const out = [{ name: r.name, blob: r.blob }]
        setResults(out)
        toast('Done: 1 file ready')
        downloadBlob(out[0].blob, out[0].name)
        // the file is in hand, so stop holding the password in component state
        if (fields && 'password' in fields) setOpts((o) => ({ ...o, password: '', confirm: '' }))
        return
      }
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
          out = await E.watermark(f, { text: s('text'), size: n('size'), opacity: n('opacity'), rotation: n('rotation'), color: s('color') as 'grey', position: s('position') as 'center', pages: s('pages') })
          break
        case 'page-numbers':
          out = await E.pageNumbers(f, { position: s('position') as 'bottom-center', format: s('format') as 'n', size: n('size'), start: n('start'), skipFirst: n('skipFirst') })
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
        case 'crop-pdf':
          out = await E.crop(
            f,
            {
              mode: s('mode') as 'margins' | 'auto' | 'box',
              top: n('top'),
              right: n('right'),
              bottom: n('bottom'),
              left: n('left'),
              unit: s('unit') as 'mm' | 'pt' | 'percent',
              pages: s('pages'),
            },
            onP,
          )
          break
        case 'pdf-to-markdown':
          out = await E.pdfToMarkdown(f, { headings: s('headings') !== 'no', pageBreaks: s('pageBreaks') === 'yes' }, onP)
          break
        default:
          throw new Error('This tool has no browser engine.')
      }
      setResults(out)
      toast(`Done: ${out.length} file${out.length > 1 ? 's' : ''} ready`)
      if (out.length === 1) downloadBlob(out[0].blob, out[0].name)
    } catch (e) {
      const d = describeError(e)
      setError(d.message)
      setErrorHint({ upgrade: d.upgrade, account: d.account })
    } finally {
      setBusy(false)
    }
  }

  const fields = (FIELDS[tool.slug] || []).filter((fd) => {
    if (tool.slug === 'split-pdf') {
      if (fd.key === 'ranges') return opts.mode === 'ranges'
      if (fd.key === 'every') return opts.mode === 'every'
    }
    if (tool.slug === 'crop-pdf') {
      // auto-detect measures the page itself, so the unit and the four edges have nothing to say
      if (['unit', 'top', 'right', 'bottom', 'left'].includes(fd.key)) return opts.mode !== 'auto'
    }
    return true
  })
  const needsFile = tool.slug !== 'html-to-pdf' || !html.trim()
  const canRun = !busy && (needsFile ? files.length > 0 : true)

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
          <div className="card card-alarm">
            <strong className="alarm">Something went wrong.</strong> {error}
            {errorHint?.upgrade && (
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/pricing" className="btn btn-sm btn-acid">
                  See Pro · $5/month
                </Link>
              </div>
            )}
            {errorHint?.account && (
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/account/billing" className="btn btn-sm">
                  Open your account
                </Link>
              </div>
            )}
          </div>
        )}
        <ResultList outputs={results} zipName={`${tool.slug}-output.zip`} />
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
            {fd.type === 'password' && (
              <input
                id={fd.key}
                className="input"
                type="password"
                autoComplete="new-password"
                value={String(opts[fd.key])}
                placeholder={fd.placeholder}
                onChange={(e) => setOpts({ ...opts, [fd.key]: e.target.value })}
              />
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
          {server ? 'Sent over HTTPS to our converter, processed, and deleted immediately. Never stored or logged.' : 'Files never leave this tab. Close it and they are gone.'}
        </p>
        {server && (
          <p className="mono muted" style={{ fontSize: '0.7rem', margin: 0 }}>
            {usage
              ? `${usage.used} of ${usage.limit} conversions used this month.`
              : user && user.plan !== 'free'
                ? `${user.plan === 'api' ? 'API' : 'Pro'} plan · ${user.plan === 'api' ? '5,000' : '300'} conversions a month.`
                : 'Free: 5 conversions a month. Pro: 300.'}
          </p>
        )}
      </div>
    </div>
  )
}
