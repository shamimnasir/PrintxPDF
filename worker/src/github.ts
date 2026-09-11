/**
 * Commits a set of files to GitHub in one move, using the Git Data API.
 *
 * The simpler Contents API writes one file per request, so publishing a post plus its cluster plus
 * the config would be three commits, three deploys, and a half-updated repository if the second
 * call failed. Blobs -> tree -> commit -> ref moves the branch once or not at all.
 *
 * The token is a Worker secret and never leaves this module.
 */
import { ApiError } from './http'

const API = 'https://api.github.com'
/** GitHub rejects requests with no user agent. */
const UA = 'printxpdf-admin'

export type FileWrite = { path: string; content: string }

export type CommitResult = { sha: string; url: string; branch: string; files: string[] }

export interface RepoRef {
  token: string
  owner: string
  repo: string
  branch: string
}

async function gh<T>(ref: RepoRef, method: 'GET' | 'POST' | 'PATCH', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/repos/${ref.owner}/${ref.repo}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${ref.token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': UA,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) {
    // A GitHub error body can quote the request, so only its message is surfaced, never the token.
    let message = `GitHub ${res.status}`
    try {
      const parsed = JSON.parse(text) as { message?: string }
      if (parsed.message) message = `GitHub: ${parsed.message}`
    } catch {
      /* keep the status-only message */
    }
    const code = res.status === 401 || res.status === 403 ? 'github_auth' : res.status === 409 ? 'github_conflict' : 'github_failed'
    throw new ApiError(res.status === 401 || res.status === 403 ? 500 : 502, code, message)
  }
  return JSON.parse(text) as T
}

/** UTF-8 safe base64: btoa alone throws on any character above U+00FF. */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/**
 * Writes `files` onto the tip of `branch` as a single commit and returns it.
 *
 * `expectedHeadSha`, when given, makes this a compare-and-swap: if the branch moved since the
 * editor loaded its draft, the commit is refused rather than silently discarding whatever landed
 * in between.
 */
export async function commitFiles(
  ref: RepoRef,
  files: FileWrite[],
  message: string,
  expectedHeadSha?: string,
): Promise<CommitResult> {
  if (!files.length) throw new ApiError(400, 'nothing_to_commit', 'No files to publish')

  const head = await gh<{ object: { sha: string } }>(ref, 'GET', `/git/ref/heads/${encodeURIComponent(ref.branch)}`)
  const headSha = head.object.sha
  if (expectedHeadSha && expectedHeadSha !== headSha) {
    throw new ApiError(409, 'stale_draft', 'The repository moved since this draft was loaded. Reload the panel and publish again.')
  }

  const headCommit = await gh<{ tree: { sha: string } }>(ref, 'GET', `/git/commits/${headSha}`)

  const blobs = await Promise.all(
    files.map(async (f) => {
      const blob = await gh<{ sha: string }>(ref, 'POST', '/git/blobs', { content: toBase64(f.content), encoding: 'base64' })
      return { path: f.path, mode: '100644' as const, type: 'blob' as const, sha: blob.sha }
    }),
  )

  const tree = await gh<{ sha: string }>(ref, 'POST', '/git/trees', { base_tree: headCommit.tree.sha, tree: blobs })
  const commit = await gh<{ sha: string; html_url: string }>(ref, 'POST', '/git/commits', {
    message,
    tree: tree.sha,
    parents: [headSha],
  })
  await gh(ref, 'PATCH', `/git/refs/heads/${encodeURIComponent(ref.branch)}`, { sha: commit.sha })

  return { sha: commit.sha, url: commit.html_url, branch: ref.branch, files: files.map((f) => f.path) }
}

/** The current tip, so the editor can hold a baseline and detect a stale draft at publish time. */
export async function headSha(ref: RepoRef): Promise<string> {
  const head = await gh<{ object: { sha: string } }>(ref, 'GET', `/git/ref/heads/${encodeURIComponent(ref.branch)}`)
  return head.object.sha
}
