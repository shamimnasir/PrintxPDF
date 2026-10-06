import { createElement, type ComponentType } from 'react'

// Keep page chunks and their warm cache outside App so the entry can preload a route before
// hydration without mixing a non-component export into the component module.
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
  Contact: () => import('./pages/Contact'),
  LocalizedEs: () => import('./pages/localized/es'),
  LocalizedPt: () => import('./pages/localized/pt-BR'),
  LocalizedHi: () => import('./pages/localized/hi'),
  LocalizedAr: () => import('./pages/localized/ar'),
  LocalizedBn: () => import('./pages/localized/bn'),
  LocalizedVi: () => import('./pages/localized/vi'),
  LocalizedZh: () => import('./pages/localized/zh-CN'),
  SignIn: () => import('./features/account/SignIn'),
  Account: () => import('./features/account/Account'),
  NotFound: () => import('./pages/NotFound'),
}

/** Which chunk renders this path. Mirrors App routes and ROUTE_MODULES in the prerenderer. */
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
  [/^\/contact$/, 'Contact'],
  [/^\/es\/guias(?:\/[^/]+)?$/, 'LocalizedEs'],
  [/^\/pt-br\/guias(?:\/[^/]+)?$/, 'LocalizedPt'],
  [/^\/hi\/guides(?:\/[^/]+)?$/, 'LocalizedHi'],
  [/^\/ar\/adella(?:\/[^/]+)?$/, 'LocalizedAr'],
  [/^\/bn\/guides(?:\/[^/]+)?$/, 'LocalizedBn'],
  [/^\/vi\/guides(?:\/[^/]+)?$/, 'LocalizedVi'],
  [/^\/zh-cn\/guides(?:\/[^/]+)?$/, 'LocalizedZh'],
  [/^\/(privacy|terms)$/, 'Legal'],
  [/^\/(signin|signup)$/, 'SignIn'],
  [/^\/account/, 'Account'],
  [/^\/admin/, 'AdminApp'],
]

type AnyPage = ComponentType<Record<string, unknown>>
const ready = new Map<string, AnyPage>()

/**
 * Reads the route cache synchronously so hydration doesn't replace prerendered markup with a
 * Suspense fallback. Client navigation loads the chunk once and then reuses the same cache.
 */
export function page<P extends object = object>(key: keyof typeof load): ComponentType<P> {
  const Page = (props: P) => {
    const Loaded = ready.get(key)
    if (!Loaded) throw load[key]().then((m) => void ready.set(key, m.default as AnyPage))
    return createElement(Loaded, props as Record<string, unknown>)
  }
  Page.displayName = key
  return Page
}

/** Preloads this path's chunk before hydration and fills the shared route cache. */
export function preloadRoute(pathname: string): Promise<unknown> {
  const key = ROUTES.find(([re]) => re.test(pathname))?.[1] ?? 'NotFound'
  return load[key]()
    .then((m) => void ready.set(key, m.default as AnyPage))
    .catch(() => undefined)
}
