import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CleanArticle } from '../../lib/readability'
import { UndoStack } from '../../lib/undoStack'
import { store } from '../../lib/store'
import { useToast } from '../../components/ui/Toast'
import { Seg } from '../../components/ui/Seg'
import { exportPdf, exportPng, safeFilename, type PageSize } from './exportPdf'
import './editor.css'

type Mode = null | 'delete' | 'highlight' | 'edit' | 'break' | 'note'
type TextSize = 'S' | 'M' | 'L' | 'XL'
type Font = 'serif' | 'sans' | 'mono'
type ImageSize = 'full' | 'large' | 'small' | 'none'
type Margin = 'narrow' | 'normal' | 'wide'
type Links = 'keep' | 'strip' | 'footnote'

const BLOCKS = 'p, li, h1, h2, h3, h4, h5, h6, img, figure, table, blockquote, pre, ul, ol, dl, hr, .pxp-note, .pxp-pagebreak'

const Tool = ({ icon, label, on, onClick, danger, disabled, badge, menu, className }: { icon: string; label: string; on?: boolean; onClick: () => void; danger?: boolean; disabled?: boolean; badge?: number; menu?: boolean; className?: string }) => (
<button
  type="button"
  className={`ed-tool ${on ? 'on' : ''} ${danger ? 'danger' : ''} ${className || ''}`}
  onClick={onClick}
  disabled={disabled}
  title={label}
  aria-pressed={menu ? undefined : on}
  aria-expanded={menu ? !!on : undefined}
  aria-haspopup={menu ? 'menu' : undefined}
>
  <span className="ic" aria-hidden>
    {icon}
  </span>
  {label}
  {badge ? <span className="ed-count">{badge}</span> : null}
</button>
)

