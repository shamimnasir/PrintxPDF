import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const posts = fs.readdirSync(path.join(root, 'src/content/posts'))
  .filter((file) => file.endsWith('.json'))
  .flatMap((file) => JSON.parse(fs.readFileSync(path.join(root, 'src/content/posts', file))).posts)

const missing = []
for (const post of posts) {
  const body = post.body || []
  const rules = []
  if ((post.answer || '').trim().split(/\s+/).length < 25) rules.push('BLUF answer')
  if (!body.some((block) => block.t === 'steps')) rules.push('step-by-step block')
  if (!body.some((block) => block.t === 'table')) rules.push('comparison table')
  if (!body.some((block) => block.t === 'cta')) rules.push('tool CTA')
  if ((post.faqs || []).length < 4) rules.push('four FAQs')
  if ((post.relatedTools || []).length < 2) rules.push('two related tools')
  if (rules.length) missing.push({ slug: post.slug, rules })
}

console.log(`AEO audit: ${posts.length - missing.length}/${posts.length} pass all required content signals`)
for (const item of missing) console.log(`${item.slug}: ${item.rules.join(', ')}`)
process.exitCode = missing.length ? 1 : 0
