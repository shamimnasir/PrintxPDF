import { useSyncExternalStore, type ReactNode } from 'react'

const subscribe = () => () => {}

/**
 * False during static rendering and during hydration, true once React owns the DOM.
 * Anything that reads browser state (files, storage, the signed-in user) renders behind
 * it, so the HTML written at build time and the first client render are identical.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return useHydrated() ? children : fallback
}
