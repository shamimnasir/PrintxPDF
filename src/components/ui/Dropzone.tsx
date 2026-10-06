import { useRef, useState, type DragEvent } from 'react'

import { formatBytes } from '../../lib/download'

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
  const acceptLabel = accept
    ?.split(',')
    .map((type) => type.trim().replace(/^\./, '').toUpperCase())
    .filter(Boolean)
    .join(' · ')
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    handle(e.dataTransfer.files)
  }

  return (
    <div
      className={`dropzone ${over ? 'over' : ''}`}
      onClick={() => ref.current?.click()}
      aria-label={`${label}. ${hint}${acceptLabel ? `. Accepted formats: ${acceptLabel}` : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          ref.current?.click()
        }
      }}
    >
      <div className="dz-kicker"><span className="dz-step">1</span> Start with a file</div>
      <div className="dz-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 14.5v4A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-4" />
        </svg>
      </div>
      <div className="big">{label}</div>
      <div className="muted dz-hint">
        {hint}
        {acceptLabel ? <span className="dz-formats">{acceptLabel}</span> : null}
      </div>
      <span className="dz-btn">Browse file{multiple ? 's' : ''}<span className="dz-btn-arrow" aria-hidden="true">↗</span></span>
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
