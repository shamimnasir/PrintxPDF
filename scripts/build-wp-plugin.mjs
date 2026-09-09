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
  'assets/printxpdf.js',
  'assets/printxpdf-admin.css',
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

// Patterns Plugin Check (PCP) and the Plugin Review Team flag. Each entry is
// [regex, message]; a hit anywhere in a PHP file fails the build.
const DISCOURAGED = [
  [/\berror_log\s*\(/, 'error_log() left in the code'],
  [/\bvar_dump\s*\(/, 'var_dump() left in the code'],
  [/\bprint_r\s*\(/, 'print_r() left in the code'],
  [/\bvar_export\s*\(/, 'var_export() left in the code'],
  [/(?<!wp_)\bjson_encode\s*\(/, 'use wp_json_encode() rather than json_encode()'],
  [/\bstrip_tags\s*\(/, 'use wp_strip_all_tags() rather than strip_tags()'],
  [/\bdate\s*\(/, 'use gmdate() or current_time() rather than date()'],
  [/(?<![_a-z])\btime\s*\(/, 'use current_time() rather than time()'],
  [/\$wpdb\b/, 'direct database access'],
  [/\bextract\s*\(/, 'extract() is discouraged'],
  [/\bserialize\s*\(/, 'serialize() is discouraged'],
  [/\bmove_uploaded_file\s*\(/, 'file upload handling'],
  [/\b(fopen|fwrite|file_put_contents|unlink|rename|mkdir)\s*\(/, 'direct filesystem write, use WP_Filesystem'],
  [/(?<![_a-z])_e\s*\(/, 'use esc_html_e() rather than the unescaped _e()'],
  [/(?<![_a-z])_ex\s*\(/, 'use an escaped alternative rather than _ex()'],
  [/<script[\s>]/i, 'inline <script>, enqueue it instead'],
  [/<style[\s>]/i, 'inline <style>, enqueue it instead'],
  [/\sstyle\s*=\s*["']/, 'inline style attribute, move it to an enqueued stylesheet'],
  [/esc_url_raw\s*\(\s*\$?[\w'"]+\s*\)\s*\./, 'esc_url_raw() sanitizes, it does not escape output; use esc_url()'],
]

const OUTBOUND = [
  'wp_remote_get', 'wp_remote_post', 'wp_remote_head', 'wp_remote_request',
  'curl_init', 'curl_exec', 'curl_setopt', 'fsockopen', 'stream_socket_client',
]

// `--draft` packages a zip even when the only outstanding problems are the
// human steps listed in wordpress-plugin/SUBMISSION.md. A submission build
// must be run WITHOUT it: those items fail WordPress.org validation.
const DRAFT = process.argv.includes('--draft')

const failures = []
const blockers = []
const notes = []

function fail(message) {
  failures.push(message)
}

// A human-action item: fatal for a submission build, downgraded under --draft.
function blocker(message) {
  if (DRAFT) blockers.push(message)
  else failures.push(message)
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

// Tags: the directory hard-limits these to 5.
// https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/
const tags = ((readme.match(/^Tags:\s*(.*)$/m) || [])[1] || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean)
if (tags.length === 0) fail('readme.txt Tags is empty')
else if (tags.length > 5) fail(`readme.txt has ${tags.length} tags, the directory allows at most 5`)
else ok(`readme.txt has ${tags.length} tag(s), within the limit of 5`)

// Contributors must be real wordpress.org usernames; a placeholder fails
// submission validation, so refuse to package one.
const contributors = ((readme.match(/^Contributors:\s*(.*)$/m) || [])[1] || '')
  .split(',')
  .map((c) => c.trim())
  .filter(Boolean)
if (!contributors.length) {
  fail('readme.txt Contributors is empty')
} else if (contributors.some((c) => /todo|xxx|placeholder|your-?username|example/i.test(c))) {
  blocker(
    `readme.txt Contributors is still a placeholder (${contributors.join(', ')}). ` +
      'Set it to a real, existing WordPress.org username before submitting. ' +
      'See wordpress-plugin/SUBMISSION.md.'
  )
} else {
  ok(`readme.txt Contributors set (${contributors.join(', ')})`)
}

// Short description: the line under the header block, max 150 chars, no markup.
const shortDesc = (readme.split(/\n\s*\n/)[1] || '').trim()
if (!shortDesc) fail('readme.txt has no short description under the header block')
else if (shortDesc.length > 150) fail(`readme.txt short description is ${shortDesc.length} chars, the limit is 150`)
else if (shortDesc.startsWith('==')) fail('readme.txt short description is missing (a section starts immediately)')
else ok(`readme.txt short description is ${shortDesc.length}/150 chars`)

// "Tested up to" must be a real WP version, and reviewers reject stale values.
const testedUpTo = ((readme.match(/^Tested up to:\s*(.*)$/m) || [])[1] || '').trim()
if (!/^\d+\.\d+(\.\d+)?$/.test(testedUpTo)) fail(`readme.txt "Tested up to: ${testedUpTo}" is not a WordPress version number`)
else ok(`readme.txt Tested up to ${testedUpTo}`)

// Guideline 6 / Review Checklist: a plugin that points users at a third-party
// service MUST disclose it in the readme with links to terms and privacy.
// https://make.wordpress.org/plugins/handbook/performing-reviews/review-checklist/
const endpointHost = (mainSrc.match(/PRINTXPDF_ENDPOINT',\s*'https?:\/\/([^/']+)/) || [])[1]
if (endpointHost) {
  if (!/^=+\s*External service/im.test(readme)) {
    fail(`readme.txt has no "External service" section, required because the plugin links to ${endpointHost}`)
  } else if (!readme.includes(`${endpointHost}/terms`) || !readme.includes(`${endpointHost}/privacy`)) {
    fail('readme.txt external-service section must link to both the terms of use and the privacy policy')
  } else if (!readme.includes(endpointHost)) {
    fail(`readme.txt external-service section does not name ${endpointHost}`)
  } else {
    ok(`readme.txt discloses the external service ${endpointHost} with terms and privacy links`)
  }

  // The same disclosure is required on the Settings page.
  if (!/External service/.test(mainSrc) || !mainSrc.includes('/terms') || !mainSrc.includes('/privacy')) {
    fail('the settings screen must repeat the external-service disclosure with terms and privacy links')
  } else {
    ok('settings screen repeats the external-service disclosure')
  }
}

// Slug consistency: text domain, textdomain path, POT domain, readme, option prefix.
const textDomain = headers['Text Domain']
if (textDomain !== SLUG) fail(`Text Domain "${textDomain}" is not the slug "${SLUG}"`)
if (!new RegExp(`load_plugin_textdomain\\(\\s*'${SLUG}'`).test(mainSrc)) {
  fail(`load_plugin_textdomain() does not use the '${SLUG}' domain`)
}
const potPath = path.join(SRC, 'languages', `${SLUG}.pot`)
if (existsSync(potPath) && !readFileSync(potPath, 'utf8').includes(`X-Domain: ${SLUG}`)) {
  fail(`languages/${SLUG}.pot does not declare X-Domain: ${SLUG}`)
}
const badDomains = [...mainSrc.matchAll(/(?:__|_e|_x|esc_html__|esc_attr__|esc_html_e|esc_attr_e)\(\s*(?:'[^']*'|"[^"]*")\s*,\s*([^)]+)\)/g)]
  .map((m) => m[1].trim())
  .filter((d) => d !== `'${SLUG}'`)
if (badDomains.length) fail(`i18n calls with a non-literal or wrong text domain: ${[...new Set(badDomains)].join(', ')}`)
else ok(`every i18n call uses the literal '${SLUG}' text domain`)

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

    // Skip docblock/comment bodies for the discouraged-pattern sweep.
    if (!/^\s*(\*|\/\*|#)/.test(line)) {
      for (const [pattern, message] of DISCOURAGED) {
        if (pattern.test(code)) fail(`${at}: ${message}`)
      }
    }


  })
}

// Any wp_enqueue_*/wp_register_* call that supplies a src must also supply a
// version. Re-enqueueing an already-registered handle takes the handle alone
// and needs no version, so those calls are skipped.
for (const rel of phpFiles) {
  const src = readFileSync(path.join(SRC, rel), 'utf8')
  for (const call of src.matchAll(/wp_(?:register|enqueue)_(?:script|style)\s*\(([\s\S]{0,400}?)\)\s*;/g)) {
    const args = call[1]
    const hasSrc = /PRINTXPDF_URL|https?:\/\/|\.(?:css|js)['"]/.test(args)
    if (hasSrc && !/PRINTXPDF_VERSION|'\d+\.\d+/.test(args)) {
      fail(`${rel}: asset registered with a src but no version -> ${call[0].split('\n')[0].trim()}`)
    }
  }
}
if (!failures.some((f) => f.includes('no version'))) ok('every asset registered with a src carries an explicit version')

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
if (blockers.length) {
  console.log('')
  for (const b of blockers) console.log(`  TODO  ${b}`)
}
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

if (blockers.length) {
  console.log('')
  console.log('  ' + '!'.repeat(72))
  console.log(`  !!  DRAFT BUILD - NOT SUBMITTABLE. ${blockers.length} human step(s) outstanding.`)
  console.log('  !!  Fix them, then re-run without --draft before uploading to WordPress.org.')
  console.log('  !!  See wordpress-plugin/SUBMISSION.md.')
  console.log('  ' + '!'.repeat(72))
}
