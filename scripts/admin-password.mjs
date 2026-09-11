// Turns an admin password into the hash the Worker stores, so the password itself is never typed
// into a config file, a commit, or this conversation.
//
//   node scripts/admin-password.mjs
//   (paste the output into: cd worker && npx wrangler secret put ADMIN_PASSWORD_HASH)
//
// The same PBKDF2 parameters as worker/src/adminAuth.ts. Change them in both or logins stop working.
import { webcrypto as crypto } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const ITERATIONS = 200_000

async function hash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, key, 256)
  const b64 = (b) => Buffer.from(b).toString('base64')
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(new Uint8Array(bits))}`
}

const rl = createInterface({ input: stdin, output: stdout })
const password = (await rl.question('New admin password (at least 12 characters): ')).trim()
rl.close()

if (password.length < 12) {
  console.error('\nToo short. This password can publish to your repository and deploy your site.')
  process.exit(1)
}

console.log('\nRun this, and paste the line below when it asks for the value:\n')
console.log('  cd worker && npx wrangler secret put ADMIN_PASSWORD_HASH\n')
console.log(await hash(password))
console.log('\nThe password itself is not stored anywhere. Keep it in your password manager.')
