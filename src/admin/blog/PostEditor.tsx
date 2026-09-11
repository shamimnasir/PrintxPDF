// One post. Every field the rules care about has its limit shown while you type, so the rule
// panel at the bottom should already be green by the time you look at it.
import { useMemo, useState } from 'react'
import type { Intent, Post } from '../../content/types'
import { TOOLS } from '../../features/pdf/toolsMeta'
import { buildContext, validatePost, wordCount, bodyWordCount, LIMITS, STATIC_ROUTES, type Issue } from '../../content/validate'
import { Card, Field, ListEditor, Num, Text } from '../fields'
import { BlockEditor } from './BlockEditor'
import { Counter, RulePanel } from './RulePanel'
import { draftClusters, draftPosts } from './draft'

const INTENTS: Intent[] = ['howto', 'informational', 'comparison', 'troubleshooting', 'listicle']

/** Same set the rules build, so the editor and the Worker agree on what a valid link is. */
function useKnownRoutes() {
  return useMemo(() => {
    const clusters = draftClusters()
    const known = new Set(STATIC_ROUTES)
    TOOLS.forEach((t) => known.add(`/tools/${t.slug}`))
    clusters.forEach((c) => {
      known.add(`/blog/${c.slug}`)
      c.posts.forEach((p) => known.add(`/blog/${p.cluster}/${p.slug}`))
    })
    ;['chrome', 'firefox', 'safari', 'edge'].forEach((b) => known.add(`/extensions/${b}`))
    return known
  }, [])
}

