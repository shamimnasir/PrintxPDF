#!/usr/bin/env node
/**
 * Validates and packages the Chrome extension.
 *
 *   node scripts/build-extension.mjs
 *
 * Writes dist-extension/printxpdf-extension-v<version>.zip (manifest.json at the
 * archive root, which is what the Web Store requires) and copies it to
 * public/downloads/ so the site can serve it. Zero dependencies: the ZIP is
 * written by hand on top of node:zlib.
 */
import { deflateRawSync } from 'node:zlib'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'extension')
const OUT_DIR = join(ROOT, 'dist-extension')
const SITE_COPY = join(ROOT, 'public', 'downloads', 'printxpdf-chrome-extension.zip')

/**
 * Development-only files that must not ship inside the package. Documentation
 * (README, PRIVACY, STORE_LISTING) is for humans and reviewers, not for Chrome:
 * every byte in the zip is code a reviewer has to read, so keep it to code.
 */
// store-assets holds the listing screenshots and promo tiles: they belong in the dashboard,
// never inside the uploaded package (they added 237 KB of dead weight when they were included)
const EXCLUDE_DIRS = new Set(['tools', 'store-assets', 'node_modules', '.git'])
const EXCLUDE_FILES = new Set(['.DS_Store'])
/** Anything matching these never ships, whatever it is called. */
const EXCLUDE_PATTERNS = [/\.md$/i, /\.zip$/i, /\.map$/i, /~$/]

/** Validation failures are user errors, not crashes: say why, exit 1, no stack. */
const fail = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

/* ------------------------------------------------------------------ */
/* 1. validate the manifest                                           */
/* ------------------------------------------------------------------ */

function validate() {
  let manifest
  const manifestPath = join(SRC, 'manifest.json')
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch (err) {
    fail(`extension/manifest.json is not valid JSON: ${err.message}`)
  }

  for (const key of ['manifest_version', 'name', 'version', 'description', 'icons', 'action', 'background', 'permissions']) {
    if (manifest[key] == null) fail(`manifest.json is missing "${key}"`)
  }
  if (manifest.manifest_version !== 3) fail(`manifest_version must be 3, found ${manifest.manifest_version}`)
  // 1 to 4 dot-separated integers, each 0..65535 and without a leading zero.
  const versionPart = /^(0|[1-9]\d{0,4})$/
  const parts = String(manifest.version).split('.')
  if (parts.length > 4 || !parts.every((p) => versionPart.test(p) && Number(p) <= 65535)) {
    fail(`version "${manifest.version}" is not a Web Store version string (1-4 integers, each 0-65535, no leading zeros)`)
  }
  if (manifest.description.length > 132) fail(`description is ${manifest.description.length} chars; the Web Store caps it at 132`)
  if (manifest.name.length > 75) fail(`name is ${manifest.name.length} chars; the Web Store caps it at 75`)
  if (manifest.name.length > 45) console.warn(`⚠ name is ${manifest.name.length} chars; listings are truncated in the store around 45`)
  if (manifest.short_name && manifest.short_name.length > 12) {
    fail(`short_name is ${manifest.short_name.length} chars; Chrome caps it at 12`)
  }
  // default_locale without _locales/ is an outright install error in Chrome.
  const hasLocales = (() => {
    try {
      return statSync(join(SRC, '_locales')).isDirectory()
    } catch {
      return false
    }
  })()
  if (manifest.default_locale && !hasLocales) fail('manifest sets default_locale but extension/_locales/ does not exist')
  if (!manifest.default_locale && hasLocales) fail('extension/_locales/ exists but manifest has no default_locale')
  // A permission nobody calls is a review question with no good answer.
  if (manifest.host_permissions?.length) {
    console.warn(`⚠ host_permissions present (${manifest.host_permissions.join(', ')}); broad patterns slow review sharply`)
  }

  // Every path the manifest points at has to exist inside extension/.
  const referenced = new Set()
  for (const path of Object.values(manifest.icons)) referenced.add(path)
  for (const path of Object.values(manifest.action?.default_icon ?? {})) referenced.add(path)
  if (manifest.action?.default_popup) referenced.add(manifest.action.default_popup)
  if (manifest.background?.service_worker) referenced.add(manifest.background.service_worker)
  for (const scripts of manifest.content_scripts ?? []) for (const js of scripts.js ?? []) referenced.add(js)

  for (const path of referenced) {
    try {
      if (!statSync(join(SRC, path)).isFile()) fail(`manifest references "${path}", which is not a file`)
    } catch {
      fail(`manifest references "${path}", which does not exist in extension/`)
    }
  }

  for (const size of ['16', '32', '48', '128']) {
    if (!manifest.icons[size]) fail(`icons is missing the ${size}px entry`)
    const head = readFileSync(join(SRC, manifest.icons[size]))
    const isPng = head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    if (!isPng) fail(`${manifest.icons[size]} is not a PNG`)
    const width = head.readUInt32BE(16)
    const height = head.readUInt32BE(20)
    if (width !== Number(size) || height !== Number(size)) {
      fail(`${manifest.icons[size]} is ${width}x${height}, expected ${size}x${size}`)
    }
  }

  console.log(`✓ manifest v${manifest.manifest_version} "${manifest.name}" ${manifest.version}`)
  console.log(`  permissions: ${manifest.permissions.join(', ')}`)
  console.log(`  host_permissions: ${manifest.host_permissions ? manifest.host_permissions.join(', ') : 'none (activeTab only)'}`)
  console.log(`  files referenced: ${[...referenced].sort().join(', ')}`)
  return manifest
}

