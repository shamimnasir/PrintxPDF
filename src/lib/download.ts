const FREE_GENERATION_LIMIT = 10
const GENERATION_KEY = 'pxp:browser-generations:'

function currentPlan(): string {
  try {
    return JSON.parse(localStorage.getItem('pxp:user') || 'null')?.plan || 'free'
  } catch {
    return 'free'
  }
}

function currentTool(): string {
  const match = window.location.pathname.match(/^\/tools\/([^/]+)/)
  if (match) return match[1]
  if (window.location.pathname === '/print') return 'web-page-cleaner'
  if (/\/api\/|\/admin/.test(window.location.pathname)) return ''
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
  return path || 'home'
}

function generationCount(tool: string): number {
  try {
    return Number(localStorage.getItem(`${GENERATION_KEY}${tool}`) || 0)
  } catch {
    return 0
  }
}

function setGenerationCount(tool: string, count: number) {
  try {
    localStorage.setItem(`${GENERATION_KEY}${tool}`, String(count))
    window.dispatchEvent(new CustomEvent('pxp:generation', { detail: count }))
  } catch {
    // Keep browser tools usable when local storage is unavailable.
  }
}

export function downloadBlob(blob: Blob, filename: string, generationTool = ''): boolean {
  const paid = currentPlan() !== 'free'
  const tool = generationTool
  const count = tool ? generationCount(tool) : 0
  if (tool && !paid && count >= FREE_GENERATION_LIMIT) {
    const returnTo = `${window.location.pathname}${window.location.search}`
    window.location.assign(`/pricing?reason=browser-limit&tool=${encodeURIComponent(tool)}&return=${encodeURIComponent(returnTo)}`)
    return false
  }
  if (tool && !paid) setGenerationCount(tool, count + 1)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return true
}

export function downloadGeneratedFiles(items: { blob: Blob; name: string }[], tool: string): boolean {
  if (!canGenerateBrowserFiles(tool, items.length)) return false
  const paid = currentPlan() !== 'free'
  if (!paid) setGenerationCount(tool, generationCount(tool) + items.length)
  for (const [index, item] of items.entries()) setTimeout(() => downloadBlob(item.blob, item.name), index * 250)
  return true
}

export function downloadGeneratedZip(blob: Blob, filename: string, tool: string, files: number): boolean {
  if (!canGenerateBrowserFiles(tool, files)) return false
  const paid = currentPlan() !== 'free'
  if (!paid) setGenerationCount(tool, generationCount(tool) + files)
  return downloadBlob(blob, filename)
}

export function resetBrowserGeneration(tool: string) {
  if (tool) setGenerationCount(tool, 0)
}

export function canDownloadGeneratedFiles(tool: string, files: number) {
  return canGenerateBrowserFiles(tool, files)
}

export function browserGenerationStatus(tool = currentTool()) {
  const paid = currentPlan() !== 'free'
  const used = tool ? generationCount(tool) : 0
  return { tool, used, limit: FREE_GENERATION_LIMIT, remaining: paid ? Infinity : Math.max(0, FREE_GENERATION_LIMIT - used), paid }
}

export function canGenerateBrowserFiles(tool = currentTool(), files = 1): boolean {
  const status = browserGenerationStatus(tool)
  if (!tool || status.paid || status.remaining >= files) return true
  const returnTo = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/pricing?reason=browser-limit&tool=${encodeURIComponent(tool)}&return=${encodeURIComponent(returnTo)}`)
  return false
}

export function downloadBytes(bytes: Uint8Array, filename: string, type = 'application/pdf') {
  downloadBlob(new Blob([bytes as BlobPart], { type }), filename)
}

export function stripExt(name: string) {
  return name.replace(/\.[^.]+$/, '')
}

export function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
