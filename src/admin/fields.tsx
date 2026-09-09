import type { ReactNode } from 'react'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field" style={{ marginBottom: '1.1rem' }}>
      <label className="label">{label}</label>
      {children}
      {hint && (
        <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

export function Text({ label, value, onChange, hint, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; mono?: boolean }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" style={mono ? { fontFamily: 'var(--font-mono)', fontSize: '0.85rem' } : undefined} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export function Area({ label, value, onChange, hint, placeholder, rows = 6 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string; rows?: number }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className="textarea" style={{ minHeight: rows * 24 }} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="check">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span style={{ fontWeight: 700 }}>{label}</span>
      </label>
      {hint && (
        <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem', paddingLeft: '1.8rem' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

export function Color({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="row" style={{ gap: '0.5rem', flexWrap: 'nowrap' }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={{ width: 56, height: 46, border: 'var(--bw) solid var(--line)', background: 'var(--card)', padding: 3, cursor: 'pointer' }} aria-label={label} />
        <input className="input mono" style={{ fontSize: '0.85rem' }} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  )
}

export function Num({ label, value, onChange, min, max, hint }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  )
}

export function ListEditor({ label, items, onChange, hint, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; hint?: string; placeholder?: string }) {
  return (
    <Field label={label} hint={hint}>
      <div className="stack" style={{ gap: '0.4rem' }}>
        {items.map((it, i) => (
          <div className="row" key={i} style={{ gap: '0.4rem', flexWrap: 'nowrap' }}>
            <input
              className="input"
              value={it}
              onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))}
            />
            <button className="icon-btn" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label={`Remove ${it}`}>
              ×
            </button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={() => onChange([...items, placeholder || 'New item'])}>
          + Add
        </button>
      </div>
    </Field>
  )
}

export function Card({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-body)', textTransform: 'none', letterSpacing: '-0.01em', fontWeight: 900, fontSize: '1.15rem', marginBottom: desc ? '0.25rem' : '1rem' }}>{title}</h3>
      {desc && (
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {desc}
        </p>
      )}
      {children}
    </section>
  )
}