/* ------------------------------------------------------------------ */
/* 2. collect the files that ship                                     */
/* ------------------------------------------------------------------ */

function collect(dir = SRC, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      collect(join(dir, entry.name), acc)
      continue
    }
    if (EXCLUDE_FILES.has(entry.name) || entry.name.startsWith('.')) continue
    if (EXCLUDE_PATTERNS.some((re) => re.test(entry.name))) continue
    const abs = join(dir, entry.name)
    acc.push({ name: relative(SRC, abs).split(sep).join('/'), data: readFileSync(abs) })
  }
  return acc
}

/* ------------------------------------------------------------------ */
/* 2b. prove there is no remote code and no inline handler            */
/* ------------------------------------------------------------------ */

/**
 * The Manifest V3 requirements are blunt: no <script> pointing outside the
 * package, no eval of a remotely fetched string, no interpreter for remote
 * commands. The strict extension-page CSP also refuses inline scripts and
 * inline event attributes. Both are cheap to check here, every build, instead
 * of finding out from a rejection email.
 * https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements
 */
const HTML = /\.html?$/i
const STYLES = /\.(css|html?)$/i
const SCRIPTS = /\.(js|mjs)$/i
const ANY = /\.(js|mjs|html?|css|json)$/i

/** [file-type, pattern, what it is]. Scoped by type so `once = 'x'` in a .js
 *  file cannot be mistaken for an `onclick=` attribute in markup. */
