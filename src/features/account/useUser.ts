import { useSyncExternalStore } from 'react'
import { store, type User } from '../../lib/store'

function subscribe(onChange: () => void) {
  window.addEventListener('pxp:store', onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener('pxp:store', onChange)
    window.removeEventListener('storage', onChange)
  }
}

// getSnapshot must hand back the same object while nothing changed, or React re-renders forever
let lastRaw: string | null = null
let lastUser: User | null = null
function snapshot(): User | null {
  let raw: string | null = null
  try {
    raw = localStorage.getItem('pxp:user')
  } catch {
    raw = null
  }
  if (raw !== lastRaw) {
    lastRaw = raw
    lastUser = store.getUser()
  }
  return lastUser
}

/** The signed-in user; null on the server and during hydration, so static HTML never shows a name. */
export function useUser(): User | null {
  return useSyncExternalStore(subscribe, snapshot, () => null)
}
