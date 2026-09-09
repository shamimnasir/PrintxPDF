#!/usr/bin/env node
/**
 * Generates extension/icons/icon-{16,32,48,128}.png.
 *
 * Zero dependencies: rasterises a cobalt rounded square with a white "P" by
 * supersampling simple analytic shapes, then encodes a real PNG with node:zlib.
 * Run from the repo root: node extension/tools/make-icons.mjs
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons')
const COBALT = [0x2b, 0x5b, 0xff]
const WHITE = [0xff, 0xff, 0xff]
const SS = 4 // supersamples per axis -> 16 samples per pixel

/* ---------- geometry (normalised 0..1 over the canvas) ---------- */

const PAD = 0.03
const TILE_R = 0.2

function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const hx = (x1 - x0) / 2 - r
  const hy = (y1 - y0) / 2 - r
  const dx = Math.max(Math.abs(x - cx) - hx, 0)
  const dy = Math.max(Math.abs(y - cy) - hy, 0)
  return Math.hypot(dx, dy) <= r
}
const inRect = (x, y, x0, y0, x1, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1
const inCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) <= r

// "P": a stem, a D-shaped bowl, and the counter punched out of the bowl.
const STEM = [0.28, 0.2, 0.42, 0.8]
const BOWL_FLAT = [0.28, 0.2, 0.545, 0.56]
const BOWL_CIRCLE = [0.545, 0.38, 0.18]
const COUNTER_FLAT = [0.42, 0.325, 0.545, 0.435]
const COUNTER_CIRCLE = [0.545, 0.38, 0.055]

function inLetter(x, y) {
  const counter = inRect(x, y, ...COUNTER_FLAT) || inCircle(x, y, ...COUNTER_CIRCLE)
  if (counter) return false
  return inRect(x, y, ...STEM) || inRect(x, y, ...BOWL_FLAT) || inCircle(x, y, ...BOWL_CIRCLE)
}

/* ---------- rasteriser ---------- */

function render(size) {
  const px = Buffer.alloc(size * size * 4)
  const step = 1 / (size * SS)
  for (let py = 0; py < size; py++) {
    for (let pxx = 0; pxx < size; pxx++) {
      let tile = 0
      let letter = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (pxx * SS + sx + 0.5) * step
          const y = (py * SS + sy + 0.5) * step
          if (inRoundedRect(x, y, PAD, PAD, 1 - PAD, 1 - PAD, TILE_R)) {
            tile++
            if (inLetter(x, y)) letter++
          }
        }
      }
      const n = SS * SS
      const a = tile / n // tile coverage -> alpha
      const l = letter / n // letter coverage inside the tile
      const i = (py * size + pxx) * 4
      if (a === 0) {
        px[i] = px[i + 1] = px[i + 2] = px[i + 3] = 0
        continue
      }
      // composite the white letter over the cobalt tile, then premultiply nothing:
      // PNG stores straight alpha, so the RGB is the blended opaque colour.
      const mix = a === 0 ? 0 : l / a
      for (let c = 0; c < 3; c++) px[i + c] = Math.round(COBALT[c] * (1 - mix) + WHITE[c] * mix)
      px[i + 3] = Math.round(a * 255)
    }
  }
  return px
}

/* ---------- PNG encoder ---------- */

let crcTable = null
function crc32(buf) {
  if (!crcTable) {
    crcTable = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c
    }
  }
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  ihdr[10] = 0 // deflate
  ihdr[11] = 0 // adaptive filtering
  ihdr[12] = 0 // no interlace
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // filter type 0 (None)
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT, { recursive: true })
for (const size of [16, 32, 48, 128]) {
  const file = join(OUT, `icon-${size}.png`)
  const png = encodePng(size, render(size))
  writeFileSync(file, png)
  console.log(`wrote ${file} (${size}x${size}, ${png.length} bytes)`)
}
