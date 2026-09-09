// Browser-only image engines shared by ImageConvertTool and CompressImageTool,
// plus the pure helpers those tools (and the tests) rely on.
import { formatBytes, stripExt } from '../../lib/download'

export type OutFormat = 'png' | 'jpg' | 'webp'

export const OUT_MIME: Record<OutFormat, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

export const FORMAT_LABEL: Record<OutFormat, string> = { png: 'PNG', jpg: 'JPG', webp: 'WebP' }

/** `photo.HEIC` + `jpg` → `photo.jpg` */
export function outName(name: string, format: OutFormat) {
  return `${stripExt(name) || 'image'}.${format}`
}

const ext = (name: string) => (name.match(/\.([^.]+)$/)?.[1] ?? '').toLowerCase()

export function isHeic(file: { name: string; type: string }) {
  return /^image\/hei[cf]/.test(file.type) || ext(file.name) === 'heic' || ext(file.name) === 'heif'
}

export function isSvg(file: { name: string; type: string }) {
  return file.type === 'image/svg+xml' || ext(file.name) === 'svg'
}

/** Anything the converter can try to decode. Drag-and-drop ignores the `accept` attribute, so tools must filter. */
export function isImageFile(file: { name: string; type: string }) {
  return file.type.startsWith('image/') || isHeic(file) || isSvg(file)
}

/** Maps a MIME type back to the output format we can re-encode it as ("keep format"). */
export function formatOf(file: { name: string; type: string }): OutFormat | null {
  if (file.type === 'image/png' || ext(file.name) === 'png') return 'png'
  if (file.type === 'image/jpeg' || ext(file.name) === 'jpg' || ext(file.name) === 'jpeg') return 'jpg'
  if (file.type === 'image/webp' || ext(file.name) === 'webp') return 'webp'
  return null
}

/** "2.40 MB → 310.0 KB, 87% smaller" */
export function formatDelta(before: number, after: number) {
  const arrow = `${formatBytes(before)} → ${formatBytes(after)}`
  if (before === 0) return arrow
  if (after === before) return `${arrow}, same size`
  const pct = Math.round((Math.abs(after - before) / before) * 100)
  return `${arrow}, ${pct}% ${after < before ? 'smaller' : 'larger'}`
}

/** The "never make a file bigger" rule: keep the original when re-encoding grew it. */
export function pickSmaller<T extends { size: number }>(original: T, candidate: T): { blob: T; kept: boolean; note?: string } {
  if (candidate.size >= original.size) {
    return {
      blob: original,
      kept: true,
      note: `Re-encoding would have made it ${formatDelta(original.size, candidate.size).split(', ')[1]} (${formatBytes(candidate.size)}), so the original was kept.`,
    }
  }
  return { blob: candidate, kept: false }
}

/** Scale (w,h) down to fit inside `max` on the longer side; never scales up. */
export function fitWithin(w: number, h: number, max: number | null | undefined) {
  if (!max || max <= 0 || (w <= max && h <= max)) return { w, h }
  const s = max / Math.max(w, h)
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) }
}

// ---------------------------------------------------------------------------
// canvas + decoding (browser only below this line)
// ---------------------------------------------------------------------------

let webpProbe: Promise<boolean> | null = null
/** Safari < 16 and some WebViews silently fall back to PNG when asked for WebP. */
export function supportsWebpEncode(): Promise<boolean> {
  if (webpProbe) return webpProbe
  webpProbe = new Promise<boolean>((res) => {
    try {
      const c = document.createElement('canvas')
      c.width = c.height = 2
      if (typeof c.toBlob !== 'function') return res(false)
      c.toBlob((b) => res(!!b && b.type === 'image/webp'), 'image/webp', 0.8)
    } catch {
      res(false)
    }
  })
  return webpProbe
}

export function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((res, rej) => {
    canvas.toBlob(
      (b) => {
        if (!b) return rej(new Error(`The browser could not encode ${mime}`))
        if (b.type !== mime) return rej(new Error(`The browser does not support encoding ${mime}`))
        res(b)
      },
      mime,
      quality,
    )
  })
}

export type Decoded = {
  source: CanvasImageSource
  width: number
  height: number
  /** true when the source already has straight alpha we should keep for PNG/WebP */
  alpha: boolean
  close: () => void
}

function loadImageElement(file: Blob): Promise<{ img: HTMLImageElement; revoke: () => void }> {
  const url = URL.createObjectURL(file)
  const img = new Image()
  return new Promise((res, rej) => {
    img.onload = () => res({ img, revoke: () => URL.revokeObjectURL(url) })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rej(new Error('The browser could not decode this image'))
    }
    img.src = url
  })
}

/**
 * Decodes a browser-native raster (PNG/JPG/WebP/GIF/BMP...).
 * EXIF orientation: `createImageBitmap(file, { imageOrientation: 'from-image' })` bakes the
 * rotation into the bitmap. Browsers without that option (or that reject the format) fall back
 * to an <img>, which has honoured EXIF orientation by default (CSS `image-orientation: from-image`)
 * since 2020, so either path yields an upright picture.
 */
export async function decodeRaster(file: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bmp, width: bmp.width, height: bmp.height, alpha: true, close: () => bmp.close() }
    } catch {
      // fall through to the <img> path
    }
  }
  const { img, revoke } = await loadImageElement(file)
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, alpha: true, close: revoke }
}

export type SvgOptions = { scale?: number; width?: number }

