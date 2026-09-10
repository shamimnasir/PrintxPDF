import { useRef, useState, type DragEvent } from 'react'

import { formatBytes } from '../../lib/download'
export { formatBytes }

export function Dropzone({
  accept,
  multiple = true,
  onFiles,
  label = 'Drop files here',
  hint = 'or click to choose a file from your computer',
}: {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  label?: string
  hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  const handle = (list: FileList | null) => {
    if (!list) return
    const files = Array.from(list)
    onFiles(multiple ? files : files.slice(0, 1))
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    handle(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone ${over ? 'over' : ''}`}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && ref.current?.click()}
    >
      <div className="dz-icon" aria-hidden="true">⬆</div>
      <div className="big">{label}</div>
      <div className="muted" style={{ fontWeight: 600 }}>
        {hint}
        {accept ? ` · ${accept.replace(/\./g, '').toUpperCase().replace(/,/g, ' · ')}` : ''}
      </div>
      <span className="dz-btn">Choose file{multiple ? 's' : ''}</span>
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export function FileList({
  files,
  onRemove,
  onMove,
}: {
  files: File[]
  onRemove: (i: number) => void
  onMove?: (from: number, to: number) => void
}) {
  if (!files.length) return null
  return (
    <div className="file-list">
      {files.map((f, i) => (
        <div className="file-row" key={`${f.name}-${i}`}>
          <span className="badge badge-ink">{i + 1}</span>
          <span className="name">{f.name}</span>
          <span className="size">{formatBytes(f.size)}</span>
          {onMove && (
            <>
              <button className="icon-btn" disabled={i === 0} onClick={() => onMove(i, i - 1)} aria-label="Move up">
                ↑
              </button>
              <button
                className="icon-btn"
                disabled={i === files.length - 1}
                onClick={() => onMove(i, i + 1)}
                aria-label="Move down"
              >
                ↓
              </button>
            </>
          )}
          <button className="icon-btn" onClick={() => onRemove(i)} aria-label="Remove">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
