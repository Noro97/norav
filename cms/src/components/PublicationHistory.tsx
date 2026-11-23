'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { Modal } from './Modal'
import { type WorkspaceView } from './ViewSwitcher'
import { FeedbackBanner, Workspace, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'

interface Publication {
  version: number
  publishedAt: string
  note: string | null
  checksum: string
  restoredFrom: number | null
  author: string | null
}

interface ChangeLine {
  path: string
  before: string | null
  after: string | null
}

interface Plan {
  version: number
  live: number
  unchanged: boolean
  problems: { path: string; message: string }[]
  areas: { label: string; kind: 'added' | 'removed' | 'changed'; count: number; sample: ChangeLine[] }[]
}

type Drafts = 'match' | 'differ' | 'blocked'

const REBUILD: Record<string, string> = {
  triggered: 'The site is rebuilding, so its first paint catches up in a few minutes.',
  not_configured: 'The site picks it up on its next page load.',
  failed: "The site's rebuild didn't start. It picks the content up on its next page load.",
}

/**
 * Every version the site has shown, and a way back to any of them.
 *
 * A restore publishes the old content again as a new version, so the list only
 * grows, and undoing a restore is one more restore.
 */
export function PublicationHistory({
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
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}) {
  const [publications, setPublications] = useState<Publication[] | null>(null)
  const [drafts, setDrafts] = useState<Drafts>('match')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [restoring, setRestoring] = useState<number | null>(null)

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/publications')
    if (!response.ok) {
      setFeedback({ kind: 'err', message: 'Could not load the history.' })
      return
    }
    const body = await response.json()
    setPublications(body.data.publications)
    setDrafts(body.data.drafts)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const live = publications?.[0]

  return (
    <Workspace
      subtitle="history"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={restoring !== null}
    >
      <>
        <h1>History</h1>
        <p className="subtle">
          Every publish is kept. Restoring one publishes its content again, as a new version. Nothing is
          rewritten, so a restore can be undone by restoring the version it replaced.
        </p>

        {live && <DraftsNote live={live} drafts={drafts} />}
        <FeedbackBanner feedback={feedback} />

        {!publications ? (
          <p className="subtle">Loading…</p>
        ) : publications.length === 0 ? (
          <p className="subtle">Nothing has been published yet.</p>
        ) : (
          <div className="table-scroll">
            <table className="rows">
              <thead>
                <tr>
                  <th scope="col" className="num">#</th>
                  <th scope="col">Published</th>
                  <th scope="col">By</th>
                  <th scope="col">Note</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {publications.map((publication) => (
                  <tr key={publication.version}>
                    <td className="num">{publication.version}</td>
                    <td>
                      {new Date(publication.publishedAt).toLocaleString()}
                      {publication === live && <span className="pill pill-on history-pill">live</span>}
                      {publication.restoredFrom !== null && (
                        <span className="pill pill-off history-pill">restore of {publication.restoredFrom}</span>
                      )}
                    </td>
                    <td className="mono">{publication.author ?? 'a script'}</td>
                    <td className="history-note">{publication.note ?? <span className="subtle">—</span>}</td>
                    <td className="row-actions">
                      {publication !== live && (
                        <button
                          type="button"
                          className="ghost"
                          disabled={restoring !== null}
                          onClick={() => {
                            setFeedback(null)
                            setRestoring(publication.version)
                          }}
                        >
                          Restore…
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {restoring !== null && (
          <RestoreDialog
            version={restoring}
            onClose={() => setRestoring(null)}
            onRestored={async (message) => {
              setRestoring(null)
              setFeedback({ kind: 'ok', message })
              await load()
            }}
          />
        )}
      </>
    </Workspace>
  )
}

/** The one thing about the drafts this screen has to say: whether publishing would change the site. */
function DraftsNote({ live, drafts }: { live: Publication; drafts: Drafts }) {
  if (drafts === 'match') return <p className="subtle">The drafts match the live site.</p>
  if (drafts === 'blocked') {
    return <div className="status warn">The drafts can&rsquo;t be published as they are. Publish from an editor to see why.</div>
  }
  if (live.restoredFrom !== null) {
    return (
      <div className="status warn">
        The site shows version {live.version}, a restore of version {live.restoredFrom}. The drafts weren&rsquo;t
        restored, so publishing puts them live in its place. Change them first if they should match.
      </div>
    )
  }
  return <p className="subtle">The drafts hold changes that aren&rsquo;t live yet.</p>
}

function RestoreDialog({
  version,
  onClose,
  onRestored,
}: {
  version: number
  onClose: () => void
  onRestored: (message: string) => Promise<void>
}) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Feedback | null>(null)

  const look = useCallback(async () => {
    const response = await fetch(`/api/admin/publications/${version}`)
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      setError({ kind: 'err', message: body?.error?.message ?? 'Could not compare this version.' })
      return
    }
    setPlan(body.data)
  }, [version])

  useEffect(() => {
    void look()
  }, [look])

  async function restore() {
    if (!plan) return
    setBusy(true)
    setError(null)
    const response = await fetch(`/api/admin/publications/${version}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ live: plan.live, ...(note.trim() ? { note: note.trim() } : {}) }),
    })
    const body = await response.json().catch(() => null)
    setBusy(false)

    if (!response.ok) {
      setError({
        kind: 'err',
        message: body?.error?.message ?? 'The restore did not go through.',
        details: body?.error?.fields?.map((f: { path: string; message: string }) => `${f.path} — ${f.message}`),
      })
      // Something was published in the meantime: show what restoring would do now.
      if (response.status === 409) await look()
      return
    }
    if (body.data.unchanged) {
      await onRestored(`The site already shows version ${version}'s content. Nothing was published.`)
      return
    }
    await onRestored(
      `Version ${version} is live again, as version ${body.data.version}. ${REBUILD[body.data.rebuild] ?? ''}`.trim(),
    )
  }

  const blocked = !plan || plan.problems.length > 0 || plan.unchanged

  return (
    <Modal
      title={`Restore version ${version}`}
      wide
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <button type="button" className="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={restore} disabled={busy || blocked}>
            {busy ? 'Restoring…' : 'Restore'}
          </button>
        </>
      }
    >
      <FeedbackBanner feedback={error} />

      {!plan ? (
        !error && <p className="subtle">Comparing with the live site…</p>
      ) : plan.problems.length > 0 ? (
        <div className="status err">
          Version {version} can&rsquo;t go live again as it is. It would put a broken page on the site:
          <ul>
            {plan.problems.map((problem) => (
              <li key={`${problem.path}:${problem.message}`}>
                {problem.path} — {problem.message}
              </li>
            ))}
          </ul>
        </div>
      ) : plan.unchanged ? (
        <p className="subtle">The site already shows exactly this content. There is nothing to restore.</p>
      ) : (
        <>
          <p>
            This publishes version {version}&rsquo;s content again, as a new version. Compared with version {plan.live},
            which is live now:
          </p>
          <ul className="restore-areas">
            {plan.areas.map((area) => (
              <li key={area.label}>
                <strong>{area.label}</strong>{' '}
                <span className="subtle">
                  {area.kind === 'added'
                    ? 'comes back'
                    : area.kind === 'removed'
                      ? 'goes away'
                      : `${area.count} change${area.count === 1 ? '' : 's'}`}
                </span>
                {area.kind === 'changed' && (
                  <ul>
                    {area.sample.map((line) => (
                      <li key={line.path} className="restore-line">
                        <code>{line.path}</code>
                        <span className="restore-before">{line.before ?? '(nothing)'}</span>
                        <span aria-hidden="true">→</span>
                        <span className="sr-only">becomes</span>
                        <span>{line.after ?? '(nothing)'}</span>
                      </li>
                    ))}
                    {area.count > area.sample.length && (
                      <li className="subtle">
                        and {area.count - area.sample.length} more, counting every language
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <p className="subtle">
            Your drafts don&rsquo;t change. Publishing later puts them live in place of this restore, and the CMS
            asks before it does.
          </p>
          <label className="field">
            <span>Note</span>
            <input
              value={note}
              maxLength={200}
              placeholder={`Restored version ${version}`}
              onChange={(event) => setNote(event.target.value)}
              disabled={busy}
            />
          </label>
        </>
      )}
    </Modal>
  )
}
