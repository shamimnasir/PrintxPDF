import { useCallback, useEffect, useRef, useState } from 'react'
import { Dropzone } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob, readAsDataURL, stripExt } from '../../../lib/download'
import { loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'
import { uid } from '../../../lib/store'
import { hexToRgb01, visualRect } from './pdfGeom'
import { useSearchParams } from 'react-router-dom'

type Pdf = Awaited<ReturnType<typeof loadPdf>>
type Pt = { x: number; y: number }
type Base = { id: string; page: number }
/** All coordinates are top-left fractions of the page *as displayed* (rotation already applied). */
type TextItem = Base & { kind: 'text'; x: number; y: number; text: string; size: number; color: string; bold: boolean }
type ImageItem = Base & { kind: 'image'; x: number; y: number; w: number; h: number; src: string }
type RectItem = Base & { kind: 'rect'; x: number; y: number; w: number; h: number; color: string; fill: boolean; opacity: number; border: number }
type InkItem = Base & { kind: 'ink'; pts: Pt[]; color: string; width: number }
type NoteItem = Base & { kind: 'note'; x: number; y: number; w: number; h: number; text: string }
type FieldItem = Base & { kind: 'field'; x: number; y: number; w: number; h: number; fieldType: 'text' | 'checkbox'; name: string }
type Item = TextItem | ImageItem | RectItem | InkItem | NoteItem | FieldItem
type Mode = 'select' | 'text' | 'image' | 'signature' | 'rect' | 'highlight' | 'note' | 'field' | 'ink' | 'erase'

const MODES: [Mode, string, string][] = [
  ['select', '➤', 'Select and move'],
  ['text', 'T', 'Add text'],
  ['image', '▣', 'Place an image'],
  ['signature', '✍', 'Place a signature image'],
  ['rect', '▭', 'Draw a rectangle'],
  ['highlight', '▰', 'Highlight an area'],
  ['note', '▱', 'Add a comment note'],
  ['field', '☑', 'Add a fillable field'],
  ['ink', '✎', 'Draw freehand'],
  ['erase', '⌫', 'Erase: click an item to remove it'],
]
const UNDO_DEPTH = 40

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function PageThumb({ pdf, page, active, onClick }: { pdf: Pdf; page: number; active: boolean; onClick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    let alive = true
    renderPageToCanvas(pdf, page + 1, 0.22).then((canvas) => {
      if (!alive || !ref.current) return
      ref.current.width = canvas.width
      ref.current.height = canvas.height
      ref.current.getContext('2d')?.drawImage(canvas, 0, 0)
    })
    return () => {
      alive = false
    }
  }, [pdf, page])
  return (
    <button type="button" className={`edit-page-thumb ${active ? 'active' : ''}`} onClick={onClick} aria-label={`Go to page ${page + 1}`}>
      <canvas ref={ref} />
      <span>{page + 1}</span>
    </button>
  )
}

