import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dropzone } from '../../../components/ui/Dropzone'
import { useToast } from '../../../components/ui/Toast'
import { downloadBlob, formatBytes, stripExt } from '../../../lib/download'

type FieldKind = 'text' | 'check' | 'radio' | 'dropdown' | 'optionlist' | 'button' | 'unknown'
type Field = {
  name: string
  kind: FieldKind
  value: string
  checked: boolean
  options: string[]
  multiline: boolean
  readOnly: boolean
}

const KIND_LABEL: Record<FieldKind, string> = {
  text: 'Text',
  check: 'Checkbox',
  radio: 'Radio group',
  dropdown: 'Dropdown',
  optionlist: 'Option list',
  button: 'Button',
  unknown: 'Unsupported',
}

/** Read every AcroForm field out of a PDF. Returns null when the file has no form at all. */
async function readFields(file: File): Promise<Field[] | null> {
  const { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList, PDFButton } = await import('pdf-lib')
  // deliberately NOT ignoreEncryption: an encrypted file should surface as EncryptedPDFError
  const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false })
  let form: ReturnType<typeof doc.getForm>
  try {
    form = doc.getForm()
  } catch {
    return null
  }
  const raw = form.getFields()
  if (!raw.length) return []
  return raw.map((f): Field => {
    const name = f.getName()
    const readOnly = f.isReadOnly()
    if (f instanceof PDFTextField)
      return { name, kind: 'text', value: f.getText() || '', checked: false, options: [], multiline: f.isMultiline(), readOnly }
    if (f instanceof PDFCheckBox) return { name, kind: 'check', value: '', checked: f.isChecked(), options: [], multiline: false, readOnly }
    if (f instanceof PDFRadioGroup)
      return { name, kind: 'radio', value: f.getSelected() || '', checked: false, options: f.getOptions(), multiline: false, readOnly }
    if (f instanceof PDFDropdown)
      return { name, kind: 'dropdown', value: f.getSelected()[0] || '', checked: false, options: f.getOptions(), multiline: false, readOnly }
    if (f instanceof PDFOptionList)
      return { name, kind: 'optionlist', value: f.getSelected()[0] || '', checked: false, options: f.getOptions(), multiline: false, readOnly }
    if (f instanceof PDFButton) return { name, kind: 'button', value: '', checked: false, options: [], multiline: false, readOnly: true }
    return { name, kind: 'unknown', value: '', checked: false, options: [], multiline: false, readOnly: true }
  })
}

