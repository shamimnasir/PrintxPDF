import { useEffect, useState } from 'react'
import { getConfig, subscribeConfig, type SiteConfig } from './config'

export function useSiteConfig(): SiteConfig {
  const [cfg, setCfg] = useState<SiteConfig>(getConfig)
  useEffect(() => {
    const unsub = subscribeConfig(setCfg)
    return () => {
      unsub()
    }
  }, [])
  return cfg
}
