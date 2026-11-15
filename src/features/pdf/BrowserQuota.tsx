import { useSyncExternalStore } from 'react'
import { browserGenerationStatus } from '../../lib/download'

function subscribe(onChange: () => void) {
  window.addEventListener('pxp:generation', onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('pxp:generation', onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function BrowserQuota({ tool }: { tool: string }) {
  // useSyncExternalStore compares snapshots with Object.is. Returning the fresh status
  // object on every read causes an infinite update loop. Return a stable primitive instead.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const status = browserGenerationStatus(tool)
      return (status.paid ? 'paid:' : 'free:') + String(status.used)
    },
    () => '',
  )
  if (!snapshot) return null
  const [plan, usedText] = snapshot.split(':')
  const paid = plan === 'paid'
  const remaining = paid ? Infinity : Math.max(0, 10 - Number(usedText))
  return (
    <p className="mono muted" aria-live="polite" style={{ fontSize: '0.75rem', margin: '-1rem 0 1.5rem' }}>
      {paid
        ? 'Pro plan · unlimited browser generations.'
        : String(remaining) + ' of 10 free generated files left for this tool on this device.'}
    </p>
  )
}
