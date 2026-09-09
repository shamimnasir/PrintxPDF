import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useHydrated } from '../ClientOnly'

/** Shown while a route chunk loads, and by app-only routes until they mount after hydration. */
export function RouteLoading() {
  return (
    <div className="container section center">
      <div className="badge badge-acid">Loading…</div>
    </div>
  )
}

export function Layout() {
  const { pathname, search } = useLocation()
  const hydrated = useHydrated()
  // the editor view gets no footer so the paper sits on a clean desk; decided after hydration
  // because the static /print page is rendered without a query string
  const q = new URLSearchParams(search)
  const bare = hydrated && pathname === '/print' && (q.has('url') || q.has('sample') || q.has('paste') || q.has('post'))
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<RouteLoading />}>
          <Outlet />
        </Suspense>
      </main>
      {!bare && <Footer />}
    </>
  )
}
