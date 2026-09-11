// Live rule status for the post being edited. The same validate.ts the Worker runs before it
// commits, so what passes here is what passes there; nothing about publishing is a surprise.
import type { Issue } from '../../content/validate'

export function Counter({ label, value, min, max, unit = 'chars' }: { label: string; value: number; min?: number; max?: number; unit?: string }) {
  const low = min !== undefined && value < min
  const high = max !== undefined && value > max
  const bad = low || high
  const target = min !== undefined && max !== undefined ? `${min}–${max}` : min !== undefined ? `${min}+` : `max ${max}`
  return (
    <span
      className="mono"
      style={{ fontSize: '0.72rem', color: bad ? 'var(--alarm)' : 'var(--fg-muted)', fontWeight: bad ? 700 : 400 }}
      title={`${label}: needs ${target} ${unit}`}
    >
      {value} / {target} {unit}
    </span>
  )
}

export function RulePanel({ issues, title = 'Rules' }: { issues: Issue[]; title?: string }) {
  if (!issues.length) {
    return (
      <div className="card card-flat" style={{ borderColor: 'var(--line)', padding: '0.9rem 1.1rem' }}>
        <strong style={{ fontSize: '0.9rem' }}>{title}: all clear.</strong>
        <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
          This would pass the same checks the build runs.
        </div>
      </div>
    )
  }
  return (
    <div className="card card-flat" style={{ borderColor: 'var(--alarm)', padding: '0.9rem 1.1rem' }}>
      <strong className="alarm" style={{ fontSize: '0.9rem' }}>
        {issues.length} {issues.length === 1 ? 'problem' : 'problems'} to fix before this can publish
      </strong>
      <ul style={{ margin: '0.6rem 0 0', paddingLeft: '1.1rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
        {issues.map((i, k) => (
          <li key={`${i.rule}-${k}`}>
            {i.where && i.where !== '' && <span className="mono muted">{i.where}: </span>}
            {i.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
