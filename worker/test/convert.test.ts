/**
 * Worker-side conversion registry, plus the container's pure functions.
 *
 * The permission-flag / PDF/A-level / error-code mappings live in container/server.py
 * (Python is what runs them), so the last case here shells out to that file's unittest
 * suite. That keeps `npx vitest run` a single command covering both sides.
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CONTAINER_ERROR_CODES, KINDS, KIND_FIELDS, KIND_INPUT_EXTS, isKind } from '../src/kinds'

const here = dirname(fileURLToPath(import.meta.url))
const serverPy = readFileSync(resolve(here, '../container/server.py'), 'utf8')

/** Exactly what src/lib/api.ts sends. Kept literal so a rename on either side fails here. */
const CLIENT_KINDS = ['ppt-to-pdf', 'pdf-to-ppt', 'epub-to-pdf', 'mobi-to-pdf', 'protect-pdf', 'unlock-pdf', 'pdf-to-pdfa', 'ebook-converter']

describe('kind registry', () => {
  it('registers every kind the client can send', () => {
    expect([...KINDS].sort()).toEqual([...CLIENT_KINDS].sort())
    for (const k of CLIENT_KINDS) expect(isKind(k)).toBe(true)
  })

  it('rejects unknown kinds, including near-misses', () => {
    for (const k of ['protect', 'pdf-to-pdf', 'unlock', 'pdfa', '', 'ppt-to-pdf ']) expect(isKind(k)).toBe(false)
  })

  it('accepts only PDFs for the three new operations', () => {
    for (const k of ['protect-pdf', 'unlock-pdf', 'pdf-to-pdfa'] as const) {
      expect(KIND_INPUT_EXTS[k]).toEqual(['.pdf'])
    }
  })

  it('leaves the original kinds untouched', () => {
    expect(KIND_INPUT_EXTS['ppt-to-pdf']).toEqual(['.ppt', '.pptx', '.pps', '.ppsx', '.odp'])
    expect(KIND_INPUT_EXTS['mobi-to-pdf']).toEqual(['.mobi', '.azw', '.azw3', '.prc'])
    expect(KIND_FIELDS['ppt-to-pdf']).toBeUndefined()
  })

  it('has an extension list for every kind', () => {
    for (const k of KINDS) expect(KIND_INPUT_EXTS[k].length).toBeGreaterThan(0)
  })

  it('declares the extra multipart fields the client sends', () => {
    expect(KIND_FIELDS['protect-pdf']).toEqual(['password', 'ownerPassword', 'permissions'])
    expect(KIND_FIELDS['unlock-pdf']).toEqual(['password'])
    expect(KIND_FIELDS['pdf-to-pdfa']).toEqual(['level'])
  })
})

describe('container contract', () => {
  it('registers the same kinds in server.py', () => {
    for (const k of KINDS) expect(serverPy).toContain(`'${k}':`)
  })

  it('emits the three new error codes the client already understands', () => {
    for (const code of ['wrong_password', 'password_required', 'already_encrypted']) {
      expect(CONTAINER_ERROR_CODES).toContain(code)
      expect(serverPy).toContain(`'${code}'`)
    }
  })

  it('never puts a password on a command line: qpdf reads its argv from stdin', () => {
    expect(serverPy).toContain("run(['qpdf', '@-']")
    // the only qpdf invocations with inline argv are password-free probes
    const inlineQpdf = [...serverPy.matchAll(/run\(\['qpdf'[^\]]*\]/g)].map((m) => m[0])
    for (const call of inlineQpdf) {
      if (call.includes("'@-'")) continue
      expect(call).not.toMatch(/password/)
    }
  })

  it('scrubs secrets out of anything it logs or returns', () => {
    expect(serverPy).toMatch(/def scrub\(text, secrets\)/)
    expect(serverPy).toContain('secrets=(user, owner)')
    expect(serverPy).toContain('secrets=(pw,)')
  })
})

describe('container pure functions (python unittest)', () => {
  it('passes container/test_server.py', () => {
    // unittest reports on stderr; a non-zero status means a case failed.
    const r = spawnSync('python3', [resolve(here, '../container/test_server.py')], { encoding: 'utf8' })
    if (r.error) throw new Error(`could not run python3: ${r.error.message}`)
    expect(`${r.stderr}${r.stdout}`.trim(), `${r.stderr}\n${r.stdout}`).toMatch(/\nOK\b/)
    expect(r.status, r.stderr).toBe(0)
  })
})

describe('ebook converter', () => {
  it('is registered, accepts every ebook container and declares its target field', () => {
    expect(isKind('ebook-converter')).toBe(true)
    expect(KIND_INPUT_EXTS['ebook-converter']).toEqual(['.epub', '.mobi', '.azw', '.azw3', '.prc', '.fb2', '.txt'])
    expect(KIND_FIELDS['ebook-converter']).toEqual(['to'])
  })
})
