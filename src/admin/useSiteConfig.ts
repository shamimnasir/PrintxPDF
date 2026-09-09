import { useSyncExternalStore } from 'react'
import { getConfig, getPublished, subscribeConfig, type SiteConfig } from './config'

/**
 * The live site config. Static rendering and hydration both see the published config;
 * an admin's unpublished draft is layered on right after hydration, so the HTML written
 * at build time always matches React's first client render.
 */
export function useSiteConfig(): SiteConfig {
  return useSyncExternalStore(subscribeConfig, getConfig, getPublished)
}