/** SVG has no pixels: rasterise at an explicit width or at N× its intrinsic size (1024 px wide if it declares none). */
export async function decodeSvg(file: Blob, opts: SvgOptions = {}): Promise<Decoded> {
  const { img, revoke } = await loadImageElement(file)
  const iw = img.naturalWidth || img.width || 1024
  const ih = img.naturalHeight || img.height || Math.round(iw * 0.75)
  let width: number
  if (opts.width && opts.width > 0) width = Math.round(opts.width)
  else width = Math.round(iw * (opts.scale ?? 1))
  width = Math.min(Math.max(1, width), 16384)
  const height = Math.max(1, Math.round((ih / iw) * width))
  return { source: img, width, height, alpha: true, close: revoke }
}

/**
 * HEIC/HEIF via libheif compiled to WASM (LGPL-3.0, loaded lazily as its own chunk).
 * libheif applies the file's irot/imir/clap transform boxes while decoding, which is how iPhones
 * record orientation for HEIC, so the RGBA we get back is already upright.
 */
export async function decodeHeic(file: Blob): Promise<Decoded> {
  let lib: Awaited<ReturnType<typeof import('libheif-js/libheif-wasm/libheif-bundle.mjs')['default']>>
  try {
    const mod = await import('libheif-js/libheif-wasm/libheif-bundle.mjs')
    lib = await mod.default()
  } catch {
    throw new Error('Could not load the HEIC decoder. Check your connection and try again.')
  }
  const decoder = new lib.HeifDecoder()
  const images = decoder.decode(new Uint8Array(await file.arrayBuffer()))
  if (!images.length) throw new Error('No image found in this HEIC file. It may be corrupt or use an unsupported codec.')
  const image = images.find((i) => i.is_primary()) ?? images[0]
  try {
    const width = image.get_width()
    const height = image.get_height()
    if (!width || !height) throw new Error('HEIC image has no size')
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available')
    const target = ctx.createImageData(width, height)
    const filled = await new Promise<ImageData | null>((res) => image.display(target, res))
    if (!filled) throw new Error('The HEIC decoder could not decode this image')
    ctx.putImageData(filled, 0, 0)
    return { source: canvas, width, height, alpha: image.has_alpha_channel(), close: () => {} }
  } finally {
    for (const i of images) i.free()
  }
}

export async function decodeAny(file: File, svg: SvgOptions = {}): Promise<Decoded> {
  if (isHeic(file)) return decodeHeic(file)
  if (isSvg(file)) return decodeSvg(file, svg)
  return decodeRaster(file)
}

export type DrawOptions = {
  /** longest side cap; undefined/0 = keep size */
  max?: number | null
  /** CSS colour painted first; omit for transparent */
  background?: string | null
}

export function drawToCanvas(d: Decoded, opts: DrawOptions = {}): HTMLCanvasElement {
  const { w, h } = fitWithin(d.width, d.height, opts.max)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available in this browser')
  if (opts.background) {
    ctx.fillStyle = opts.background
    ctx.fillRect(0, 0, w, h)
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(d.source, 0, 0, w, h)
  return canvas
}

export type ConvertOptions = {
  format: OutFormat
  /** 0..1, used for jpg and webp */
  quality: number
  svg?: SvgOptions
  /** paint white behind transparent pixels (forced for JPG, which has no alpha) */
  whiteBackground?: boolean
}

export type ConvertResult = { blob: Blob; width: number; height: number }

export async function convertImage(file: File, opts: ConvertOptions): Promise<ConvertResult> {
  const d = await decodeAny(file, opts.svg)
  try {
    const background = opts.format === 'jpg' || opts.whiteBackground ? '#ffffff' : null
    const canvas = drawToCanvas(d, { background })
    const blob = await canvasToBlob(canvas, OUT_MIME[opts.format], opts.format === 'png' ? undefined : opts.quality)
    return { blob, width: canvas.width, height: canvas.height }
  } finally {
    d.close()
  }
}

export type CompressOptions = {
  quality: number
  /** longest side cap, null = off */
  max: number | null
  /** 'keep' re-encodes in the source format; otherwise force jpg/webp */
  target: 'keep' | 'jpg' | 'webp'
}

export type CompressResult = ConvertResult & {
  format: OutFormat
  /** true when the original bytes were returned untouched */
  kept: boolean
  note?: string
}

/** Re-encodes a PNG/JPG/WebP; returns the original (with a reason) whenever that is the smaller file. */
export async function compressImage(file: File, opts: CompressOptions): Promise<CompressResult> {
  const src = formatOf(file)
  const format: OutFormat = opts.target === 'keep' ? (src ?? 'jpg') : opts.target
  const d = await decodeAny(file)
  try {
    const canvas = drawToCanvas(d, { max: opts.max, background: format === 'jpg' ? '#ffffff' : null })
    const downscaled = canvas.width < d.width || canvas.height < d.height
    if (format === 'png' && !downscaled) {
      // canvas PNG encoding has no quality knob and is rarely smaller than the source encoder's output
      return {
        blob: file,
        width: d.width,
        height: d.height,
        format,
        kept: true,
        note: 'PNG has no quality setting in the browser. Set a maximum size to downscale it, or choose JPG/WebP output.',
      }
    }
    const candidate = await canvasToBlob(canvas, OUT_MIME[format], format === 'png' ? undefined : opts.quality)
    const pick = pickSmaller(file, candidate)
    if (pick.kept) return { blob: file, width: d.width, height: d.height, format: src ?? format, kept: true, note: pick.note }
    return { blob: candidate, width: canvas.width, height: canvas.height, format, kept: false }
  } finally {
    d.close()
  }
}
