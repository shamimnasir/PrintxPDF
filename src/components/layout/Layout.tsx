import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const { pathname, search } = useLocation()
  // the editor view gets no footer so the paper sits on a clean desk
  const q = new URLSearchParams(search)
  const bare = pathname === '/print' && (q.has('url') || q.has('sample') || q.has('paste') || q.has('post'))
  return (
    <>
      <Header />
      <main>
        <Suspense
          fallback={
            <div className="container section center">
              <div className="badge badge-acid">Loading…</div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      {!bare && <Footer />}
    </>
  )
}
