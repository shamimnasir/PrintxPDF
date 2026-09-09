import { useEffect, useState } from 'react'
import { getConfig, subscribeConfig, type SiteConfig } from './config'

export function useSiteConfig(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(getConfig)
  useEffect(() => {
    const unsub = subscribeConfig(setCfg)
    // bootConfig() can resolve between the first render and this effect (and StrictMode
    // unsubscribes/resubscribes), so re-read once after subscribing or the published
    // config is silently ignored for the life of the page.
    setCfg(getConfig())
    return () => {
      unsub()
    }
  }, [])
  return cfg
}
