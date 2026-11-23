'use client'

import { useCallback, useEffect, useState } from 'react'
import { SOURCE_LOCALE, type SerializedCollectionDefinition } from '@norav/content-schema'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, type Feedback } from './Workspace'
import { Modal } from './Modal'
import { MediaPicker } from './MediaPicker'
import { PostBodyEditor } from './PostBodyEditor'
import type { EnvironmentInfo } from '@/lib/environment'
import { mediaDisplaySrc, toMediaRef } from '@/lib/media-refs'
import { slugify, toEditorHtml } from '@/lib/post-html'
import type { PostSummary } from '@/app/api/admin/posts/route'
import type { PostDetail } from '@/app/api/admin/posts/[id]/route'
import { publishFromAdmin } from '@/lib/publish-client'

/**
 * Where posts are written.
 *
 * Separate from the page editor on purpose. A page is a stack of sections an
 * editor arranges; a post is one document with a date, written top to bottom.
 * What they share is underneath — the media library, the publish step, the
 * snapshot — so a post goes live with the same Publish as everything else.
 *
 * English is the copy that is written. A Russian translation can be added
 * later; until then the Russian site shows the English post.
 */
const LOCALE = SOURCE_LOCALE

interface Draft {
  title: string
  excerpt: string
  bodyHtml: string
  slug: string
  status: PostDetail['status']
  /** datetime-local value, in the browser's time zone. Empty = not yet. */
  date: string
  tags: string
  cover: string
  seoTitle: string
  seoDescription: string
}

function toDraft(post: PostDetail): Draft {
  const copy = post.translations[LOCALE]
  return {
    title: copy?.title ?? '',
    excerpt: copy?.excerpt ?? '',
    bodyHtml: toEditorHtml(copy?.bodyHtml ?? ''),
    slug: post.slug,
    status: post.status,
    date: post.publishedAt ? toLocalInput(post.publishedAt) : '',
    tags: post.tags.join(', '),
    cover: post.cover,
    seoTitle: copy?.seo?.title ?? '',
    seoDescription: copy?.seo?.description ?? '',
  }
}

