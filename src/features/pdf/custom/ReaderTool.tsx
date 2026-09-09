import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../../../components/ui/Dropzone'
import { downloadBlob } from '../../../lib/download'
import { loadPdf, renderPageToCanvas } from '../../../lib/pdfjs'

export default function ReaderTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pdf, setPdf] = useState<Awaited<ReturnType<typeof loadPdf>> | null>(null)
  const [zoom, setZoom] = useState(1.2)
  const [cur, setCur] = useState(1)
  const [meta, setMeta] = useState<{ title?: string; author?: string } | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!file) return
    file.arrayBuffer().then(loadPdf).then(async (p) => {
      setPdf(p)
      setCur(1)
      try {
        const m = await p.getMetadata()
        const info = m.info as { Title?: string; Author?: string }
        setMeta({ title: info.Title, author: info.Author })
      } catch {
        setMeta(null)
      }
    })
  }, [file])

  // render pages + thumbs
  useEffect(() => {
    if (!pdf || !mainRef.current || !sideRef.current) return
    let cancel = false
    const main = mainRef.current
    const side = sideRef.current
    main.innerHTML = ''
    side.innerHTML = ''
    ;(async () => {
      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancel) return
        const c = await renderPageToCanvas(pdf, i, zoom)
        c.dataset.page = String(i)
        main.appendChild(c)
        if (zoom === 1.2 || side.childElementCount < pdf.numPages) {
          const t = await renderPageToCanvas(pdf, i, 0.25)
          t.title = `Page ${i}`
          t.onclick = () => main.querySelector<HTMLCanvasElement>(`canvas[data-page="${i}"]`)?.scrollIntoView({ behavior: 'smooth' })
          side.appendChild(t)
        }
      }
    })()
    return () => {
      cancel = true
    }
  }, [pdf, zoom])

  // track current page on scroll
  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const onScroll = () => {
      const pages = Array.from(main.querySelectorAll<HTMLCanvasElement>('canvas[data-page]'))
      const top = main.scrollTop + main.clientHeight / 3
      let n = 1
      for (const p of pages) if (p.offsetTop <= top) n = Number(p.dataset.page)
      setCur(n)
    }
    main.addEventListener('scroll', onScroll)
    return () => main.removeEventListener('scroll', onScroll)
  }, [pdf])

  useEffect(() => {
    sideRef.current?.querySelectorAll('canvas').forEach((c, i) => c.classList.toggle('cur', i + 1 === cur))
  }, [cur])

  const go = (n: number) => {
    const p = Math.min(pdf?.numPages || 1, Math.max(1, n))
    mainRef.current?.querySelector<HTMLCanvasElement>(`canvas[data-page="${p}"]`)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!file)
    return (
      <div className="stack" style={{ maxWidth: 720 }}>
        <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop a PDF to read" />
        <p className="muted">Renders with pdf.js. Big files stay big, but nothing is uploaded.</p>
      </div>
    )

  return (
    <div>
      <div className="reader-bar">
        <strong style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta?.title || file.name}</strong>
        {meta?.author && <span className="mono" style={{ opacity: 0.7, fontSize: '0.75rem' }}>{meta.author}</span>}
        <span style={{ flex: 1 }} />
        <button className="icon-btn" onClick={() => go(cur - 1)}>
          ‹
        </button>
        <span className="mono">
          {cur} / {pdf?.numPages || '…'}
        </span>
        <button className="icon-btn" onClick={() => go(cur + 1)}>
          ›
        </button>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(1)))}>
          −
        </button>
        <span className="mono">{Math.round(zoom * 83)}%</span>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(1)))}>
          +
        </button>
        <button className="btn btn-sm btn-acid" onClick={() => downloadBlob(file, file.name)}>
          Download
        </button>
        <button className="btn btn-sm" onClick={() => window.open(URL.createObjectURL(file), '_blank')}>
          Print
        </button>
        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--paper)' }} onClick={() => setFile(null)}>
          Close
        </button>
      </div>
      <div className="reader">
        <div ref={sideRef} className="reader-side" />
        <div ref={mainRef} className="reader-main" />
      </div>
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        Want to edit it? Try <Link to="/tools/organize-pdf">Organize pages</Link>, <Link to="/tools/sign-pdf">Sign</Link> or{' '}
        <Link to="/tools/add-watermark">Watermark</Link>.
      </p>
    </div>
  )
}
