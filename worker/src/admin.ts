/**
 * The admin API: log in, then publish the site by committing to the repository.
 *
 * Two properties matter more than anything else here.
 *
 * 1. The GitHub token is a Worker secret. The browser holds a 12-hour session that can call these
 *    endpoints and nothing else, so a stolen session expires; a stolen token would not.
 *
 * 2. This module decides every path that gets written. The client sends content, never filenames,
 *    so an authenticated session still cannot reach .github/workflows or the source of the site.
 *    Combined with re-running the content rules here, a publish cannot break the build on purpose
 *    or by accident.
 */
import { ApiError, clientIp, enforceRateLimit, json, readJsonBody } from './http'
import { mintSession, verifySession, verifyPassword, storedHashProblem, SESSION_TTL_SEC, now } from './adminAuth'
import { commitFiles, headSha, type FileWrite, type RepoRef } from './github'
import { validateContent, formatIssues } from '../../src/content/validate'
import type { Cluster } from '../../src/content/types'

/** Secrets and vars this module needs. They are not in wrangler.jsonc, so they are declared here. */
type AdminEnv = Env & {
  ADMIN_PASSWORD_HASH?: string
  ADMIN_SECRET?: string
  GITHUB_TOKEN?: string
  GITHUB_OWNER?: string
  GITHUB_REPO?: string
  GITHUB_BRANCH?: string
}

/** A publish carries the whole content set, so cross-post rules can be checked. */
const MAX_PUBLISH_BYTES = 8 * 1024 * 1024
const LOCKOUT_AFTER = 10
const LOCKOUT_SEC = 15 * 60
const failKey = (ip: string) => `admin:fail:${ip}`
/** Moving this forward invalidates every outstanding session at once. */
const MIN_IAT_KEY = 'admin:minIat'

const CLUSTER_DIR = 'src/content/posts'
const CONFIG_PATH = 'public/site-config.json'
/** A cluster file name, and nothing that could climb out of the directory. */
const SAFE_NAME = /^[a-z0-9][a-z0-9-]{0,60}$/

function requireConfigured(env: AdminEnv): { secret: string; hash: string; repo: RepoRef } {
  const { ADMIN_SECRET, ADMIN_PASSWORD_HASH, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = env
  if (!ADMIN_SECRET || !ADMIN_PASSWORD_HASH) {
    throw new ApiError(503, 'admin_not_configured', 'Admin access is not configured on this deployment')
  }
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new ApiError(503, 'publishing_not_configured', 'Publishing is not configured on this deployment')
  }
  return {
    secret: ADMIN_SECRET,
    hash: ADMIN_PASSWORD_HASH,
    repo: { token: GITHUB_TOKEN, owner: GITHUB_OWNER, repo: GITHUB_REPO, branch: GITHUB_BRANCH || 'main' },
  }
}

