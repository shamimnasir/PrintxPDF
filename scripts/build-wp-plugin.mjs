#!/usr/bin/env node
// Lints and packages the PrintxPDF WordPress plugin.
//
// Zero dependencies: node built-ins plus the system `zip` / `unzip`.
//
// Output:
//   dist-wp/printxpdf-wordpress-plugin-v<version>.zip
//   public/downloads/printxpdf-wordpress-plugin.zip
//
// The archive contains exactly one top-level directory, `printxpdf/`, which is
// what WordPress expects when a zip is uploaded from Plugins > Add New.
// (Note this is the opposite of the Chrome extension packaging rule, where the
// manifest has to sit at the archive root.)

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, copyFileSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'wordpress-plugin', 'printxpdf')
const DIST = path.join(ROOT, 'dist-wp')
const STAGE = path.join(DIST, '.stage')
const DOWNLOADS = path.join(ROOT, 'public', 'downloads')
const SLUG = 'printxpdf'

const REQUIRED_FILES = [
  'printxpdf.php',
  'readme.txt',
  'uninstall.php',
  'LICENSE',
  'assets/printxpdf.css',
  'languages/printxpdf.pot',
]

const REQUIRED_HEADERS = [
  'Plugin Name',
  'Plugin URI',
  'Description',
  'Version',
  'Requires at least',
  'Requires PHP',
  'Author',
  'Author URI',
  'License',
  'License URI',
  'Text Domain',
]

const REQUIRED_README_SECTIONS = [
  '== Description ==',
  '== Installation ==',
  '== Frequently Asked Questions ==',
  '== Screenshots ==',
  '== Changelog ==',
  '== Upgrade Notice ==',
]

// A superglobal read is only acceptable when the same line also sanitizes,
// unslashes, verifies a nonce, or checks isset() as a pure guard.
const SANITIZERS = [
  'sanitize_', 'absint', 'intval', 'floatval', 'wp_unslash', 'esc_',
  'wp_verify_nonce', 'check_admin_referer', 'check_ajax_referer',
  'wp_kses', 'filter_var', 'wp_parse_id_list',
]

const OUTBOUND = [
  'wp_remote_get', 'wp_remote_post', 'wp_remote_head', 'wp_remote_request',
  'curl_init', 'curl_exec', 'curl_setopt', 'fsockopen', 'stream_socket_client',
]

const failures = []
const notes = []

function fail(message) {
  failures.push(message)
}

function ok(message) {
  notes.push(message)
}

function walk(dir, base = '') {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.name === 'node_modules') continue
    const rel = base ? `${base}/${entry.name}` : entry.name
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(abs, rel))
    else if (entry.isFile()) out.push(rel)
  }
  return out.sort()
}

function human(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function has(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

/* -------------------------------------------------------------- lint ---- */

if (!existsSync(SRC)) {
  console.error(`Plugin source not found at ${SRC}`)
  process.exit(1)
}

const files = walk(SRC)

for (const required of REQUIRED_FILES) {
  if (!files.includes(required)) fail(`missing required file: ${required}`)
}
if (!failures.length) ok(`all ${REQUIRED_FILES.length} required files present`)

const mainPath = path.join(SRC, 'printxpdf.php')
const mainSrc = existsSync(mainPath) ? readFileSync(mainPath, 'utf8') : ''
const headerBlock = mainSrc.slice(0, 2500)

const headers = {}
for (const field of REQUIRED_HEADERS) {
  const match = headerBlock.match(new RegExp(`^\\s*\\*\\s*${field}\\s*:\\s*(.+)$`, 'm'))
  if (!match || !match[1].trim()) fail(`plugin header missing or empty: ${field}`)
  else headers[field] = match[1].trim()
}
if (Object.keys(headers).length === REQUIRED_HEADERS.length) {
  ok(`plugin header complete (${REQUIRED_HEADERS.length} fields)`)
}

const version = headers.Version || ''
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`Version "${version}" is not x.y.z`)

const readmePath = path.join(SRC, 'readme.txt')
const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : ''

if (!/^===\s.+\s===$/m.test(readme)) fail('readme.txt has no "=== Plugin Name ===" title line')
for (const section of REQUIRED_README_SECTIONS) {
  if (!readme.includes(section)) fail(`readme.txt missing section: ${section}`)
}
for (const field of ['Contributors', 'Tags', 'Requires at least', 'Tested up to', 'Requires PHP', 'Stable tag', 'License', 'License URI']) {
  if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(readme)) fail(`readme.txt missing header field: ${field}`)
}

const stableTag = (readme.match(/^Stable tag:\s*(.+)$/m) || [])[1]?.trim()
if (stableTag !== version) fail(`Stable tag "${stableTag}" does not match plugin Version "${version}"`)
else ok(`version ${version} matches readme Stable tag`)

const phpFiles = files.filter((f) => f.endsWith('.php'))
let superglobalHits = 0

