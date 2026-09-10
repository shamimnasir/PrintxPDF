import { createElement, useEffect, type ComponentType } from 'react'
import { ClientOnly } from './components/ClientOnly'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout, RouteLoading } from './components/layout/Layout'
import { RuntimeEffects } from './admin/RuntimeEffects'

// The loader for each route lives here once, so main.tsx can await the one this URL needs
// before hydrating. Without that, React hydrates, the lazy chunk is not there yet, and Suspense
// throws away the server-rendered page for a "Loading..." badge until the chunk lands.
const load = {
  Home: () => import('./pages/Home'),
  WebClip: () => import('./features/webclip/WebClipPage'),
  ToolsIndex: () => import('./pages/ToolsIndex'),
  ToolPage: () => import('./features/pdf/ToolPage'),
  Extensions: () => import('./pages/Extensions'),
  WordPress: () => import('./pages/WordPress'),
  WebsiteButton: () => import('./pages/WebsiteButton'),
  Api: () => import('./pages/Api'),
  Pricing: () => import('./pages/Pricing'),
  Blog: () => import('./pages/Blog'),
  ClusterPage: () => import('./pages/ClusterPage'),
  PostPage: () => import('./pages/PostPage'),
  AuthorPage: () => import('./pages/AuthorPage'),
  ExtensionPrivacy: () => import('./pages/ExtensionPrivacy'),
  AdminApp: () => import('./admin/AdminApp'),
  About: () => import('./pages/About'),
  Legal: () => import('./pages/Legal'),
  Support: () => import('./pages/Support'),
  SignIn: () => import('./features/account/SignIn'),
  Account: () => import('./features/account/Account'),
  NotFound: () => import('./pages/NotFound'),
}

/** Which chunk renders this path. Mirrors the routes below, and ROUTE_MODULES in the prerenderer. */
const ROUTES: [RegExp, keyof typeof load][] = [
  [/^\/$/, 'Home'],
  [/^\/print$/, 'WebClip'],
  [/^\/tools$/, 'ToolsIndex'],
  [/^\/tools\//, 'ToolPage'],
  [/^\/extensions/, 'Extensions'],
  [/^\/extension-privacy$/, 'ExtensionPrivacy'],
  [/^\/wordpress$/, 'WordPress'],
  [/^\/website-button$/, 'WebsiteButton'],
  [/^\/api$/, 'Api'],
  [/^\/pricing$/, 'Pricing'],
  [/^\/blog$/, 'Blog'],
  [/^\/blog\/[^/]+$/, 'ClusterPage'],
  [/^\/blog\/[^/]+\/[^/]+$/, 'PostPage'],
  [/^\/author\//, 'AuthorPage'],
  [/^\/about$/, 'About'],
  [/^\/support$/, 'Support'],
  [/^\/(privacy|terms)$/, 'Legal'],
  [/^\/(signin|signup)$/, 'SignIn'],
  [/^\/account/, 'Account'],
  [/^\/admin/, 'AdminApp'],
]

type AnyPage = ComponentType<Record<string, unknown>>
const ready = new Map<string, AnyPage>()

/**
 * A route that renders straight away once its chunk is in memory. React.lazy cannot do this:
 * its payload starts uninitialised, so it suspends on the first render even when the module is
 * already loaded, and during hydration that swaps the server-rendered page for the Suspense
 * fallback for a frame. Reading a cache synchronously avoids the suspend altogether; on a
 * client-side navigation the chunk is not cached yet, so it throws once and Suspense does its job.
 */
function page<P extends object = object>(key: keyof typeof load): ComponentType<P> {
  const Page = (props: P) => {
    const Loaded = ready.get(key)
    if (!Loaded) throw load[key]().then((m) => void ready.set(key, m.default as AnyPage))
    return createElement(Loaded, props as Record<string, unknown>)
  }
  Page.displayName = key
  return Page
}

/** Puts this path's chunk in the cache, so the first render after hydration does not suspend. */
export function preloadRoute(pathname: string): Promise<unknown> {
  const key = ROUTES.find(([re]) => re.test(pathname))?.[1] ?? 'NotFound'
  return load[key]()
    .then((m) => void ready.set(key, m.default as AnyPage))
    .catch(() => undefined)
}

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