async function minIat(env: AdminEnv): Promise<number> {
  const raw = await env.KV.get(MIN_IAT_KEY)
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

/** Every authenticated endpoint goes through here. Returns nothing useful; it throws or it passes. */
async function requireSession(req: Request, env: AdminEnv, secret: string): Promise<void> {
  const header = req.headers.get('authorization')
  const m = header ? /^Bearer\s+(\S+)$/i.exec(header.trim()) : null
  const claims = m ? await verifySession(secret, m[1], await minIat(env)) : null
  if (!claims) throw new ApiError(401, 'admin_unauthorized', 'Sign in again')
}

// ---------------------------------------------------------------- endpoints

export async function login(req: Request, env: AdminEnv): Promise<Response> {
  const { secret, hash } = requireConfigured(env)
  const ip = clientIp(req)
  await enforceRateLimit(env.RL_BILLING, `admin-login:${ip}`)

  const fails = Number((await env.KV.get(failKey(ip))) ?? '0')
  if (fails >= LOCKOUT_AFTER) {
    throw new ApiError(429, 'locked_out', 'Too many failed attempts. Try again later.', {}, { 'retry-after': String(LOCKOUT_SEC) })
  }

  // A hash this runtime cannot evaluate would otherwise fail inside the crypto call and reach the
  // client as a bare 500, which says nothing about what to do next.
  const problem = storedHashProblem(hash)
  if (problem) throw new ApiError(503, 'admin_password_hash_unsupported', problem)

  const body = await readJsonBody<{ password: string }>(req, 4096)
  const password = typeof body.password === 'string' ? body.password : ''
  if (!password || !(await verifyPassword(password, hash))) {
    await env.KV.put(failKey(ip), String(fails + 1), { expirationTtl: LOCKOUT_SEC })
    // One message for "no password" and "wrong password": a distinct reply is a probing oracle.
    throw new ApiError(401, 'bad_password', 'That password is not right')
  }

  await env.KV.delete(failKey(ip))
  const token = await mintSession(secret)
  return json({ token, expiresAt: now() + SESSION_TTL_SEC })
}

/** Confirms a session is still good and hands back the commit the draft should be based on. */
export async function me(req: Request, env: AdminEnv): Promise<Response> {
  const { secret, repo } = requireConfigured(env)
  await requireSession(req, env, secret)
  return json({ ok: true, branch: repo.branch, headSha: await headSha(repo) })
}

/** Invalidates every session, including this one. */
export async function signOutEverywhere(req: Request, env: AdminEnv): Promise<Response> {
  const { secret } = requireConfigured(env)
  await requireSession(req, env, secret)
  await env.KV.put(MIN_IAT_KEY, String(now()))
  return json({ ok: true })
}

type PublishBody = {
  message: string
  /** The full content set, keyed by cluster file name. Required when clusters change. */
  clusters: Record<string, Cluster>
  /** Tool slugs the content may reference, so link rules can be checked. */
  toolSlugs: string[]
  /** The whole site config, published verbatim to public/site-config.json. */
  config: unknown
  /** The commit the editor loaded. Refuses the publish if the branch has moved since. */
  baseSha: string
}

export async function publish(req: Request, env: AdminEnv): Promise<Response> {
  const { secret, repo } = requireConfigured(env)
  await requireSession(req, env, secret)
  await enforceRateLimit(env.RL_BILLING, `admin-publish:${clientIp(req)}`)

  const body = await readJsonBody<PublishBody>(req, MAX_PUBLISH_BYTES)
  const message = typeof body.message === 'string' && body.message.trim() ? body.message.trim().slice(0, 500) : 'Update site from the admin panel'

  const files: FileWrite[] = []

  if (body.clusters && typeof body.clusters === 'object') {
    const names = Object.keys(body.clusters)
    for (const name of names) {
      if (!SAFE_NAME.test(name)) throw new ApiError(400, 'bad_cluster_name', `"${name}" is not a valid cluster file name`)
    }
    const clusters = names.map((n) => body.clusters![n])
    const toolSlugs = Array.isArray(body.toolSlugs) ? body.toolSlugs.filter((t) => typeof t === 'string') : []

    // The browser checked these too, so the writer saw them early. This is the check that counts:
    // a client-side gate protects nothing, and this one stands between a draft and the repository.
    const today = new Date().toISOString().slice(0, 10)
    const issues = validateContent(clusters, toolSlugs, today)
    if (issues.length) {
      throw new ApiError(422, 'content_invalid', 'The content does not pass its own rules, so it was not published', {
        issues: issues.slice(0, 50),
        detail: formatIssues(issues.slice(0, 50)),
      })
    }

    for (const name of names) {
      files.push({ path: `${CLUSTER_DIR}/${name}.json`, content: `${JSON.stringify(body.clusters[name], null, 2)}\n` })
    }
  }

  if (body.config && typeof body.config === 'object') {
    files.push({ path: CONFIG_PATH, content: `${JSON.stringify(body.config, null, 2)}\n` })
  }

  if (!files.length) throw new ApiError(400, 'nothing_to_publish', 'Nothing changed, so there is nothing to publish')

  const result = await commitFiles(repo, files, message, typeof body.baseSha === 'string' ? body.baseSha : undefined)
  return json(result)
}
