import { useEffect, useState } from 'react'
import { store, type User } from '../../lib/store'

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(() => store.getUser())
  useEffect(() => {
    const onChange = () => setUser(store.getUser())
    window.addEventListener('pxp:store', onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener('pxp:store', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])
  return user
}