for (const rel of phpFiles) {
  const src = readFileSync(path.join(SRC, rel), 'utf8')
  const lines = src.split('\n')

  // ABSPATH guard (uninstall.php uses the WP_UNINSTALL_PLUGIN guard instead).
  if (rel === 'uninstall.php') {
    if (!/defined\(\s*'WP_UNINSTALL_PLUGIN'\s*\)/.test(src)) fail(`${rel}: no WP_UNINSTALL_PLUGIN guard`)
  } else if (!/defined\(\s*'ABSPATH'\s*\)/.test(src)) {
    fail(`${rel}: no ABSPATH guard`)
  }

  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`
    const code = line.replace(/\/\/.*$/, '')

    if (/\beval\s*\(/.test(code)) fail(`${at}: eval( is not allowed`)
    if (/\bbase64_decode\s*\(/.test(code)) fail(`${at}: base64_decode( is not allowed`)
    if (/\bcreate_function\s*\(/.test(code)) fail(`${at}: create_function( is not allowed`)

    for (const fn of OUTBOUND) {
      if (new RegExp(`\\b${fn}\\s*\\(`).test(code)) fail(`${at}: outbound HTTP call ${fn}()`)
    }
    if (/file_get_contents\s*\(\s*['"]https?:/.test(code)) fail(`${at}: outbound file_get_contents()`)

    const superglobal = code.match(/\$_(POST|GET|REQUEST|COOKIE|SERVER|FILES)\b/)
    if (superglobal) {
      superglobalHits++
      const guarded = SANITIZERS.some((s) => code.includes(s)) || /^\s*(if\s*\(\s*)?!?\s*isset\s*\(/.test(code)
      if (!guarded) fail(`${at}: $_${superglobal[1]} read with no sanitization on the same line`)
    }

    if (/\becho\s+\$/.test(code)) fail(`${at}: echoing a bare variable, escape it first`)
    if (/<\?=/.test(code)) fail(`${at}: short echo tag, use an escaped echo`)
  })
}

if (superglobalHits === 0) ok('no $_POST / $_GET / $_REQUEST reads anywhere in the plugin')
if (!failures.some((f) => f.includes('outbound'))) ok('no outbound HTTP: the plugin never calls out')

// php -l when a PHP binary is around.
if (has('php')) {
  for (const rel of phpFiles) {
    try {
      execFileSync('php', ['-l', path.join(SRC, rel)], { stdio: 'pipe' })
    } catch (error) {
      fail(`${rel}: php -l failed\n${error.stdout?.toString() || error.message}`)
    }
  }
  ok(`php -l clean on ${phpFiles.length} PHP file(s)`)
} else {
  ok('php not on PATH, skipped php -l')
}

console.log('PrintxPDF WordPress plugin build\n')
for (const note of notes) console.log(`  ok    ${note}`)
if (failures.length) {
  console.log('')
  for (const f of failures) console.error(`  FAIL  ${f}`)
  console.error(`\n${failures.length} problem(s). Nothing packaged.`)
  process.exit(1)
}

/* ------------------------------------------------------------- package -- */

rmSync(STAGE, { recursive: true, force: true })
mkdirSync(path.join(STAGE, SLUG), { recursive: true })

for (const rel of files) {
  const dest = path.join(STAGE, SLUG, rel)
  mkdirSync(path.dirname(dest), { recursive: true })
  copyFileSync(path.join(SRC, rel), dest)
}

const zipName = `printxpdf-wordpress-plugin-v${version}.zip`
const zipPath = path.join(DIST, zipName)
rmSync(zipPath, { force: true })

if (!has('zip')) {
  console.error('\n  FAIL  the system `zip` command is required to package the plugin')
  process.exit(1)
}

execFileSync('zip', ['-r', '-X', '-q', zipPath, SLUG], { cwd: STAGE })

// The archive must hold exactly one top-level directory: printxpdf/
const listing = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)

const roots = new Set(listing.map((entry) => entry.split('/')[0]))
if (roots.size !== 1 || !roots.has(SLUG)) {
  console.error(`\n  FAIL  archive root should be only "${SLUG}/", found: ${[...roots].join(', ')}`)
  process.exit(1)
}
if (listing.some((entry) => entry.includes('.DS_Store') || entry.includes('__MACOSX'))) {
  console.error('\n  FAIL  archive contains macOS metadata')
  process.exit(1)
}

execFileSync('unzip', ['-tq', zipPath], { stdio: 'pipe' })

mkdirSync(DOWNLOADS, { recursive: true })
const publicZip = path.join(DOWNLOADS, 'printxpdf-wordpress-plugin.zip')
copyFileSync(zipPath, publicZip)

rmSync(STAGE, { recursive: true, force: true })

const size = statSync(zipPath).size
console.log(`  ok    archive root is a single ${SLUG}/ directory (${listing.length} entries)`)
console.log(`  ok    unzip -t reported no errors`)
console.log(`\nBuilt  ${path.relative(ROOT, zipPath)}  (${human(size)})`)
console.log(`Copied ${path.relative(ROOT, publicZip)}`)
