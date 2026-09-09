/**
 * Geometry shared by the bespoke editing tools.
 *
 * `engines.ts` has an identical private `visualRect`, but it is not exported and that file is
 * owned elsewhere, so the maths is replicated here rather than reaching across the boundary.
 * Keep the two in step: a change to one is a change to the other.
 *
 * pdf-lib is deliberately *not* imported here (not even for types) so that importing this module
 * never pulls the library into a tool's initial chunk. The page argument is structurally typed;
 * a real `PDFPage` satisfies it.
 */

export type PageLike = {
  getRotation(): { angle: number }
  getSize(): { width: number; height: number }
}

export type VisualRect = {
  /** pdf-lib draw origin (bottom-left of the box, in unrotated page space) */
  x: number
  y: number
  width: number
  height: number
  /** degrees to pass to pdf-lib's `degrees()` so the drawn box follows the page rotation */
  rotateAngle: number
  /** page width/height as the reader sees it, in points (rotation applied) */
  VW: number
  VH: number
}

/**
 * Turn a top-left-origin fractional rect *in the visual (rotated) frame* into pdf-lib draw
 * coordinates. `fx`/`fy` are 0..1 across the page as displayed; `fw`/`fh` likewise.
 * Passing `fw = fh = 0` maps a single point.
 */
export function visualRect(page: PageLike, fx: number, fy: number, fw: number, fh: number): VisualRect {
  const rot = ((page.getRotation().angle % 360) + 360) % 360
  const { width: W, height: H } = page.getSize()
  const [VW, VH] = rot % 180 ? [H, W] : [W, H]
  const left = fx * VW
  const top = fy * VH
  const vw = fw * VW
  const vh = fh * VH
  // the content's own bottom-left corner, in the visual frame
  const bx = left
  const by = top + vh
  let x: number
  let y: number
  if (rot === 90) [x, y] = [by, bx]
  else if (rot === 180) [x, y] = [W - bx, by]
  else if (rot === 270) [x, y] = [W - by, H - bx]
  else [x, y] = [bx, H - by]
  return { x, y, width: vw, height: vh, rotateAngle: rot, VW, VH }
}

/** "#2b5bff" → [0.168, 0.357, 1] for pdf-lib's `rgb()`. Falls back to black. */
export function hexToRgb01(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return [0, 0, 0]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** Read a CSS custom property off an element and parse it to 0-255 RGB (design tokens change per preset). */
export function tokenRgb(el: Element | null, name: string, fallback: [number, number, number]): [number, number, number] {
  if (!el) return fallback
  const raw = getComputedStyle(el).getPropertyValue(name).trim()
  if (!raw) return fallback
  const hex = /^#?([0-9a-f]{6})$/i.exec(raw)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const fn = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(raw)
  if (fn) return [Number(fn[1]), Number(fn[2]), Number(fn[3])]
  return fallback
}

/** Longest-edge cap for a canvas, returning the original when it already fits. */
export function capCanvas(src: HTMLCanvasElement, maxEdge: number): HTMLCanvasElement {
  const longest = Math.max(src.width, src.height)
  if (longest <= maxEdge) return src
  const r = maxEdge / longest
  const out = document.createElement('canvas')
  out.width = Math.max(1, Math.round(src.width * r))
  out.height = Math.max(1, Math.round(src.height * r))
  const ctx = out.getContext('2d')
  if (ctx) {
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(src, 0, 0, out.width, out.height)
  }
  return out
}
