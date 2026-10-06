import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * False during static rendering and hydration, true once React owns the DOM.
 * Browser-dependent UI can use this to keep prerendered and first-client markup identical.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
