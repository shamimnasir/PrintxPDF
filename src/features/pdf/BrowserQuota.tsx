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
  const status = useSyncExternalStore(subscribe, () => browserGenerationStatus(tool), () => null)
  if (!status) return null
  return (
    <p className="mono muted" aria-live="polite" style={{ fontSize: '0.75rem', margin: '-1rem 0 1.5rem' }}>
      {status.paid
        ? 'Pro plan · unlimited browser generations.'
        : `${status.remaining} of 10 free generated files left for this tool on this device.`}
    </p>
  )
}
