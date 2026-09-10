import { useState } from 'react'
import { Dropzone } from '../../components/ui/Dropzone'
import { useToast } from '../../components/ui/Toast'
import { ProgressBar } from '../../components/ui/ResultList'
import { downloadBlob, formatBytes, stripExt } from '../../lib/download'
import { zipStore } from '../../lib/zip'
import { ZipError, baseName, canInflate, listZip, readZipEntry, type ZipEntryInfo, type ZipListing } from './unzip'
import './files.css'

type Loaded = { file: File; bytes: Uint8Array; listing: ZipListing }

function entryProblem(e: ZipEntryInfo): string | null {
  if (e.encrypted) return 'encrypted'
  if (e.zip64) return 'ZIP64'
  if (e.method !== 0 && e.method !== 8) return `method ${e.method}`
  if (e.method === 8 && !canInflate()) return 'needs DecompressionStream'
  return null
}

export default function UnzipTool() {
  const { toast } = useToast()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  const open = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setLoaded(null)
    setError(null)
    setBusy('Opening the ZIP…')
    try {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const listing = listZip(bytes)
      setLoaded({ file, bytes, listing })
      const n = listing.entries.filter((e) => !e.isDir).length
      toast(`${n} file${n === 1 ? '' : 's'} in ${file.name}`)
    } catch (e) {
      setError(e instanceof ZipError ? e.message : `Could not read this file: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  const downloadOne = async (entry: ZipEntryInfo) => {
    if (!loaded || busy) return
    setBusy(`Extracting ${baseName(entry.safeName)}…`)
    try {
      const data = await readZipEntry(loaded.bytes, entry)
      downloadBlob(new Blob([data as BlobPart]), baseName(entry.safeName))
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(null)
    }
  }

  const downloadAll = async () => {
    if (!loaded || busy) return
    const files = loaded.listing.entries.filter((e) => !e.isDir && !entryProblem(e))
    if (!files.length) return toast('There are no files in this ZIP that can be unpacked', 'error')
    setBusy('Unpacking everything…')
    setProgress(0)
    const out: { name: string; data: Uint8Array }[] = []
    let failed = 0
    try {
      for (let i = 0; i < files.length; i++) {
        try {
          out.push({ name: files[i].safeName, data: await readZipEntry(loaded.bytes, files[i]) })
        } catch {
          failed++
        }
        setProgress((i + 1) / files.length)
      }
      if (!out.length) return toast('None of the files could be unpacked; the ZIP is probably damaged.', 'error')
      if (out.length === 1) downloadBlob(new Blob([out[0].data as BlobPart]), baseName(out[0].name))
      else downloadBlob(zipStore(out), `${stripExt(loaded.file.name)}-extracted.zip`)
      toast(failed ? `${out.length} unpacked, ${failed} failed` : `${out.length} file${out.length > 1 ? 's' : ''} unpacked`, failed ? 'error' : 'ok')
    } finally {
      setBusy(null)
      setProgress(null)
    }
  }

  const entries = loaded?.listing.entries ?? []
  const total = entries.reduce((n, e) => n + e.size, 0)
  const extractable = entries.filter((e) => !e.isDir && !entryProblem(e)).length
  const skipped = entries.filter((e) => !e.isDir).length - extractable

  return (
    <div className="tool-grid">
      <div className="stack">
        <Dropzone accept=".zip" multiple={false} onFiles={open} label="Drop a ZIP here" />
        {busy && <ProgressBar value={progress ?? 0.4} msg={busy} />}
        {error && <div className="fx-notice">{error}</div>}
        {loaded && (
          <>
            <div className="fx-total">
              <span>
                {loaded.file.name} · {entries.filter((e) => !e.isDir).length} file{entries.length === 1 ? '' : 's'}
              </span>
              <span className="mono">
                {formatBytes(loaded.file.size)} → {formatBytes(total)} unpacked
              </span>
            </div>
            {loaded.listing.notes.map((n) => (
              <div className="fx-notice" key={n}>
                {n}
              </div>
            ))}
            {loaded.listing.comment && <div className="fx-notice mono">{loaded.listing.comment}</div>}
            {!canInflate() && entries.some((e) => e.method === 8) && (
              <div className="fx-notice">This browser is too old to unpack the squeezed files inside this ZIP. Files that were packed as they are still work. Try a current Chrome, Edge, Firefox, or Safari 16.4 or newer.</div>
            )}
            <div className="fx-tree" role="list">
              {entries.map((e, i) => {
                const problem = entryProblem(e)
                const dir = e.safeName.includes('/') ? e.safeName.slice(0, e.safeName.lastIndexOf('/') + 1) : ''
                return (
                  <div className={`fx-tree-row ${e.isDir ? 'is-dir' : ''}`} role="listitem" key={`${e.name}-${i}`}>
                    <span aria-hidden="true">{e.isDir ? '▸' : '·'}</span>
                    <span className="fx-name" title={e.name}>
                      {dir && <span className="fx-path">{dir}</span>}
                      {e.isDir ? '' : baseName(e.safeName)}
                    </span>
                    {!e.isDir && <span className="size">{formatBytes(e.size)}</span>}
                    {!e.isDir && problem && <span className="fx-warn">{problem}</span>}
                    {!e.isDir && !problem && (
                      <button className="btn btn-sm" disabled={!!busy} onClick={() => downloadOne(e)}>
                        Download
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Unpack</h4>
        <button className="btn btn-acid btn-lg btn-block" disabled={!loaded || !!busy || !extractable} onClick={downloadAll}>
          {busy && progress !== null ? 'Unpacking…' : extractable > 1 ? `Download all (${extractable}) as ZIP` : 'Download all'}
        </button>
        {skipped > 0 && (
          <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            {skipped} file{skipped > 1 ? 's' : ''} cannot be unpacked (password-protected, over 4 GB, or packed in a way this tool does not support) and will be skipped.
          </p>
        )}
        <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
          Opens the ZIP in your browser; nothing is uploaded. Password-protected ZIPs and very large ones (over 4 GB) are not supported. For safety, every file is kept inside one folder. "Download all" repacks the files into one ZIP with the folders intact.
        </p>
      </div>
    </div>
  )
}
