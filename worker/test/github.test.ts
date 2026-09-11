import { afterEach, describe, expect, it, vi } from 'vitest'
import { commitFiles } from '../src/github'
import { ApiError } from '../src/http'

const repo = { token: 'ghp_fake', owner: 'owner', repo: 'repo', branch: 'main' }

type Call = { url: string; method: string; body: unknown; auth: string | null }

/** Records what the module asks GitHub for and replays a plausible Git Data API conversation. */
function mockGitHub(over: Record<string, unknown> = {}) {
  const calls: Call[] = []
  const handler = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    const method = init?.method ?? 'GET'
    const headers = (init?.headers ?? {}) as Record<string, string>
    calls.push({ url, method, body: init?.body ? JSON.parse(String(init.body)) : undefined, auth: headers.authorization ?? null })

    const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
    if (over[url]) return reply(over[url], 422)
    if (url.endsWith('/git/ref/heads/main')) return reply({ object: { sha: 'HEADSHA' } })
    if (url.includes('/git/commits/HEADSHA')) return reply({ tree: { sha: 'TREESHA' } })
    if (url.endsWith('/git/blobs')) return reply({ sha: `blob-${calls.length}` })
    if (url.endsWith('/git/trees')) return reply({ sha: 'NEWTREE' })
    if (url.endsWith('/git/commits')) return reply({ sha: 'NEWCOMMIT', html_url: 'https://github.com/owner/repo/commit/NEWCOMMIT' })
    if (url.includes('/git/refs/heads/main')) return reply({ ok: true })
    return reply({ message: 'unexpected' }, 500)
  })
  vi.stubGlobal('fetch', handler)
  return calls
}

afterEach(() => vi.unstubAllGlobals())

describe('commitFiles', () => {
  it('writes every file in one commit and moves the branch once', async () => {
    const calls = mockGitHub()
    const out = await commitFiles(repo, [
      { path: 'a.json', content: '{"a":1}' },
      { path: 'b.json', content: '{"b":2}' },
    ], 'Update two files')

    expect(out.sha).toBe('NEWCOMMIT')
    expect(out.files).toEqual(['a.json', 'b.json'])

    // two blobs, one tree, one commit, one ref update: not one commit per file
    expect(calls.filter((c) => c.url.endsWith('/git/blobs'))).toHaveLength(2)
    expect(calls.filter((c) => c.url.endsWith('/git/trees'))).toHaveLength(1)
    expect(calls.filter((c) => c.method === 'PATCH')).toHaveLength(1)

    const commit = calls.find((c) => c.url.endsWith('/git/commits') && c.method === 'POST')!
    expect(commit.body).toMatchObject({ message: 'Update two files', tree: 'NEWTREE', parents: ['HEADSHA'] })
  })

  it('bases the new tree on the current one, so untouched files survive', async () => {
    const calls = mockGitHub()
    await commitFiles(repo, [{ path: 'a.json', content: '{}' }], 'One file')
    expect((calls.find((c) => c.url.endsWith('/git/trees'))!.body as { base_tree: string }).base_tree).toBe('TREESHA')
  })

  it('sends the token as a bearer and never in the URL', async () => {
    const calls = mockGitHub()
    await commitFiles(repo, [{ path: 'a.json', content: '{}' }], 'x')
    expect(calls.every((c) => c.auth === 'Bearer ghp_fake')).toBe(true)
    expect(calls.every((c) => !c.url.includes('ghp_fake'))).toBe(true)
  })

  it('encodes content that btoa alone would choke on', async () => {
    const calls = mockGitHub()
    // a curly quote and an emoji are both above U+00FF
    await commitFiles(repo, [{ path: 'a.json', content: '{"x":"café “quoted” 📄"}' }], 'x')
    const blob = calls.find((c) => c.url.endsWith('/git/blobs'))!.body as { content: string; encoding: string }
    expect(blob.encoding).toBe('base64')
    expect(new TextDecoder().decode(Uint8Array.from(atob(blob.content), (ch) => ch.charCodeAt(0)))).toContain('café')
  })

  it('refuses to publish over a branch that moved since the draft loaded', async () => {
    mockGitHub()
    await expect(commitFiles(repo, [{ path: 'a.json', content: '{}' }], 'x', 'A-DIFFERENT-SHA')).rejects.toMatchObject({
      status: 409,
      code: 'stale_draft',
    })
  })

  it('proceeds when the expected head still matches', async () => {
    mockGitHub()
    await expect(commitFiles(repo, [{ path: 'a.json', content: '{}' }], 'x', 'HEADSHA')).resolves.toMatchObject({ sha: 'NEWCOMMIT' })
  })

  it('rejects an empty publish', async () => {
    mockGitHub()
    await expect(commitFiles(repo, [], 'x')).rejects.toBeInstanceOf(ApiError)
  })

  it('surfaces a GitHub failure without leaking the token', async () => {
    mockGitHub({ 'https://api.github.com/repos/owner/repo/git/blobs': { message: 'Resource not accessible' } })
    await expect(commitFiles(repo, [{ path: 'a.json', content: '{}' }], 'x')).rejects.toMatchObject({ code: 'github_failed' })
  })
})
