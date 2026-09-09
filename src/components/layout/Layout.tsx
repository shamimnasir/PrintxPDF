import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const { pathname, search } = useLocation()
  // the editor view gets no footer so the paper sits on a clean desk
  const bare = pathname === '/print' && /[?&](url|sample|paste)=/.test(search)
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