export function PostEditor({ post, onChange, onDone, onDelete }: { post: Post; onChange: (p: Post) => void; onDone: () => void; onDelete?: () => void }) {
  const [tab, setTab] = useState<'meta' | 'body' | 'faqs' | 'links'>('meta')
  const known = useKnownRoutes()
  const clusters = useMemo(draftClusters, [])
  const allPosts = useMemo(draftPosts, [])

  const issues: Issue[] = useMemo(() => {
    const ctx = buildContext(clusters, TOOLS.map((t) => t.slug), new Date().toISOString().slice(0, 10))
    return validatePost(post, ctx, known)
  }, [post, clusters, known])

  const set = <K extends keyof Post>(k: K, v: Post[K]) => onChange({ ...post, [k]: v })

  return (
    <>
      <div className="row between" style={{ alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span className="eyebrow">Editing</span>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{post.title || 'Untitled post'}</h2>
        </div>
        <div className="row" style={{ gap: '0.4rem' }}>
          {onDelete && (
            <button className="btn btn-sm btn-ghost alarm" onClick={onDelete}>
              Delete
            </button>
          )}
          <button className="btn btn-sm" onClick={onDone}>
            ← All posts
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '1.25rem' }}>
        {(['meta', 'body', 'faqs', 'links'] as const).map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'meta' ? 'Details' : t === 'body' ? `Body (${bodyWordCount(post.body)} words)` : t === 'faqs' ? `FAQs (${post.faqs.length})` : 'Links'}
          </button>
        ))}
      </div>

      {tab === 'meta' && (
        <Card title="What this post is" desc="These become the title tag, the description in search results, and the answer Google and assistants quote.">
          <Text label="Title" value={post.title} onChange={(v) => set('title', v)} hint="The H1 on the page." />
          <Field label="Search title" hint="Shown in the browser tab and in search results.">
            <input className="input" value={post.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
            <div style={{ marginTop: '0.3rem' }}>
              <Counter label="Search title" value={post.metaTitle.length} max={LIMITS.metaTitleMax} />
            </div>
          </Field>
          <Field label="Search description" hint="The grey text under the title in search results.">
            <textarea className="textarea" style={{ minHeight: 70 }} value={post.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            <div style={{ marginTop: '0.3rem' }}>
              <Counter label="Search description" value={post.metaDescription.length} min={LIMITS.metaDescriptionMin} max={LIMITS.metaDescriptionMax} />
            </div>
          </Field>
          <Field label="Short answer" hint="Answers the question outright, before any preamble. Read aloud by assistants and marked up as speakable.">
            <textarea className="textarea" style={{ minHeight: 110 }} value={post.answer} onChange={(e) => set('answer', e.target.value)} />
            <div style={{ marginTop: '0.3rem' }}>
              <Counter label="Answer" value={wordCount(post.answer)} min={LIMITS.answerWordsMin} max={LIMITS.answerWordsMax} unit="words" />
            </div>
          </Field>

          <div className="grid grid-2" style={{ gap: '0 1rem' }}>
            <Field label="Web address" hint="The last part of the URL. Changing it breaks existing links.">
              <input className="input mono" style={{ fontSize: '0.85rem' }} value={post.slug} onChange={(e) => set('slug', e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
            </Field>
            <Field label="Kind of post" hint="A how-to must contain a Steps block; that is what becomes HowTo data for Google.">
              <select className="input" value={post.intent} onChange={(e) => set('intent', e.target.value as Intent)}>
                {INTENTS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Published">
              <input className="input" type="date" value={post.published} onChange={(e) => set('published', e.target.value)} />
            </Field>
            <Field label="Updated">
              <input className="input" type="date" value={post.updated} onChange={(e) => set('updated', e.target.value)} />
            </Field>
          </div>
          <Num label="Reading time (minutes)" value={post.readMinutes} min={1} max={60} onChange={(v) => set('readMinutes', v)} />

          <Text label="Main keyword" value={post.primaryKeyword} onChange={(v) => set('primaryKeyword', v)} />
          <ListEditor label={`Other keywords (${post.secondaryKeywords.length}, needs ${LIMITS.secondaryKeywordsMin})`} items={post.secondaryKeywords} onChange={(v) => set('secondaryKeywords', v)} />
          <ListEditor
            label={`Named things (${post.entities.length}, needs ${LIMITS.entitiesMin})`}
            items={post.entities}
            onChange={(v) => set('entities', v)}
            hint="Real, nameable things this post is about: formats, standards, apps, laws. Search engines use them to place the page."
          />
        </Card>
      )}

      {tab === 'body' && (
        <Card title="Body" desc={`Every block counts toward the ${LIMITS.bodyWordsMin}-word floor, including lists, steps and tables.`}>
          <div style={{ marginBottom: '0.9rem' }}>
            <Counter label="Body" value={bodyWordCount(post.body)} min={LIMITS.bodyWordsMin} unit="words" />
          </div>
          <BlockEditor body={post.body} onChange={(b) => set('body', b)} />
        </Card>
      )}

      {tab === 'faqs' && (
        <Card title="Questions" desc="Rendered on the page and published as FAQ data, which is what can win the expandable results in Google.">
          <div className="stack" style={{ gap: '0.75rem' }}>
            {post.faqs.map((f, i) => (
              <div key={i} className="card card-flat" style={{ padding: '0.8rem' }}>
                <div className="row" style={{ gap: '0.4rem', flexWrap: 'nowrap', marginBottom: '0.4rem' }}>
                  <input className="input" placeholder="Question" value={f.q} onChange={(e) => set('faqs', post.faqs.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)))} />
                  <button className="icon-btn" onClick={() => set('faqs', post.faqs.filter((_, k) => k !== i))} aria-label="Remove question">
                    ×
                  </button>
                </div>
                <textarea className="textarea" style={{ minHeight: 70 }} placeholder="Answer" value={f.a} onChange={(e) => set('faqs', post.faqs.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)))} />
              </div>
            ))}
            <button className="btn btn-sm" onClick={() => set('faqs', [...post.faqs, { q: '', a: '' }])}>
              + Question
            </button>
            <Counter label="FAQs" value={post.faqs.length} min={LIMITS.faqsMin} unit="questions" />
          </div>
        </Card>
      )}

      {tab === 'links' && (
        <Card title="Related" desc="Both are chosen from what exists, so a link here can never point at a page that is not there.">
          <Field label="Tools this post is about">
            <div className="stack" style={{ gap: '0.3rem', maxHeight: 260, overflowY: 'auto' }}>
              {TOOLS.map((t) => (
                <label key={t.slug} className="check">
                  <input
                    type="checkbox"
                    checked={post.relatedTools.includes(t.slug)}
                    onChange={(e) => set('relatedTools', e.target.checked ? [...post.relatedTools, t.slug] : post.relatedTools.filter((x) => x !== t.slug))}
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Other posts to link to">
            <div className="stack" style={{ gap: '0.3rem', maxHeight: 260, overflowY: 'auto' }}>
              {allPosts
                .filter((p) => p.slug !== post.slug)
                .map((p) => (
                  <label key={p.slug} className="check">
                    <input
                      type="checkbox"
                      checked={post.relatedPosts.includes(p.slug)}
                      onChange={(e) => set('relatedPosts', e.target.checked ? [...post.relatedPosts, p.slug] : post.relatedPosts.filter((x) => x !== p.slug))}
                    />
                    <span style={{ fontSize: '0.85rem' }}>{p.title}</span>
                  </label>
                ))}
            </div>
          </Field>
        </Card>
      )}

      <div style={{ position: 'sticky', bottom: 0, paddingTop: '0.5rem', background: 'var(--bg)' }}>
        <RulePanel issues={issues} title="This post" />
      </div>
    </>
  )
}
