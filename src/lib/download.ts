const FREE_GENERATION_LIMIT = 10
const GENERATION_KEY = 'pxp:browser-generations'
const ACCOUNT_PATHS = new Set(['/account', '/account/billing', '/signin', '/signup'])

function currentPlan(): string {
  try {
    return JSON.parse(localStorage.getItem('pxp:user') || 'null')?.plan || 'free'
  } catch {
    return 'free'
  }
}

function generationCount(): number {
  try {
    return Number(localStorage.getItem(GENERATION_KEY) || 0)
  } catch {
    return 0
  }
}

function setGenerationCount(count: number) {
  try {
    localStorage.setItem(GENERATION_KEY, String(count))
    window.dispatchEvent(new CustomEvent('pxp:generation', { detail: count }))
  } catch {
    // Keep browser tools usable when local storage is unavailable.
  }
}

export function downloadBlob(blob: Blob, filename: string): boolean {
  const paid = currentPlan() !== 'free'
  const count = generationCount()
  if (!paid && count >= FREE_GENERATION_LIMIT) {
    const returnTo = `${window.location.pathname}${window.location.search}`
    if (!ACCOUNT_PATHS.has(window.location.pathname)) {
      window.location.assign(`/pricing?reason=browser-limit&return=${encodeURIComponent(returnTo)}`)
    }
    return false
  }
  if (!paid) setGenerationCount(count + 1)
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