export function Editor({ article, onReset }: { article: CleanArticle; onReset: () => void }) {
  const { toast } = useToast()
  const defaults = store.getSettings()
  const [mode, setMode] = useState<Mode>('delete')
  const [textSize, setTextSize] = useState<TextSize>(defaults.defaultTextSize)
  const [font, setFont] = useState<Font>('serif')
  const [imageSize, setImageSize] = useState<ImageSize>(defaults.defaultImageSize)
  const [margin, setMargin] = useState<Margin>('normal')
  const [pageSize, setPageSize] = useState<PageSize>(defaults.defaultPageSize)
  const [links, setLinks] = useState<Links>('keep')
  const [styleOpen, setStyleOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [, force] = useState(0)

  const pageRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const stack = useMemo(() => new UndoStack(), [])
  const hovered = useRef<Element | null>(null)
  const dragging = useRef(false)
  const dragBatch = useRef<{ node: Element; parent: Node; next: Node | null }[]>([])
  const editSnapshot = useRef<{ body: string; title: string } | null>(null)

  // mount content once per article; DOM is then owned by the editor, not React
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.innerHTML = article.html
    if (titleRef.current) titleRef.current.textContent = article.title
    stack.clear()
  }, [article, stack])

  useEffect(() => {
    document.body.classList.add('pxp-editor-open')
    return () => document.body.classList.remove('pxp-editor-open')
  }, [])

  // close the Style menu when clicking anywhere else
  useEffect(() => {
    if (!styleOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.ed-menu, .ed-style-btn')) setStyleOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [styleOpen])

  useEffect(() => {
    const unsub = stack.subscribe(() => force((n) => n + 1))
    return () => {
      unsub()
    }
  }, [stack])

  const clearHover = () => {
    hovered.current?.classList.remove('pxp-hover')
    hovered.current = null
  }

  const removeNode = useCallback(
    (node: Element, record = true) => {
      const parent = node.parentNode!
      const next = node.nextSibling
      node.classList.remove('pxp-hover')
      node.remove()
      const entry = { node, parent, next }
      if (record) {
        stack.push({
          label: 'Delete',
          undo: () => parent.insertBefore(node, next && next.parentNode === parent ? next : null),
          redo: () => node.remove(),
        })
      }
      return entry
    },
    [stack],
  )

  const targetBlock = (e: React.MouseEvent) => {
    const t = e.target as Element
    if (!bodyRef.current?.contains(t) && t !== titleRef.current) return null
    if (t === titleRef.current) return t
    const el = t.closest(BLOCKS)
    if (!el || !bodyRef.current?.contains(el)) return null
    // prefer the figure over its inner img so captions go too
    return el.tagName === 'IMG' && el.parentElement?.tagName === 'FIGURE' ? el.parentElement : el
  }

  const onMove = (e: React.MouseEvent) => {
    if (mode !== 'delete' && mode !== 'break') return
    const el = targetBlock(e)
    if (el !== hovered.current) {
      clearHover()
      if (el) {
        el.classList.add('pxp-hover')
        hovered.current = el
      }
    }
    if (mode === 'delete' && dragging.current && el && el !== titleRef.current) {
      dragBatch.current.push(removeNode(el, false))
      clearHover()
    }
  }

  const onDown = (e: React.MouseEvent) => {
    if (mode !== 'delete' || e.button !== 0) return
    dragging.current = true
    dragBatch.current = []
  }

  const endDrag = () => {
    if (!dragging.current) return
    dragging.current = false
    const batch = dragBatch.current
    if (batch.length) {
      stack.push({
        label: `Delete ${batch.length} blocks`,
        undo: () => [...batch].reverse().forEach(({ node, parent, next }) => parent.insertBefore(node, next && next.parentNode === parent ? next : null)),
        redo: () => batch.forEach(({ node }) => node.remove()),
      })
    }
    dragBatch.current = []
  }

  const onClick = (e: React.MouseEvent) => {
    if (mode === 'delete') {
      const el = targetBlock(e)
      if (!el) return
      e.preventDefault()
      if (el === titleRef.current) {
        const before = el.textContent || ''
        if (!before) return
        el.textContent = ''
        stack.push({ label: 'Delete title', undo: () => (el.textContent = before), redo: () => (el.textContent = '') })
        return
      }
      // a click is a drag of one; the mousedown already started a batch
      if (dragBatch.current.length === 0) removeNode(el)
      clearHover()
    } else if (mode === 'break') {
      const el = targetBlock(e)
      if (!el || el === titleRef.current) return
      const br = document.createElement('div')
      br.className = 'pxp-pagebreak'
      el.parentNode!.insertBefore(br, el)
      stack.push({ label: 'Page break', undo: () => br.remove(), redo: () => el.parentNode!.insertBefore(br, el) })
      clearHover()
    } else if (mode === 'note') {
      const el = targetBlock(e)
      if (!el || el === titleRef.current) return
      const text = window.prompt('Note text (printed as a yellow box):')
      if (!text) return
      const note = document.createElement('div')
      note.className = 'pxp-note'
      note.textContent = text
      el.parentNode!.insertBefore(note, el)
      stack.push({ label: 'Note', undo: () => note.remove(), redo: () => el.parentNode!.insertBefore(note, el) })
    }
  }

  const onMouseUp = () => {
    endDrag()
    if (mode !== 'highlight') return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !bodyRef.current) return
    const range = sel.getRangeAt(0)
    if (!bodyRef.current.contains(range.commonAncestorContainer)) return
    const mark = document.createElement('mark')
    try {
      range.surroundContents(mark)
    } catch {
      // selection spans elements; wrap the extracted fragment instead
      const frag = range.extractContents()
      mark.appendChild(frag)
      range.insertNode(mark)
    }
    sel.removeAllRanges()
    stack.push({
      label: 'Highlight',
      undo: () => {
        const p = mark.parentNode
        if (!p) return
        while (mark.firstChild) p.insertBefore(mark.firstChild, mark)
        mark.remove()
      },
      redo: () => {
        /* re-applying an unwrapped highlight precisely is not worth the complexity */
      },
    })
  }

  // edit mode: snapshot on enter, diff on exit
  useEffect(() => {
    const body = bodyRef.current
    const title = titleRef.current
    if (!body || !title) return
    if (mode === 'edit') {
      editSnapshot.current = { body: body.innerHTML, title: title.textContent || '' }
      body.contentEditable = 'true'
      title.contentEditable = 'true'
    } else {
      body.contentEditable = 'false'
      title.contentEditable = 'false'
      const before = editSnapshot.current
      if (before && (before.body !== body.innerHTML || before.title !== title.textContent)) {
        const after = { body: body.innerHTML, title: title.textContent || '' }
        // restoring innerHTML replaces every node, so earlier delete/highlight commands would
        // re-insert into detached parents. Start a fresh history from this edit.
        stack.clear()
        stack.push({
          label: 'Edit text',
          undo: () => {
            body.innerHTML = before.body
            title.textContent = before.title
          },
          redo: () => {
            body.innerHTML = after.body
            title.textContent = after.title
          },
        })
      }
      editSnapshot.current = null
    }
  }, [mode, stack])

  // keyboard: ⌘Z / ⌘⇧Z, Esc leaves mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z') {
        if (mode === 'edit') return // let the browser handle typing undo
        e.preventDefault()
        if (e.shiftKey) stack.redo()
        else stack.undo()
      } else if (e.key === 'Escape') {
        setMode(null)
        setStyleOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, stack])

  const removeAllImages = () => {
    const imgs = Array.from(bodyRef.current?.querySelectorAll('img, figure') || []).filter(
      (el) => !(el.tagName === 'IMG' && el.parentElement?.tagName === 'FIGURE'),
    )
    if (!imgs.length) return toast('No images left to remove')
    const batch = imgs.map((node) => ({ node, parent: node.parentNode!, next: node.nextSibling }))
    batch.forEach(({ node }) => node.remove())
    stack.push({
      label: 'Remove images',
      undo: () => [...batch].reverse().forEach(({ node, parent, next }) => parent.insertBefore(node, next && next.parentNode === parent ? next : null)),
      redo: () => batch.forEach(({ node }) => node.remove()),
    })
  }

  const getTitle = () => titleRef.current?.textContent?.trim() || article.title || 'page'

  const doPrint = () => {
    setMode(null)
    setStyleOpen(false)
    // print CSS (editor.css) hides the chrome and prints .pxp-page in place
    setTimeout(() => window.print(), 50)
  }
  const doPdf = async () => {
    if (!pageRef.current) return
    setMode(null)
    setBusy('Rendering PDF…')
    try {
      await exportPdf(pageRef.current, safeFilename(getTitle(), 'pdf'), pageSize)
      toast('PDF downloaded')
    } catch (e) {
      toast(`PDF failed: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(null)
    }
  }
  const doPng = async () => {
    if (!pageRef.current) return
    setMode(null)
    setBusy('Capturing screenshot…')
    try {
      await exportPng(pageRef.current, safeFilename(getTitle(), 'png'))
      toast('Screenshot saved')
    } catch (e) {
      toast(`Screenshot failed: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(null)
    }
  }
  const doEmail = () => {
    const subject = encodeURIComponent(getTitle())
    const text = (bodyRef.current?.innerText || '').slice(0, 1500)
    const body = encodeURIComponent(`${getTitle()}\n${article.url || ''}\n\n${text}\n\n— cleaned with PrintxPDF`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }
  const doSave = () => {
    if (!store.getUser()) return toast('Sign in to save documents to your account', 'error')
    const saved = store.saveDoc({ title: getTitle(), url: article.url, html: bodyRef.current?.innerHTML || '' })
    toast(saved ? 'Saved to your account' : 'Could not save: browser storage is full', saved ? 'ok' : 'error')
  }
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(bodyRef.current?.innerText || '')
      toast('Text copied')
    } catch {
      toast('Clipboard blocked', 'error')
    }
  }

  const toggleMode = (m: Mode) => {
    setStyleOpen(false)
    setMode((cur) => (cur === m ? null : m))
    window.getSelection()?.removeAllRanges()
  }

  const hint: Record<Exclude<Mode, null>, string> = {
    delete: 'Delete mode: click any block to remove it. Click and drag to sweep many. Esc to exit.',
    highlight: 'Highlight mode: select text to mark it yellow.',
    edit: 'Edit mode: click into the page and type. Changes are kept when you leave the mode.',
    break: 'Page-break mode: click a block to force a new printed page before it.',
    note: 'Note mode: click a block to insert a printed note above it.',
  }

  const pageClass = [
    'pxp-page',
    `size-${textSize}`,
    `font-${font}`,
    `img-${imageSize}`,
    `margin-${margin}`,
    `size-${pageSize}`,
    `links-${links}`,
    mode ? `mode-${mode}` : '',
  ].join(' ')

  return (
    <div className="ed-wrap" onMouseUp={onMouseUp} onMouseLeave={endDrag}>
      <div className="ed-toolbar">
        <div className="container ed-toolbar-inner">
          <Tool icon="⎙" label="Print" onClick={doPrint} />
          <Tool icon="⤓" label="PDF" onClick={doPdf} disabled={!!busy} />
          <Tool icon="✉" label="Email" onClick={doEmail} />
          <Tool icon="▣" label="Screenshot" onClick={doPng} disabled={!!busy} />
          <div className="ed-sep" />
          <Tool icon="Aa" label="Style ▾" on={styleOpen} menu className="ed-style-btn" onClick={() => setStyleOpen((o) => !o)} />
          <Tool icon="🗑" label="Delete" danger on={mode === 'delete'} onClick={() => toggleMode('delete')} badge={stack.size} />
          <Tool icon="▬" label="Highlight" on={mode === 'highlight'} onClick={() => toggleMode('highlight')} />
          <Tool icon="✎" label="Edit text" on={mode === 'edit'} onClick={() => toggleMode('edit')} />
          <Tool icon="⤵" label="Page break" on={mode === 'break'} onClick={() => toggleMode('break')} />
          <Tool icon="✚" label="Note" on={mode === 'note'} onClick={() => toggleMode('note')} />
          <div className="ed-sep" />
          <Tool icon="↶" label="Undo" onClick={() => stack.undo()} disabled={!stack.canUndo} />
          <Tool icon="↷" label="Redo" onClick={() => stack.redo()} disabled={!stack.canRedo} />
          <div className="ed-spacer" />
          <Tool icon="⎘" label="Copy text" onClick={doCopy} />
          <Tool icon="★" label="Save" onClick={doSave} />
          <Tool icon="✕" label="New page" onClick={onReset} />
        </div>
        {styleOpen && (
          <div className="ed-menu" role="menu" aria-label="Style options" onClick={(e) => e.stopPropagation()}>
            <span className="label">Text size</span>
            <Seg value={textSize} options={[['S', 'Small'], ['M', 'Medium'], ['L', 'Large'], ['XL', 'XL']]} onChange={setTextSize} />
            <span className="label">Font</span>
            <Seg value={font} options={[['serif', 'Serif'], ['sans', 'Sans'], ['mono', 'Mono']]} onChange={setFont} />
            <span className="label">Images</span>
            <Seg value={imageSize} options={[['full', 'Full'], ['large', 'Large'], ['small', 'Small'], ['none', 'None']]} onChange={setImageSize} />
            <span className="label">Margins</span>
            <Seg value={margin} options={[['narrow', 'Narrow'], ['normal', 'Normal'], ['wide', 'Wide']]} onChange={setMargin} />
            <span className="label">Paper</span>
            <Seg value={pageSize} options={[['A4', 'A4'], ['Letter', 'Letter']]} onChange={setPageSize} />
            <span className="label">Links</span>
            <Seg value={links} options={[['keep', 'Keep'], ['strip', 'Plain text'], ['footnote', 'Show URL']]} onChange={setLinks} />
            <button className="btn btn-sm btn-alarm" style={{ marginTop: '1rem', width: '100%' }} onClick={removeAllImages}>
              Remove all images
            </button>
          </div>
        )}
      </div>

      {mode && <div className={`ed-hint ${mode === 'delete' ? 'danger' : ''}`}><div className="container">{hint[mode]}</div></div>}
      {busy && <div className="ed-hint"><div className="container">{busy}</div></div>}

      <div className="container ed-desk">
        <div className="ed-meta">
          <span className="badge badge-acid">Preview</span>
          <span>{article.wordCount.toLocaleString()} words</span>
          {article.siteName && <span>{article.siteName}</span>}
          <span>{pageSize} · {textSize} · images {imageSize}</span>
          <span style={{ marginLeft: 'auto' }}>
            <Link to="/print" style={{ color: 'inherit' }}>
              Try another page →
            </Link>
          </span>
        </div>

        <div
          ref={pageRef}
          className={pageClass}
          onMouseMove={onMove}
          onMouseDown={onDown}
          onClick={onClick}
          onMouseLeave={clearHover}
          onDragStart={(e) => mode === 'delete' && e.preventDefault()}
        >
          <header className="pxp-head">
            <h1 ref={titleRef} className="pxp-title" />
            <div className="pxp-source">
              {article.url && (
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.url.replace(/^https?:\/\//, '').slice(0, 90)}
                </a>
              )}
              {article.byline && <span>{article.byline}</span>}
              {article.publishedTime && <span>{new Date(article.publishedTime).toLocaleDateString()}</span>}
            </div>
          </header>
          <div ref={bodyRef} className="pxp-body" />
        </div>
      </div>
    </div>
  )
}