function toLocalInput(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function dateLabel(post: PostSummary): string {
  if (post.status !== 'published' || !post.publishedAt) return post.status
  const date = new Date(post.publishedAt)
  const label = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return date > new Date() ? `scheduled ${label}` : label
}

export function PostsEditor({
  collections,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: {
  collections: SerializedCollectionDefinition[]
  userEmail: string
  environment?: EnvironmentInfo
  view: Extract<WorkspaceView, { kind: 'posts' }>
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}) {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [post, setPost] = useState<PostDetail | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<null | 'load' | 'save' | 'publish' | 'create' | 'delete'>('load')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [creating, setCreating] = useState<string | null>(null)
  const [pickingCover, setPickingCover] = useState(false)

  const loadList = useCallback(async () => {
    const response = await fetch('/api/admin/posts')
    const body = await response.json().catch(() => null)
    if (response.ok) setPosts(body.data.posts)
    return response.ok ? (body.data.posts as PostSummary[]) : []
  }, [])

  // The list, and whichever post the address names — or the newest.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      setBusy('load')
      const list = await loadList()
      const id = view.id ?? list[0]?.id
      if (!id) {
        if (!cancelled) {
          setPost(null)
          setDraft(null)
          setBusy(null)
        }
        return
      }
      const response = await fetch(`/api/admin/posts/${id}`)
      const body = await response.json().catch(() => null)
      if (cancelled) return
      if (response.ok) {
        setPost(body.data.post)
        setDraft(toDraft(body.data.post))
        setDirty(false)
      } else {
        setFeedback({ kind: 'err', message: body?.error?.message ?? 'Could not open that post.' })
      }
      setBusy(null)
    })()
    return () => {
      cancelled = true
    }
  }, [view.id, loadList])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
    setDirty(true)
    setFeedback(null)
  }

  /** `status` overrides the draft's — how Publish puts a draft post live. */
  async function save(status?: Draft['status']): Promise<boolean> {
    if (!post || !draft) return false
    setBusy('save')
    setFeedback(null)
    const response = await fetch(`/api/admin/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: post.version,
        slug: draft.slug,
        status: status ?? draft.status,
        publishedAt: draft.date ? new Date(draft.date).toISOString() : null,
        cover: draft.cover,
        tags: draft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        locale: LOCALE,
        title: draft.title,
        excerpt: draft.excerpt,
        bodyHtml: draft.bodyHtml,
        seo: { title: draft.seoTitle || undefined, description: draft.seoDescription || undefined },
      }),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)
    if (!response.ok) {
      setFeedback({
        kind: 'err',
        message: body?.error?.message ?? 'Save failed.',
        details: body?.error?.fields?.map((f: { path: string; message: string }) => `${f.path} — ${f.message}`),
      })
      return false
    }
    setPost(body.data.post)
    // The body keeps what the editor holds; only the fields the server may
    // have settled — the date a publish filled in — are taken back.
    setDraft((current) =>
      current
        ? {
            ...current,
            status: body.data.post.status,
            date: body.data.post.publishedAt ? toLocalInput(body.data.post.publishedAt) : '',
          }
        : current,
    )
    setDirty(false)
    await loadList()
    setFeedback({ kind: 'ok', message: 'Saved. Publish to put it on the site.' })
    return true
  }

  /**
   * Publish, from a post, means this post. The site-wide publish alone left a
   * draft post a draft — the site went out without it and nothing said why —
   * so a post that is not yet published is published first, after asking.
   */
  async function publish() {
    if (!draft) return
    if (draft.status !== 'published') {
      const when = draft.date && new Date(draft.date) > new Date() ? `on ${new Date(draft.date).toLocaleString()}` : 'now'
      if (!window.confirm(`Publish "${draft.title || 'this post'}"? It goes on the site ${when}.`)) return
      if (!(await save('published'))) return
    } else if (dirty && !(await save())) {
      return
    }
    setBusy('publish')
    const { ok, feedback } = await publishFromAdmin()
    setBusy(null)
    if (ok) await loadList()
    setFeedback(feedback)
  }

  async function create(title: string) {
    setBusy('create')
    const response = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)
    if (!response.ok) {
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'Could not start a post.' })
      return
    }
    setCreating(null)
    onViewChange({ kind: 'posts', id: body.data.id })
  }

  async function remove() {
    if (!post || !window.confirm(`Delete "${draft?.title || post.slug}"? It leaves the site with the next publish.`)) return
    setBusy('delete')
    const response = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
    setBusy(null)
    if (!response.ok) {
      setFeedback({ kind: 'err', message: 'Could not delete that post.' })
      return
    }
    onViewChange({ kind: 'posts' })
  }

  function open(id: string) {
    if (dirty && !window.confirm('Leave this post without saving?')) return
    onViewChange({ kind: 'posts', id })
  }

  const sidebar = (
    <div className="post-list">
      <p className="views-heading">Posts</p>
      {posts.map((item) => (
        <button
          key={item.id}
          type="button"
          className="view-item"
          aria-current={item.id === post?.id}
          disabled={busy !== null}
          onClick={() => open(item.id)}
        >
          <span className="view-name">{item.title || 'Untitled'}</span>
          <span className="view-meta">
            {item.changed && <em className="view-dot" title="Edited since the last publish" />}
            {dateLabel(item)}
          </span>
        </button>
      ))}
      <button
        type="button"
        className="view-item view-add"
        disabled={busy !== null}
        onClick={() => setCreating('')}
      >
        <span className="view-name">+ New post</span>
      </button>
    </div>
  )

  return (
    <Workspace
      subtitle="writing"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null && busy !== 'load'}
      sidebar={sidebar}
    >
      {busy === 'load' && !draft ? (
        <p className="subtle">Loading…</p>
      ) : !post || !draft ? (
        <>
          <h1>Posts</h1>
          <p className="subtle">
            Nothing written yet. A post gets its own page at /writing/&lt;address&gt; and a card in the
            Writing section.
          </p>
          <div className="toolbar">
            <button type="button" className="primary" onClick={() => setCreating('')}>
              New post
            </button>
          </div>
        </>
      ) : (
        <>
          <h1>{draft.title || 'Untitled'}</h1>
          <p className="subtle">/writing/{draft.slug}</p>

          <div className="toolbar">
            <span className="spacer" />
            <button type="button" className="ghost" onClick={remove} disabled={busy !== null}>
              Delete
            </button>
            <button type="button" className="ghost" onClick={() => void save()} disabled={busy !== null || !dirty}>
              {busy === 'save' ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="primary" onClick={() => void publish()} disabled={busy !== null}>
              {busy === 'publish' ? 'Publishing…' : draft.status === 'published' ? 'Publish' : 'Publish post'}
            </button>
          </div>

          <FeedbackBanner feedback={feedback} unsaved={dirty} />

          <div className="post-layout">
            <div className="post-main">
              <label className="field">
                <span>Title</span>
                <input
                  value={draft.title}
                  onChange={(event) => set('title', event.target.value)}
                  disabled={busy !== null}
                />
              </label>

              <label className="field">
                <span>Excerpt</span>
                <textarea
                  rows={2}
                  value={draft.excerpt}
                  onChange={(event) => set('excerpt', event.target.value)}
                  disabled={busy !== null}
                  placeholder="One or two sentences for the card in the Writing section."
                />
              </label>

              <div className="field">
                <span>Text</span>
                <PostBodyEditor
                  key={post.id}
                  initialHtml={draft.bodyHtml}
                  onChange={(html) => set('bodyHtml', html)}
                />
              </div>
            </div>

            <aside className="post-aside">
              <label className="field">
                <span>Status</span>
                <select
                  value={draft.status}
                  onChange={(event) => set('status', event.target.value as Draft['status'])}
                  disabled={busy !== null}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <small className="subtle">
                  {draft.status === 'published'
                    ? 'On the site from its date, once published.'
                    : 'Stays off the site. Publish post puts it on.'}
                </small>
              </label>

              <label className="field">
                <span>Date</span>
                <input
                  type="datetime-local"
                  value={draft.date}
                  onChange={(event) => set('date', event.target.value)}
                  disabled={busy !== null}
                />
                <small className="subtle">
                  Empty means the moment it is published. A later date waits for the first Publish
                  after it.
                </small>
              </label>

              <label className="field">
                <span>Address</span>
                <input
                  value={draft.slug}
                  onChange={(event) => set('slug', event.target.value)}
                  onBlur={() => set('slug', slugify(draft.slug) || draft.slug)}
                  spellCheck={false}
                  disabled={busy !== null}
                />
                <small className="subtle">/writing/{draft.slug}</small>
              </label>

              <label className="field">
                <span>Tags</span>
                <input
                  value={draft.tags}
                  onChange={(event) => set('tags', event.target.value)}
                  placeholder="pipelines, typescript"
                  disabled={busy !== null}
                />
              </label>

              <div className="field">
                <span>Cover</span>
                <div className="media-field">
                  {draft.cover ? <img src={mediaDisplaySrc(draft.cover)} alt="" /> : null}
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setPickingCover(true)}
                    disabled={busy !== null}
                  >
                    {draft.cover ? 'Change' : 'Choose'}
                  </button>
                  {draft.cover && (
                    <button type="button" className="ghost" onClick={() => set('cover', '')} disabled={busy !== null}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <fieldset className="field">
                <legend>Search listing</legend>
                <input
                  placeholder="Title — the post's own if empty"
                  maxLength={70}
                  value={draft.seoTitle}
                  onChange={(event) => set('seoTitle', event.target.value)}
                  disabled={busy !== null}
                />
                <small className="subtle">{draft.seoTitle.length}/70</small>
                <textarea
                  rows={3}
                  placeholder="Description — the excerpt if empty"
                  maxLength={200}
                  value={draft.seoDescription}
                  onChange={(event) => set('seoDescription', event.target.value)}
                  disabled={busy !== null}
                />
                <small className="subtle">{draft.seoDescription.length}/200</small>
              </fieldset>
            </aside>
          </div>
        </>
      )}

      {pickingCover && (
        <MediaPicker
          onClose={() => setPickingCover(false)}
          onSelect={(item) => {
            set('cover', toMediaRef(item.id))
            setPickingCover(false)
          }}
        />
      )}

      {creating !== null && (
        <Modal
          title="New post"
          onClose={() => setCreating(null)}
          footer={
            <>
              <button type="button" className="ghost" onClick={() => setCreating(null)} disabled={busy !== null}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => void create(creating)}
                disabled={busy !== null || !creating.trim()}
              >
                Start writing
              </button>
            </>
          }
        >
          <label className="field">
            <span>Title</span>
            <input
              autoFocus
              value={creating}
              onChange={(event) => setCreating(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && creating.trim()) void create(creating)
              }}
            />
            <small className="subtle">
              {creating.trim() ? `/writing/${slugify(creating) || 'post'}` : 'The address comes from it.'}
            </small>
          </label>
        </Modal>
      )}
    </Workspace>
  )
}
