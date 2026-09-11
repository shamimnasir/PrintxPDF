// The blog section: every post grouped by cluster with its rule status, an editor for one post,
// and the publish button that turns a draft into a commit.
import { useEffect, useMemo, useState } from 'react'
import type { Post } from '../../content/types'
import { TOOLS } from '../../features/pdf/toolsMeta'
import { validateContent, LIMITS, type Issue } from '../../content/validate'
import { useToast } from '../../components/ui/Toast'
import { Card } from '../fields'
import { adminApi, describeAdminError, readSession } from '../adminApi'
import { exportConfig } from '../config'
import { PostEditor } from './PostEditor'
import { RulePanel } from './RulePanel'
import { addPost, blankPost, changedClusters, changedFiles, deletePost, discardDraft, draftClusters, findPost, onDraftChange, savePost } from './draft'

const TOOL_SLUGS = TOOLS.map((t) => t.slug)
const today = () => new Date().toISOString().slice(0, 10)

export function BlogAdmin() {
  const { toast } = useToast()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Post | null>(null)
  const [tick, setTick] = useState(0)
  const [busy, setBusy] = useState(false)
  const [signedIn, setSignedIn] = useState(() => !!readSession())

  useEffect(() => onDraftChange(() => setTick((n) => n + 1)), [])

  const clusters = useMemo(draftClusters, [tick])
  const changed = useMemo(changedFiles, [tick])
  const issues: Issue[] = useMemo(() => validateContent(clusters, TOOL_SLUGS, today()), [clusters])
  const issuesFor = (slug: string) => issues.filter((i) => i.where === slug)

  const open = (slug: string) => {
    const found = findPost(slug)
    if (!found) return
    setEditing(slug)
    setDraft(found.post)
  }

  const saveAndClose = () => {
    if (editing && draft) savePost(editing, draft)
    setEditing(null)
    setDraft(null)
  }

  const publish = async () => {
    if (!readSession()) {
      toast('Sign in to publish', 'error')
      setSignedIn(false)
      return
    }
    if (issues.length) {
      toast(`${issues.length} rule ${issues.length === 1 ? 'problem' : 'problems'} left to fix`, 'error')
      return
    }
    setBusy(true)
    try {
      const { headSha } = await adminApi.me()
      const result = await adminApi.publish({
        message: `Update ${changed.length} blog ${changed.length === 1 ? 'cluster' : 'clusters'} from the admin panel`,
        clusters: changedClusters(),
        toolSlugs: TOOL_SLUGS,
        config: JSON.parse(exportConfig()),
        baseSha: headSha,
      })
      discardDraft()
      toast(`Published ${result.sha.slice(0, 7)}. Vercel is rebuilding, usually about two minutes.`)
    } catch (e) {
      toast(describeAdminError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  if (editing && draft) {
    return (
      <PostEditor
        post={draft}
        onChange={setDraft}
        onDone={saveAndClose}
        onDelete={() => {
          if (!confirm(`Delete "${draft.title || draft.slug}"? It goes when you publish.`)) return
          deletePost(editing)
          setEditing(null)
          setDraft(null)
        }}
      />
    )
  }

  return (
    <>
      <Card
        title="Publish"
        desc="The panel keeps a draft in this browser. Publishing commits it to the repository and Vercel rebuilds, so the change reaches every visitor and every crawler."
      >
        {!signedIn && (
          <p className="alarm" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            Sign in on the Publish &amp; data tab before publishing.
          </p>
        )}
        <div className="row between" style={{ alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>
              {changed.length ? `${changed.length} ${changed.length === 1 ? 'cluster' : 'clusters'} changed` : 'Nothing changed yet'}
            </strong>
            {changed.length > 0 && (
              <div className="mono muted" style={{ fontSize: '0.72rem', marginTop: '0.25rem' }}>
                {changed.map((f) => `src/content/posts/${f}.json`).join(', ')}
              </div>
            )}
          </div>
          <div className="row" style={{ gap: '0.5rem' }}>
            {changed.length > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={() => confirm('Throw away every unpublished change?') && discardDraft()}>
                Discard draft
              </button>
            )}
            <button className="btn btn-acid" disabled={busy || !changed.length || issues.length > 0} onClick={publish}>
              {busy ? 'Publishing…' : 'Publish to the site'}
            </button>
          </div>
        </div>
        {issues.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <RulePanel issues={issues.slice(0, 12)} title="Across the blog" />
          </div>
        )}
      </Card>

      {clusters.map((c) => (
        <Card key={c.slug} title={`${c.icon} ${c.name}`} desc={`${c.posts.length} of ${LIMITS.postsPerClusterMax} posts · /blog/${c.slug}`}>
          <div className="stack" style={{ gap: '0.4rem' }}>
            {c.posts.map((p) => {
              const bad = issuesFor(p.slug)
              return (
                <button key={p.slug} className="file-row" style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }} onClick={() => open(p.slug)}>
                  <span className="name">{p.title}</span>
                  <span className="size" style={{ color: bad.length ? 'var(--alarm)' : undefined, fontWeight: bad.length ? 700 : undefined }}>
                    {bad.length ? `${bad.length} to fix` : 'ok'}
                  </span>
                </button>
              )
            })}
            {c.posts.length < LIMITS.postsPerClusterMax && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  const post = blankPost(c.slug)
                  post.slug = `new-post-${Date.now().toString(36)}`
                  post.title = 'New post'
                  addPost(c.slug, post)
                  open(post.slug)
                }}
              >
                + New post in {c.name}
              </button>
            )}
          </div>
        </Card>
      ))}
    </>
  )
}
