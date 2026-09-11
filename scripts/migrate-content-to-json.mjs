// One-time migration: the 23 cluster files are pure data with a type-only import, so they convert
// to JSON mechanically. JSON is what the admin editor can write back safely; generating TypeScript
// source from a form means escaping backticks and ${ inside code samples, and every one of those
// is a chance to emit a file that will not compile.
//
// Proof of losslessness lives outside this script: build before and after, and the prerendered
// HTML must hash identically.
//
//   node scripts/migrate-content-to-json.mjs
import { build } from 'esbuild'
import { readdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const POSTS = path.join(ROOT, 'src/content/posts')

/** Evaluate a data module without writing it to disk. */
async function loadCluster(file) {
  const out = await build({
    entryPoints: [file],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
  })
  const code = out.outputFiles[0].text
  const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
  const exports = Object.values(mod)
  if (exports.length !== 1) throw new Error(`${path.basename(file)} exports ${exports.length} things, expected 1`)
  return exports[0]
}

const files = (await readdir(POSTS)).filter((f) => f.endsWith('.ts')).sort()
if (!files.length) {
  console.log('Nothing to migrate; posts are already JSON.')
  process.exit(0)
}

let posts = 0
for (const f of files) {
  const src = path.join(POSTS, f)
  const cluster = await loadCluster(src)
  const json = path.join(POSTS, f.replace(/\.ts$/, '.json'))
  // two-space JSON with a trailing newline, so a one-field edit is a one-line diff in review
  await writeFile(json, `${JSON.stringify(cluster, null, 2)}\n`)
  await rm(src)
  posts += cluster.posts.length
  console.log(`  ${f} -> ${path.basename(json)}  (${cluster.posts.length} posts)`)
}
console.log(`\nMigrated ${files.length} clusters, ${posts} posts. Now update src/content/index.ts to import the JSON.`)
