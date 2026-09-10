import { useMemo, useRef, useState } from 'react'
import { Dropzone } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar } from '../../components/ui/ResultList'
import { downloadBlob, formatBytes } from '../../lib/download'
import { zipBlobs } from '../../lib/zip'
import './files.css'

export const ZIP_WARN_BYTES = 500 * 1024 * 1024
export const ZIP_CAP_BYTES = 1024 * 1024 * 1024

type Item = { file: File; path: string }

const relPath = (f: File) => (f.webkitRelativePath && f.webkitRelativePath.trim()) || f.name

export default function ZipTool() {
  const { toast } = useToast()
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('archive')
  const [busy, setBusy] = useState(false)
  const folderRef = useRef<HTMLInputElement>(null)

  const total = useMemo(() => items.reduce((n, i) => n + i.file.size, 0), [items])
  const overCap = total > ZIP_CAP_BYTES
  const warn = !overCap && total > ZIP_WARN_BYTES

  const add = (files: File[]) => {
    if (!files.length) return
    setItems((cur) => [...cur, ...files.map((file) => ({ file, path: relPath(file) }))])
  }

  const build = async () => {
    if (!items.length || busy || overCap) return
    setBusy(true)
    try {
      const blob = await zipBlobs(items.map((i) => ({ name: i.path, blob: i.file })))
      const safe = (name.trim() || 'archive').replace(/[\\/:*?"<>|]/g, '_').replace(/\.zip$/i, '')
      downloadBlob(blob, `${safe}.zip`)
      toast(`${safe}.zip ready (${formatBytes(blob.size)})`)
    } catch (e) {
      const msg = (e as Error).message
      toast(/memory|allocation|array buffer/i.test(msg) ? 'Your browser ran out of memory building this ZIP. Try fewer or smaller files.' : `Could not build the ZIP: ${msg}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tool-grid">
      <div className="stack">
        <Dropzone multiple onFiles={add} label="Drop any files here" hint="any kind of file, or click to choose" />
        <div className="row" style={{ gap: '0.5rem' }}>
          <button className="btn btn-sm" type="button" onClick={() => folderRef.current?.click()}>
            Add a folder
          </button>
          <input
            ref={folderRef}
            type="file"
            multiple
            hidden
            // non-standard but supported by every current browser; keeps the folder's relative paths
            {...{ webkitdirectory: '' }}
            onChange={(e) => {
              add(Array.from(e.target.files ?? []))
              e.target.value = ''
            }}
          />
          {items.length > 0 && (
            <button className="btn btn-sm btn-ghost" type="button" onClick={() => setItems([])}>
              Clear
            </button>
          )}
        </div>
        {items.length > 0 && (
          <div className="fx-tree">
            {items.map((it, i) => (
              <div className="fx-tree-row" key={`${it.path}-${i}`}>
                <span className="badge badge-ink">{i + 1}</span>
                <span className="fx-name" title={it.path}>
                  {it.path}
                </span>
                <span className="size">{formatBytes(it.file.size)}</span>
                <button className="icon-btn" aria-label={`Remove ${it.path}`} onClick={() => setItems((cur) => cur.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="fx-total">
            <span>
              {items.length} file{items.length > 1 ? 's' : ''}
            </span>
            <span className="mono">{formatBytes(total)}</span>
          </div>
        )}
        {warn && <div className="fx-notice">Over 500 MB. The whole archive is assembled in memory, so a tab with little free RAM may fail. Splitting into two ZIPs is safer.</div>}
        {overCap && <div className="fx-notice">That is {formatBytes(total)}. Browser ZIPs are capped at 1 GB here; remove some files or make two archives.</div>}
        {busy && <ProgressBar value={0.5} msg="Packing the files…" />}
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Your ZIP</h4>
        <div className="fx-field">
          <label className="label" htmlFor="zip-name">
            File name
          </label>
          <div className="fx-inline">
            <input id="zip-name" className="input" style={{ flex: 1 }} value={name} onChange={(e) => setName(e.target.value)} />
            <span className="mono">.zip</span>
          </div>
        </div>
        <button className="btn btn-acid btn-lg btn-block" disabled={!items.length || busy || overCap} onClick={build}>
          {busy ? 'Zipping…' : `Create ZIP${items.length ? ` (${formatBytes(total)})` : ''}`}
        </button>
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          Files are packed as they are, without squeezing them further (photos, PDFs and videos are already compressed), so it is fast and works offline. Files with the same name are renamed automatically; folder names are kept.
        </p>
      </div>
    </div>
  )
}
