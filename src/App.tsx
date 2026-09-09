import { lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RuntimeEffects } from './admin/RuntimeEffects'

const Home = lazy(() => import('./pages/Home'))
const WebClip = lazy(() => import('./features/webclip/WebClipPage'))
const ToolsIndex = lazy(() => import('./pages/ToolsIndex'))
const ToolPage = lazy(() => import('./features/pdf/ToolPage'))
const Extensions = lazy(() => import('./pages/Extensions'))
const WordPress = lazy(() => import('./pages/WordPress'))
const WebsiteButton = lazy(() => import('./pages/WebsiteButton'))
const Api = lazy(() => import('./pages/Api'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Blog = lazy(() => import('./pages/Blog'))
const ClusterPage = lazy(() => import('./pages/ClusterPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const AuthorPage = lazy(() => import('./pages/AuthorPage'))
const ExtensionPrivacy = lazy(() => import('./pages/ExtensionPrivacy'))
const AdminApp = lazy(() => import('./admin/AdminApp'))
const About = lazy(() => import('./pages/About'))
const Legal = lazy(() => import('./pages/Legal'))
const SignIn = lazy(() => import('./features/account/SignIn'))
const Account = lazy(() => import('./features/account/Account'))
const NotFound = lazy(() => import('./pages/NotFound'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <RuntimeEffects />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="print" element={<WebClip />} />
          <Route path="tools" element={<ToolsIndex />} />
          <Route path="tools/:slug" element={<ToolPage />} />
          <Route path="extensions" element={<Extensions />} />
          <Route path="extensions/:browser" element={<Extensions />} />
          <Route path="extension-privacy" element={<ExtensionPrivacy />} />
          <Route path="wordpress" element={<WordPress />} />
          <Route path="website-button" element={<WebsiteButton />} />
          <Route path="api" element={<Api />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:cluster" element={<ClusterPage />} />
          <Route path="blog/:cluster/:post" element={<PostPage />} />
          <Route path="author/:slug" element={<AuthorPage />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Legal kind="privacy" />} />
          <Route path="terms" element={<Legal kind="terms" />} />
          <Route path="signin" element={<SignIn mode="in" />} />
          <Route path="signup" element={<SignIn mode="up" />} />
          <Route path="account/*" element={<Account />} />
          <Route path="admin/*" element={<AdminApp />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
