import { useEffect } from 'react'
import { ClientOnly } from './components/ClientOnly'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout, RouteLoading } from './components/layout/Layout'
import { RuntimeEffects } from './admin/RuntimeEffects'
import { page } from './routeRegistry'

const Home = page('Home')
const WebClip = page('WebClip')
const ToolsIndex = page('ToolsIndex')
const ToolPage = page('ToolPage')
const Extensions = page('Extensions')
const WordPress = page('WordPress')
const WebsiteButton = page('WebsiteButton')
const Api = page('Api')
const Pricing = page('Pricing')
const Blog = page('Blog')
const ClusterPage = page('ClusterPage')
const PostPage = page('PostPage')
const AuthorPage = page('AuthorPage')
const ExtensionPrivacy = page('ExtensionPrivacy')
const AdminApp = page('AdminApp')
const About = page('About')
const Legal = page<{ kind: 'privacy' | 'terms' }>('Legal')
const Support = page('Support')
const Contact = page('Contact')
const LocalizedEs = page('LocalizedEs')
const LocalizedPt = page('LocalizedPt')
const LocalizedHi = page('LocalizedHi')
const LocalizedAr = page('LocalizedAr')
const LocalizedBn = page('LocalizedBn')
const LocalizedVi = page('LocalizedVi')
const LocalizedZh = page('LocalizedZh')
const SignIn = page<{ mode: 'in' | 'up' }>('SignIn')
const Account = page('Account')
const NotFound = page('NotFound')

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
          <Route path="support" element={<Support />} />
          <Route path="contact" element={<Contact />} />
          <Route path="es/guias" element={<LocalizedEs />} />
          <Route path="es/guias/:slug" element={<LocalizedEs />} />
          <Route path="pt-br/guias" element={<LocalizedPt />} />
          <Route path="pt-br/guias/:slug" element={<LocalizedPt />} />
          <Route path="hi/guides" element={<LocalizedHi />} />
          <Route path="hi/guides/:slug" element={<LocalizedHi />} />
          <Route path="ar/adella" element={<LocalizedAr />} />
          <Route path="ar/adella/:slug" element={<LocalizedAr />} />
          <Route path="bn/guides" element={<LocalizedBn />} />
          <Route path="bn/guides/:slug" element={<LocalizedBn />} />
          <Route path="vi/guides" element={<LocalizedVi />} />
          <Route path="vi/guides/:slug" element={<LocalizedVi />} />
          <Route path="zh-cn/guides" element={<LocalizedZh />} />
          <Route path="zh-cn/guides/:slug" element={<LocalizedZh />} />
          <Route path="privacy" element={<Legal kind="privacy" />} />
          <Route path="terms" element={<Legal kind="terms" />} />
          <Route path="signin" element={<SignIn mode="in" />} />
          <Route path="signup" element={<SignIn mode="up" />} />
          <Route path="account/*" element={<ClientOnly fallback={<RouteLoading />}><Account /></ClientOnly>} />
          <Route path="admin/*" element={<ClientOnly fallback={<RouteLoading />}><AdminApp /></ClientOnly>} />
          <Route path="*" element={<ClientOnly fallback={<RouteLoading />}><NotFound /></ClientOnly>} />
        </Route>
      </Routes>
    </>
  )
}