export default function FormsTool() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<Field[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'none' | 'encrypted' | 'error'>('idle')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'' | 'fill' | 'flatten'>('')

  useEffect(() => {
    if (!file) {
      setFields(null)
      setStatus('idle')
      return
    }
    let alive = true
    setStatus('loading')
    setError('')
    readFields(file)
      .then((f) => {
        if (!alive) return
        if (!f || !f.length) {
          setFields([])
          setStatus('none')
          return
        }
        setFields(f)
        setStatus('ready')
      })
      .catch(async (e: Error) => {
        if (!alive) return
        const { EncryptedPDFError } = await import('pdf-lib')
        if (e instanceof EncryptedPDFError || /encrypt/i.test(e.message)) {
          setStatus('encrypted')
          return
        }
        setError(e.message)
        setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [file])

  const set = (name: string, patch: Partial<Field>) => setFields((list) => (list ? list.map((f) => (f.name === name ? { ...f, ...patch } : f)) : list))

  const save = async (flattenIt: boolean) => {
    if (!file || !fields) return
    setBusy(flattenIt ? 'flatten' : 'fill')
    try {
      const { PDFDocument, StandardFonts, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFDropdown, PDFOptionList } = await import('pdf-lib')
      const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false })
      const form = doc.getForm()
      const font = await doc.embedFont(StandardFonts.Helvetica)
      let applied = 0
      const skipped: string[] = []
      for (const f of fields) {
        if (f.readOnly || f.kind === 'button' || f.kind === 'unknown') continue
        try {
          const field = form.getField(f.name)
          if (field instanceof PDFTextField) field.setText(f.value)
          else if (field instanceof PDFCheckBox) {
            if (f.checked) field.check()
            else field.uncheck()
          }
          else if (field instanceof PDFRadioGroup) {
            if (f.value) field.select(f.value)
            else field.clear()
          } else if (field instanceof PDFDropdown) {
            if (f.value) field.select(f.value)
            else field.clear()
          } else if (field instanceof PDFOptionList) {
            if (f.value) field.select(f.value)
            else field.clear()
          } else continue
          applied++
        } catch (e) {
          skipped.push(`${f.name} (${(e as Error).message})`)
        }
      }
      form.updateFieldAppearances(font)
      if (flattenIt) form.flatten()
      const bytes = await doc.save()
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), `${stripExt(file.name)}-${flattenIt ? 'flattened' : 'filled'}.pdf`)
      toast(skipped.length ? `Saved ${applied} field(s); ${skipped.length} could not be set` : `Saved ${applied} field(s)`, skipped.length ? 'error' : 'ok')
    } catch (e) {
      toast(`Could not save: ${(e as Error).message}`, 'error')
    } finally {
      setBusy('')
    }
  }

  if (!file)
    return (
      <div className="stack" style={{ maxWidth: 720 }}>
        <Dropzone accept=".pdf" multiple={false} onFiles={(f) => setFile(f[0])} label="Drop a PDF form" />
        <p className="muted">
          Reads the AcroForm fields inside the file and gives you a real control for each one. Nothing is uploaded.
        </p>
      </div>
    )

  const filled = fields?.filter((f) => (f.kind === 'check' ? f.checked : !!f.value)).length ?? 0
  const editable = fields?.filter((f) => !f.readOnly && f.kind !== 'button' && f.kind !== 'unknown').length ?? 0

  return (
    <div className="tool-grid">
      <div className="stack">
        <div className="row between">
          <span className="badge badge-ink">{file.name}</span>
          <span className="mono" style={{ fontSize: '0.75rem' }}>{formatBytes(file.size)}</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setFile(null)}>
            Change file
          </button>
        </div>

        {status === 'loading' && <div className="badge badge-acid">Reading fields…</div>}

        {status === 'encrypted' && (
          <div className="tool-notice alarm">
            <strong>This PDF is password-protected.</strong>
            <p>
              The form fields cannot be read until the encryption is removed. Run it through{' '}
              <Link to="/tools/unlock-pdf">Unlock PDF</Link> first, then come back.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="tool-notice alarm">
            <strong>Could not read that PDF.</strong>
            <p className="mono">{error}</p>
          </div>
        )}

        {status === 'none' && (
          <div className="tool-notice">
            <strong>This PDF has no fillable form fields.</strong>
            <p>
              It is a flat document — the boxes and lines you can see are just drawing, not an AcroForm. To type on it
              anyway, use <Link to="/tools/edit-pdf">Edit PDF</Link>, which stamps text wherever you click.
            </p>
          </div>
        )}

        {status === 'ready' && fields && (
          <div className="stack">
            {fields.map((f) => {
              const id = `fld-${f.name.replace(/[^a-z0-9]/gi, '-')}`
              return (
                <div className="form-field" key={f.name}>
                  <div className="row between" style={{ gap: '0.5rem' }}>
                    <label className="label" htmlFor={id} style={{ marginBottom: 0 }}>
                      {f.name}
                    </label>
                    <span className="badge">{KIND_LABEL[f.kind]}{f.readOnly ? ' · read-only' : ''}</span>
                  </div>
                  {f.kind === 'text' &&
                    (f.multiline ? (
                      <textarea id={id} className="textarea" style={{ minHeight: 96 }} value={f.value} disabled={f.readOnly} onChange={(e) => set(f.name, { value: e.target.value })} />
                    ) : (
                      <input id={id} className="input" value={f.value} disabled={f.readOnly} onChange={(e) => set(f.name, { value: e.target.value })} />
                    ))}
                  {f.kind === 'check' && (
                    <label className="check" htmlFor={id}>
                      <input id={id} type="checkbox" checked={f.checked} disabled={f.readOnly} onChange={(e) => set(f.name, { checked: e.target.checked })} />
                      {f.checked ? 'Checked' : 'Unchecked'}
                    </label>
                  )}
                  {f.kind === 'radio' && (
                    <div className="row" role="radiogroup" aria-label={f.name} style={{ gap: '1rem' }}>
                      {f.options.map((o) => (
                        <label className="check" key={o}>
                          <input type="radio" name={id} value={o} checked={f.value === o} disabled={f.readOnly} onChange={() => set(f.name, { value: o })} />
                          {o}
                        </label>
                      ))}
                      <button className="btn btn-sm btn-ghost" disabled={f.readOnly || !f.value} onClick={() => set(f.name, { value: '' })}>
                        Clear
                      </button>
                    </div>
                  )}
                  {(f.kind === 'dropdown' || f.kind === 'optionlist') && (
                    <select id={id} className="select" value={f.value} disabled={f.readOnly} onChange={(e) => set(f.name, { value: e.target.value })}>
                      <option value="">— none —</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                  {(f.kind === 'button' || f.kind === 'unknown') && (
                    <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                      Left as-is; this field type has no value to fill.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card stack">
        <h4 style={{ margin: 0 }}>Save</h4>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          {status === 'ready' ? `${editable} editable field(s), ${filled} with a value.` : 'Load a form to see its fields.'}
        </p>
        <button className="btn btn-acid btn-lg btn-block" disabled={status !== 'ready' || !!busy} onClick={() => save(false)}>
          {busy === 'fill' ? 'Saving…' : 'Save filled'}
        </button>
        <button className="btn btn-lg btn-block" disabled={status !== 'ready' || !!busy} onClick={() => save(true)}>
          {busy === 'flatten' ? 'Flattening…' : 'Save flattened'}
        </button>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          <strong>Filled</strong> keeps the fields live, so the answers can still be changed later.{' '}
          <strong>Flattened</strong> paints the answers into the page and drops the form, so nobody can edit them — do
          that last, on a copy. Appearances are regenerated with Helvetica; a form that asks for a font you don't have
          will look slightly different.
        </p>
        <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>
          Option lists that allow several selections are saved with one choice only.
        </p>
      </div>
    </div>
  )
}