const CODE_RULES = [
  [HTML, /<script\b[^>]*\bsrc\s*=\s*["']?(?:https?:)?\/\//i, 'a <script src> pointing at a remote host'],
  [HTML, /<script(?![^>]*\bsrc\s*=)[^>]*>[\s\S]*?\S[\s\S]*?<\/script>/i, 'an inline <script> block (the MV3 CSP refuses it)'],
  [HTML, /<[a-z][^>]*\son(?:click|load|error|change|input|submit|focus|blur|mouse[a-z]+|key[a-z]+|touch[a-z]+)\s*=/i, 'an inline event handler attribute (the MV3 CSP refuses it)'],
  [HTML, /<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\//i, 'a remotely hosted stylesheet or font'],
  [STYLES, /@import\s+(?:url\()?["']?(?:https?:)?\/\//i, 'a remote CSS @import'],
  [STYLES, /\bsrc\s*:\s*url\(\s*["']?(?:https?:)?\/\//i, 'a remotely hosted @font-face file'],
  [SCRIPTS, /\beval\s*\(/, 'a call to eval()'],
  [SCRIPTS, /\bnew\s+Function\s*\(/, 'a call to new Function()'],
  [SCRIPTS, /\bimportScripts\s*\(/, 'importScripts()'],
  [SCRIPTS, /\bfetch\s*\(/, 'a fetch() call (this extension makes no network requests)'],
  [SCRIPTS, /\bnew\s+WebSocket\s*\(/, 'a WebSocket connection'],
  [SCRIPTS, /\bXMLHttpRequest\b/, 'XMLHttpRequest'],
  [SCRIPTS, /\bimport\s*\(/, 'a dynamic import()'],
]

function audit(files) {
  const findings = []
  for (const file of files) {
    if (!ANY.test(file.name)) continue
    const text = file.data.toString('utf8')
    for (const [kind, pattern, why] of CODE_RULES) {
      if (kind.test(file.name) && pattern.test(text)) findings.push(`${file.name}: ${why}`)
    }
  }
  if (findings.length) {
    for (const finding of findings) console.error(`  ✗ ${finding}`)
    fail('remote-code / CSP audit failed; the Web Store rejects packages like this')
  }
  console.log('✓ no remote code, no inline scripts, no inline event handlers, no network calls')
}

/* ------------------------------------------------------------------ */
/* 3. write the ZIP (local headers + central directory, by hand)      */
/* ------------------------------------------------------------------ */

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

function dosStamp(d) {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  }
}

function zip(files) {
  const { time, date } = dosStamp(new Date())
  const local = []
  const central = []
  let offset = 0

  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8')
    const raw = file.data
    const deflated = deflateRawSync(raw, { level: 9 })
    // Store instead of deflate when compression does not pay for itself.
    const useDeflate = deflated.length < raw.length
    const body = useDeflate ? deflated : raw
    const method = useDeflate ? 8 : 0
    const crc = crc32(raw)

    const header = Buffer.alloc(30)
    header.writeUInt32LE(0x04034b50, 0)
    header.writeUInt16LE(20, 4) // version needed
    header.writeUInt16LE(0x0800, 6) // UTF-8 names
    header.writeUInt16LE(method, 8)
    header.writeUInt16LE(time, 10)
    header.writeUInt16LE(date, 12)
    header.writeUInt32LE(crc, 14)
    header.writeUInt32LE(body.length, 18)
    header.writeUInt32LE(raw.length, 22)
    header.writeUInt16LE(name.length, 26)
    header.writeUInt16LE(0, 28) // extra field length
    local.push(header, name, body)

    const dirEntry = Buffer.alloc(46)
    dirEntry.writeUInt32LE(0x02014b50, 0)
    dirEntry.writeUInt16LE(20, 4) // version made by
    dirEntry.writeUInt16LE(20, 6) // version needed
    dirEntry.writeUInt16LE(0x0800, 8)
    dirEntry.writeUInt16LE(method, 10)
    dirEntry.writeUInt16LE(time, 12)
    dirEntry.writeUInt16LE(date, 14)
    dirEntry.writeUInt32LE(crc, 16)
    dirEntry.writeUInt32LE(body.length, 20)
    dirEntry.writeUInt32LE(raw.length, 24)
    dirEntry.writeUInt16LE(name.length, 28)
    dirEntry.writeUInt16LE(0, 30) // extra
    dirEntry.writeUInt16LE(0, 32) // comment
    dirEntry.writeUInt16LE(0, 34) // disk number
    dirEntry.writeUInt16LE(0, 36) // internal attrs
    dirEntry.writeUInt32LE(0o644 << 16, 38) // external attrs: regular file, rw-r--r--
    dirEntry.writeUInt32LE(offset, 42)
    central.push(dirEntry, name)

    offset += header.length + name.length + body.length
  }

  const centralBuf = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4) // this disk
  end.writeUInt16LE(0, 6) // disk with the central directory
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20) // no comment
  return Buffer.concat([...local, centralBuf, end])
}

/* ------------------------------------------------------------------ */

const manifest = validate()
const files = collect()
if (!files.some((f) => f.name === 'manifest.json')) fail('manifest.json must sit at the root of the archive')
audit(files)

const archive = zip(files)
mkdirSync(OUT_DIR, { recursive: true })
const outFile = join(OUT_DIR, `printxpdf-extension-v${manifest.version}.zip`)
writeFileSync(outFile, archive)
mkdirSync(dirname(SITE_COPY), { recursive: true })
copyFileSync(outFile, SITE_COPY)

console.log(`✓ packaged ${files.length} files`)
for (const file of files) console.log(`    ${file.name} (${file.data.length} bytes)`)
console.log(`✓ ${outFile}, ${archive.length} bytes`)
console.log(`✓ ${SITE_COPY}, ${archive.length} bytes`)