export default function EditTool() {
  const { toast } = useToast()
  const [params] = useSearchParams()
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [pageNo, setPageNo] = useState(1)
  const [pageOrder, setPageOrder] = useState<number[]>([])
  /** page size in points as displayed, needed to convert point sizes to screen pixels */
  const [dims, setDims] = useState<{ vw: number; vh: number }>({ vw: 612, vh: 792 })
  const [stageW, setStageW] = useState(0)
  const [items, setItems] = useState<Item[]>([])
  const [mode, setMode] = useState<Mode>('text')
  const [sel, setSel] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<{ src: string; aspect: number } | null>(null)

  // style defaults for newly created items
  const [size, setSize] = useState(18)
  const [color, setColor] = useState('#111111')
  const [bold, setBold] = useState(false)
  const [fill, setFill] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const [stroke, setStroke] = useState(2)

  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const history = useRef<Item[][]>([])
  // mirrored into state because a ref must not be read during render
  const [canUndo, setCanUndo] = useState(false)
  const drag = useRef<{ id: string; dx: number; dy: number; resize: boolean } | null>(null)
  const draft = useRef<{ kind: 'rect'; x: number; y: number } | null>(null)
  const [draftRect, setDraftRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [draftInk, setDraftInk] = useState<Pt[] | null>(null)

  const push = useCallback((next: Item[] | ((p: Item[]) => Item[])) => {
    setItems((prev) => {
      history.current = [...history.current.slice(-(UNDO_DEPTH - 1)), prev]
      return typeof next === 'function' ? next(prev) : next
    })
    setCanUndo(true)
  }, [])

  const undo = useCallback(() => {
    const last = history.current.pop()
    setCanUndo(history.current.length > 0)
    if (!last) return
    setItems(last)
    setSel(null)
  }, [])

  // ---- document ----
  useEffect(() => {
    if (!file) return
    let alive = true
    file
      .arrayBuffer()
      .then(loadPdf)
      .then((p) => {
        if (!alive) return
        setPdf(p)
        setPageNo(1)
        setPageOrder(Array.from({ length: p.numPages }, (_, i) => i))
        setItems([])
        history.current = []
        setCanUndo(false)
      })
      .catch((e: Error) => alive && toast(`Could not open that PDF: ${e.message}`, 'error'))
    return () => {
      alive = false
    }
  }, [file, toast])

  // The extension hands PDF URLs to this same editor. Fetching is client-side, and a
  // server that blocks cross-origin reads gets an honest error instead of a second editor.
  useEffect(() => {
    const url = params.get('url')
    if (!url || file) return
    let alive = true
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`The PDF returned ${r.status}`)
        return r.blob()
      })
      .then((blob) => alive && setFile(new File([blob], url.split('/').pop()?.split('?')[0] || 'document.pdf', { type: 'application/pdf' })))
      .catch((e) => alive && toast(`Could not open that PDF URL: ${(e as Error).message}. Download it, then drop the file here.`, 'error'))
    return () => {
      alive = false
    }
  }, [file, params, toast])

  // ---- page render ----
  useEffect(() => {
    if (!pdf) return
    const sourcePage = pageOrder[pageNo - 1] ?? 0
    let cancel = false
    ;(async () => {
      const page = await pdf.getPage(sourcePage + 1)
      const vp = page.getViewport({ scale: 1 })
      if (cancel) return
      setDims({ vw: vp.width, vh: vp.height })
      const c = await renderPageToCanvas(pdf, sourcePage + 1, 1.4)
      if (cancel || !canvasRef.current) return
      const s = canvasRef.current
      s.width = c.width
      s.height = c.height
      s.getContext('2d')?.drawImage(c, 0, 0)
    })()
    return () => {
      cancel = true
    }
  }, [pdf, pageNo, pageOrder])

  // ---- stage width, so point sizes can be shown at the right pixel size ----
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setStageW(el.getBoundingClientRect().width))
    ro.observe(el)
    setStageW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [pdf])

  // ---- keyboard: undo + delete ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = !!t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (!typing && (e.key === 'Delete' || e.key === 'Backspace') && sel) {
        e.preventDefault()
        push((p) => p.filter((i) => i.id !== sel))
        setSel(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, sel, push])

  const pxPerPt = stageW && dims.vw ? stageW / dims.vw : 1
  const sourcePage = pageOrder[pageNo - 1] ?? 0
  const pageItems = items.filter((i) => i.page === sourcePage)
  const selected = items.find((i) => i.id === sel) || null

  const frac = (e: { clientX: number; clientY: number }) => {
    const r = wrapRef.current!.getBoundingClientRect()
    return { x: clamp01((e.clientX - r.left) / r.width), y: clamp01((e.clientY - r.top) / r.height) }
  }

  /** Item is a union, so a keyed patch cannot be typed as Partial<Item>; the cast is contained here. */
  const patch = (id: string, p: Record<string, string | number | boolean>) =>
    setItems((list) => list.map((i) => (i.id === id ? ({ ...i, ...p } as Item) : i)))

  // ---- stage pointer handling ----
  const onStageDown = (e: React.PointerEvent) => {
    if (!pdf || drag.current) return
    const p = frac(e)
    const page = sourcePage
    if (mode === 'text' || mode === 'highlight') {
      if (mode === 'highlight') {
        draft.current = { kind: 'rect', x: p.x, y: p.y }
        setDraftRect({ x: p.x, y: p.y, w: 0, h: 0 })
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        return
      }
      const id = uid()
      push((list) => [...list, { id, kind: 'text', page, x: p.x, y: p.y, text: 'New text', size, color, bold }])
      setSel(id)
      setMode('select')
    } else if (mode === 'image' || mode === 'signature') {
      if (!pending) return toast('Choose an image in the panel first', 'error')
      const w = 0.3
      const id = uid()
      push((list) => [...list, { id, kind: 'image', page, x: clamp01(p.x - w / 2), y: p.y, w, h: (w * dims.vw) / dims.vh / pending.aspect, src: pending.src }])
      setSel(id)
      setMode('select')
    } else if (mode === 'note') {
      const id = uid()
      push((list) => [...list, { id, kind: 'note', page, x: p.x, y: p.y, w: 0.24, h: 0.12, text: 'Comment' }])
      setSel(id)
      setMode('select')
    } else if (mode === 'field') {
      const id = uid()
      push((list) => [...list, { id, kind: 'field', page, x: p.x, y: p.y, w: 0.34, h: 0.055, fieldType: 'text', name: `field_${list.length + 1}` }])
      setSel(id)
      setMode('select')
    } else if (mode === 'rect') {
      draft.current = { kind: 'rect', x: p.x, y: p.y }
      setDraftRect({ x: p.x, y: p.y, w: 0, h: 0 })
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    } else if (mode === 'ink') {
      setDraftInk([p])
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    } else {
      setSel(null)
    }
  }

  const onStageMove = (e: React.PointerEvent) => {
    if (drag.current) {
      const p = frac(e)
      const { id, dx, dy, resize } = drag.current
      setItems((list) =>
        list.map((i) => {
          if (i.id !== id) return i
          if (i.kind === 'ink') return i
          if (resize && (i.kind === 'image' || i.kind === 'rect' || i.kind === 'note' || i.kind === 'field')) {
            return { ...i, w: Math.max(0.02, p.x - i.x), h: Math.max(0.02, p.y - i.y) }
          }
          if (i.kind === 'text') return { ...i, x: clamp01(p.x - dx), y: clamp01(p.y - dy) }
          return { ...i, x: clamp01(p.x - dx), y: clamp01(p.y - dy) }
        }),
      )
      return
    }
    if (draft.current) {
      const p = frac(e)
      const s = draft.current
      setDraftRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) })
      return
    }
    if (draftInk) {
      const p = frac(e)
      const last = draftInk[draftInk.length - 1]
      if (Math.abs(p.x - last.x) + Math.abs(p.y - last.y) > 0.002) setDraftInk([...draftInk, p])
    }
  }

  const onStageUp = () => {
    if (drag.current) {
      drag.current = null
      return
    }
    if (draft.current) {
      draft.current = null
      if (draftRect && draftRect.w > 0.01 && draftRect.h > 0.01) {
        const id = uid()
        push((list) => [...list, { id, kind: 'rect', page: sourcePage, ...draftRect, color, fill, opacity, border: stroke }])
        setSel(id)
      }
      setDraftRect(null)
      return
    }
    if (draftInk) {
      if (draftInk.length > 1) push((list) => [...list, { id: uid(), kind: 'ink', page: sourcePage, pts: draftInk, color, width: stroke }])
      setDraftInk(null)
    }
  }

  const onItemDown = (e: React.PointerEvent, it: Item, resize = false) => {
    if (mode === 'erase') {
      e.stopPropagation()
      push((list) => list.filter((i) => i.id !== it.id))
      setSel(null)
      return
    }
    if (mode !== 'select') return
    e.stopPropagation()
    setSel(it.id)
    if (it.kind === 'ink') return
    const p = frac(e)
    history.current = [...history.current.slice(-(UNDO_DEPTH - 1)), items]
    setCanUndo(true)
    drag.current = { id: it.id, dx: p.x - it.x, dy: p.y - it.y, resize }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  const pickImage = async (f: File | undefined) => {
    if (!f) return
    if (!/^image\/(png|jpe?g)$/i.test(f.type)) return toast('Pick a PNG or JPG', 'error')
    const src = await readAsDataURL(f)
    const img = new Image()
    img.onload = () => {
      setPending({ src, aspect: img.naturalWidth / img.naturalHeight })
      setMode(mode === 'signature' ? 'signature' : 'image')
      toast(mode === 'signature' ? 'Now click the page to place the signature' : 'Now click the page to place it')
    }
    img.onerror = () => toast('Could not open that image', 'error')
    img.src = src
  }

  // ---- export ----
  const exportPdf = async () => {
    if (!file || !items.length) return
    setBusy(true)
    try {
      const { PDFDocument, StandardFonts, rgb, degrees, LineCapStyle } = await import('pdf-lib')
      const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false })
      const doc = await PDFDocument.create()
      const copied = await doc.copyPages(source, pageOrder.length ? pageOrder : Array.from({ length: source.getPageCount() }, (_, i) => i))
      copied.forEach((page) => doc.addPage(page))
      const regular = await doc.embedFont(StandardFonts.Helvetica)
      const heavy = await doc.embedFont(StandardFonts.HelveticaBold)
      for (const it of items) {
        const pageIndex = (pageOrder.length ? pageOrder : Array.from({ length: source.getPageCount() }, (_, i) => i)).indexOf(it.page)
        if (pageIndex < 0) continue
        const page = doc.getPage(pageIndex)
        const { VW, VH } = visualRect(page, 0, 0, 1, 1)
        if (it.kind === 'text') {
          const [cr, cg, cb] = hexToRgb01(it.color)
          const font = it.bold ? heavy : regular
          it.text.split('\n').forEach((line, i) => {
            if (!line) return
            const tw = font.widthOfTextAtSize(line, it.size)
            const r = visualRect(page, it.x, it.y + (i * it.size * 1.2) / VH, tw / VW, it.size / VH)
            page.drawText(line, { x: r.x, y: r.y, size: it.size, font, color: rgb(cr, cg, cb), rotate: degrees(r.rotateAngle) })
          })
        } else if (it.kind === 'image') {
          const bytes = await (await fetch(it.src)).arrayBuffer()
          const img = /^data:image\/png/i.test(it.src) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
          const r = visualRect(page, it.x, it.y, it.w, it.h)
          page.drawImage(img, { x: r.x, y: r.y, width: r.width, height: r.height, rotate: degrees(r.rotateAngle) })
        } else if (it.kind === 'rect') {
          const [cr, cg, cb] = hexToRgb01(it.color)
          const r = visualRect(page, it.x, it.y, it.w, it.h)
          page.drawRectangle({
            x: r.x,
            y: r.y,
            width: r.width,
            height: r.height,
            rotate: degrees(r.rotateAngle),
            color: it.fill ? rgb(cr, cg, cb) : undefined,
            opacity: it.fill ? it.opacity : undefined,
            borderColor: it.fill ? undefined : rgb(cr, cg, cb),
            borderWidth: it.fill ? 0 : it.border,
            borderOpacity: it.fill ? undefined : it.opacity,
          })
        } else if (it.kind === 'note') {
          const r = visualRect(page, it.x, it.y, it.w, it.h)
          page.drawRectangle({ x: r.x, y: r.y, width: r.width, height: r.height, color: rgb(1, 0.92, 0.35), opacity: 0.9, borderColor: rgb(0.65, 0.5, 0), borderWidth: 1 })
          page.drawText(it.text, { x: r.x + 6, y: r.y + r.height - 16, size: 11, font: regular, color: rgb(0.12, 0.12, 0.12) })
        } else if (it.kind === 'field') {
          const r = visualRect(page, it.x, it.y, it.w, it.h)
          const form = doc.getForm()
          if (it.fieldType === 'checkbox') {
            const checkbox = form.createCheckBox(it.name)
            checkbox.addToPage(page, { x: r.x, y: r.y, width: r.width, height: r.height })
          } else {
            const field = form.createTextField(it.name)
            field.addToPage(page, { x: r.x, y: r.y, width: r.width, height: r.height, borderWidth: 1 })
          }
        } else {
          const [cr, cg, cb] = hexToRgb01(it.color)
          for (let i = 1; i < it.pts.length; i++) {
            const a = visualRect(page, it.pts[i - 1].x, it.pts[i - 1].y, 0, 0)
            const b = visualRect(page, it.pts[i].x, it.pts[i].y, 0, 0)
            page.drawLine({ start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y }, thickness: it.width, color: rgb(cr, cg, cb), lineCap: LineCapStyle.Round })
          }
        }
      }
      const bytes = await doc.save()
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${stripExt(file.name)}-edited.pdf`)
      toast('Edited PDF downloaded')
    } catch (e) {
      toast(`Could not save the PDF: ${(e as Error).message}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!file)
    return (
      <div className="stack" style={{ maxWidth: 720 }}>
        <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop a PDF to edit" />
        <p className="muted">
          Add text, pictures, boxes and freehand drawing on top of the existing pages, then save them into the file.
          The original text is not retyped: this puts new things on top of the page rather than changing what is
          already there.
        </p>
      </div>
    )

  return (
    <div className="tool-grid">
      <div className="stack">
        <div className="row between">
          <div className="row" style={{ gap: '0.5rem' }}>
            <button className="icon-btn" disabled={pageNo <= 1} onClick={() => setPageNo(pageNo - 1)} aria-label="Previous page">
              ‹
            </button>
            <span className="mono">Page {pageNo} / {pageOrder.length || pdf?.numPages || '…'}</span>
            <button className="icon-btn" disabled={!pdf || pageNo >= pageOrder.length} onClick={() => setPageNo(pageNo + 1)} aria-label="Next page">
              ›
            </button>
            <span className="badge">{pageItems.length} on this page</span>
            {pdf && (
              <button
                className="btn btn-sm btn-ghost"
                disabled={pageOrder.length <= 1}
                onClick={() => {
                  setPageOrder((order) => order.filter((_, i) => i !== pageNo - 1))
                  setPageNo((n) => Math.min(n, Math.max(1, pageOrder.length - 1)))
                  setSel(null)
                }}
              >
                Delete page
              </button>
            )}
          </div>
          <div className="row" style={{ gap: '0.5rem' }}>
            <button className="btn btn-sm btn-ghost" onClick={undo} disabled={!canUndo}>
              Undo
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}>
              Change file
            </button>
          </div>
        </div>

        <div className="edit-tools" role="toolbar" aria-label="Editing tools">
          {MODES.map(([m, glyph, title]) => (
            <button key={m} className={`edit-tool ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)} title={title} aria-label={title} aria-pressed={mode === m}>
              {glyph}
            </button>
          ))}
        </div>

        <div
          ref={wrapRef}
          className="edit-stage"
          data-mode={mode}
          onPointerDown={onStageDown}
          onPointerMove={onStageMove}
          onPointerUp={onStageUp}
          onPointerCancel={onStageUp}
        >
          <canvas ref={canvasRef} />
          {pageItems.map((it) => {
            const isSel = it.id === sel
            if (it.kind === 'ink') return null
            if (it.kind === 'text')
              return (
                <div
                  key={it.id}
                  className={`edit-item text ${isSel ? 'sel' : ''}`}
                  style={{
                    left: `${it.x * 100}%`,
                    top: `${it.y * 100}%`,
                    fontSize: `${Math.max(6, it.size * pxPerPt)}px`,
                    color: it.color,
                    fontWeight: it.bold ? 800 : 500,
                  }}
                  onPointerDown={(e) => onItemDown(e, it)}
                >
                  {it.text.split('\n').map((l, i) => (
                    <span key={i} style={{ display: 'block', lineHeight: 1.2 }}>
                      {l || ' '}
                    </span>
                  ))}
                </div>
              )
            if (it.kind === 'note')
              return (
                <div key={it.id} className={`edit-item edit-note ${isSel ? 'sel' : ''}`} style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, width: `${it.w * 100}%`, height: `${it.h * 100}%` }} onPointerDown={(e) => onItemDown(e, it)}>
                  {it.text}
                  {isSel && mode === 'select' && <span className="edit-handle" onPointerDown={(e) => onItemDown(e, it, true)} />}
                </div>
              )
            if (it.kind === 'field')
              return (
                <div key={it.id} className={`edit-item edit-field ${isSel ? 'sel' : ''}`} style={{ left: `${it.x * 100}%`, top: `${it.y * 100}%`, width: `${it.w * 100}%`, height: `${it.h * 100}%` }} onPointerDown={(e) => onItemDown(e, it)}>
                  {it.fieldType === 'checkbox' ? '☐' : it.name}
                  {isSel && mode === 'select' && <span className="edit-handle" onPointerDown={(e) => onItemDown(e, it, true)} />}
                </div>
              )
            return (
              <div
                key={it.id}
                className={`edit-item ${isSel ? 'sel' : ''}`}
                style={{
                  left: `${it.x * 100}%`,
                  top: `${it.y * 100}%`,
                  width: `${it.w * 100}%`,
                  height: `${it.h * 100}%`,
                  ...(it.kind === 'rect'
                    ? {
                        background: it.fill ? it.color : 'transparent',
                        opacity: it.opacity,
                        border: it.fill ? 'none' : `${Math.max(1, it.border * pxPerPt)}px solid ${it.color}`,
                      }
                    : null),
                }}
                onPointerDown={(e) => onItemDown(e, it)}
              >
                {it.kind === 'image' && <img src={it.src} alt="Placed" draggable={false} />}
                {isSel && mode === 'select' && <span className="edit-handle" onPointerDown={(e) => onItemDown(e, it, true)} />}
              </div>
            )
          })}

          {draftRect && (
            <div
              className="edit-item draft"
              style={{
                left: `${draftRect.x * 100}%`,
                top: `${draftRect.y * 100}%`,
                width: `${draftRect.w * 100}%`,
                height: `${draftRect.h * 100}%`,
                background: mode === 'highlight' ? '#ffe566' : fill ? color : 'transparent',
                opacity: mode === 'highlight' ? 0.45 : opacity,
                border: mode === 'highlight' || fill ? 'none' : `${Math.max(1, stroke * pxPerPt)}px solid ${color}`,
              }}
            />
          )}

          <svg className="edit-ink" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {pageItems
              .filter((i): i is InkItem => i.kind === 'ink')
              .map((i) => (
                <polyline
                  key={i.id}
                  points={i.pts.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
                  fill="none"
                  stroke={i.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeWidth: Math.max(1, i.width * pxPerPt) }}
                />
              ))}
            {draftInk && draftInk.length > 1 && (
              <polyline
                points={draftInk.map((p) => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: Math.max(1, stroke * pxPerPt) }}
              />
            )}
          </svg>
        </div>
      </div>

      <div className="stack">
      <div className="card stack edit-pages-panel">
        <div className="row between">
          <h4 style={{ margin: 0 }}>Pages</h4>
          <span className="muted" style={{ fontSize: '0.8rem' }}>Drag order with arrows</span>
        </div>
        <div className="edit-page-thumbs">
          {pageOrder.map((page, i) => (
            <div key={page} className="edit-page-entry">
              <PageThumb pdf={pdf!} page={page} active={i === pageNo - 1} onClick={() => setPageNo(i + 1)} />
              <div className="row" style={{ gap: '0.25rem' }}>
                <button className="icon-btn" disabled={i === 0} onClick={() => setPageOrder((order) => { const next = [...order]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; return next })} aria-label="Move page up">↑</button>
                <button className="icon-btn" disabled={i === pageOrder.length - 1} onClick={() => setPageOrder((order) => { const next = [...order]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; return next })} aria-label="Move page down">↓</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card stack">
        <h4 style={{ margin: 0 }}>{selected ? 'Selected item' : 'New item style'}</h4>

        {selected && selected.kind === 'text' && (
          <>
            <div>
              <label className="label" htmlFor="ed-text">
                Text
              </label>
              <textarea id="ed-text" className="textarea" style={{ minHeight: 90 }} value={selected.text} onChange={(e) => patch(selected.id, { text: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="ed-size">
                Font size, {selected.size} pt
              </label>
              <input id="ed-size" type="range" min={6} max={72} value={selected.size} onChange={(e) => patch(selected.id, { size: Number(e.target.value) })} />
            </div>
            <div className="row" style={{ gap: '0.75rem' }}>
              <label className="label" htmlFor="ed-color" style={{ marginBottom: 0 }}>
                Colour
              </label>
              <input id="ed-color" className="color-input" type="color" value={selected.color} onChange={(e) => patch(selected.id, { color: e.target.value })} />
              <label className="check">
                <input type="checkbox" checked={selected.bold} onChange={(e) => patch(selected.id, { bold: e.target.checked })} />
                Bold
              </label>
            </div>
          </>
        )}

        {selected && selected.kind === 'rect' && (
          <>
            <div className="row" style={{ gap: '0.75rem' }}>
              <label className="label" htmlFor="ed-rc" style={{ marginBottom: 0 }}>
                Colour
              </label>
              <input id="ed-rc" className="color-input" type="color" value={selected.color} onChange={(e) => patch(selected.id, { color: e.target.value })} />
              <label className="check">
                <input type="checkbox" checked={selected.fill} onChange={(e) => patch(selected.id, { fill: e.target.checked })} />
                Filled
              </label>
            </div>
            <div>
              <label className="label" htmlFor="ed-ro">
                Opacity, {Math.round(selected.opacity * 100)}%
              </label>
              <input id="ed-ro" type="range" min={5} max={100} value={Math.round(selected.opacity * 100)} onChange={(e) => patch(selected.id, { opacity: Number(e.target.value) / 100 })} />
            </div>
          </>
        )}

        {selected && selected.kind === 'note' && (
          <div>
            <label className="label" htmlFor="ed-note">Comment</label>
            <textarea id="ed-note" className="textarea" value={selected.text} onChange={(e) => patch(selected.id, { text: e.target.value })} />
          </div>
        )}

        {selected && selected.kind === 'field' && (
          <>
            <div>
              <label className="label" htmlFor="ed-field-name">Field name</label>
              <input id="ed-field-name" className="input" value={selected.name} onChange={(e) => patch(selected.id, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '_') })} />
            </div>
            <label className="label" htmlFor="ed-field-type">Field type</label>
            <select id="ed-field-type" className="input" value={selected.fieldType} onChange={(e) => patch(selected.id, { fieldType: e.target.value })}>
              <option value="text">Text field</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </>
        )}

        {selected && (selected.kind === 'image' || selected.kind === 'ink') && (
          <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {selected.kind === 'image' ? 'Drag to move, drag the corner square to resize.' : 'Freehand lines cannot be moved; erase and draw again instead.'}
          </p>
        )}

        {selected && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              push((p) => p.filter((i) => i.id !== selected.id))
              setSel(null)
            }}
          >
            Delete this item
          </button>
        )}

        {!selected && (
          <>
            <div>
              <label className="label" htmlFor="ed-dsize">
                Text size, {size} pt
              </label>
              <input id="ed-dsize" type="range" min={6} max={72} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </div>
            <div className="row" style={{ gap: '0.75rem' }}>
              <label className="label" htmlFor="ed-dcolor" style={{ marginBottom: 0 }}>
                Colour
              </label>
              <input id="ed-dcolor" className="color-input" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              <label className="check">
                <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} />
                Bold
              </label>
            </div>
            <div className="row" style={{ gap: '0.75rem' }}>
              <label className="check">
                <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} />
                Solid boxes (instead of outlines)
              </label>
            </div>
            <div>
              <label className="label" htmlFor="ed-stroke">
                Line width, {stroke} pt
              </label>
              <input id="ed-stroke" type="range" min={1} max={16} value={stroke} onChange={(e) => setStroke(Number(e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="ed-op">
                How see-through boxes are, {Math.round(opacity * 100)}%
              </label>
              <input id="ed-op" type="range" min={5} max={100} value={Math.round(opacity * 100)} onChange={(e) => setOpacity(Number(e.target.value) / 100)} />
            </div>
          </>
        )}

        <div>
          <label className="label" htmlFor="ed-img">
            Image or signature to place
          </label>
          <input id="ed-img" className="input" type="file" accept="image/png,image/jpeg" onChange={(e) => pickImage(e.target.files?.[0])} />
          {pending && <p className="muted" style={{ margin: '0.4rem 0 0', fontSize: '0.8rem' }}>Ready, click the page to drop it in.</p>}
        </div>

        <button className="btn btn-acid btn-lg btn-block" disabled={!items.length || busy} onClick={exportPdf}>
          {busy ? 'Saving…' : `Save & download (${items.length})`}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
            Ctrl/Cmd+Z undoes the last change. Text is written in a standard font. Everything is placed on top of the
          page, so the original text underneath stays as it is. Highlights and page deletion are included in the saved PDF. To remove sensitive text for good, use Redact PDF.
        </p>
      </div>
      </div>
    </div>
  )
}
