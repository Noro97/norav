'use client'

import { useEffect, useState } from 'react'
import { mergeLocale, type Locale } from '@norav/content-schema'
import { Modal } from './Modal'
import { diffPublications } from '@/lib/publish-diff'

interface Revision {
  id: string
  content: Record<string, unknown>
  replacedAt: string
  replacedBy: string | null
}

const SHOWN = 120
const LINES = 6

const shown = (value: unknown) => {
  if (value === undefined) return '(nothing)'
  if (value === '') return '(empty)'
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  return text.length > SHOWN ? `${text.slice(0, SHOWN)}…` : text
}

/**
 * A section's earlier texts in the language on screen, each compared with what
 * the form holds now.
 *
 * Choosing one only fills the form. The Save button does the rest, so an old
 * text that no longer fits the section's fields is refused like any other edit,
 * and the text it replaces becomes a revision in turn.
 */
export function BlockHistory({
  blockId,
  label,
  locale,
  sourceLocale,
  source,
  current,
  onUse,
  onClose,
}: {
  blockId: string
  label: string
  locale: Locale
  sourceLocale: Locale
  /** The source-language text, which a translation is laid over. */
  source: Record<string, unknown>
  current: Record<string, unknown>
  onUse: (content: Record<string, unknown>, replacedAt: string) => void
  onClose: () => void
}) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const response = await fetch(`/api/admin/blocks/${blockId}/revisions?locale=${locale}`)
      const body = await response.json().catch(() => null)
      if (cancelled) return
      if (!response.ok) setError(body?.error?.message ?? 'Could not load the earlier versions.')
      else setRevisions(body.data.revisions)
    })()
    return () => {
      cancelled = true
    }
  }, [blockId, locale])

  // A translation is stored as the fields it owns. The form shows it laid over
  // the source, so that's what it's compared with and what goes back in.
  const resolved = (revision: Revision) =>
    locale === sourceLocale
      ? revision.content
      : (mergeLocale(source, revision.content) as Record<string, unknown>)

  return (
    <Modal title={`Earlier versions · ${label} · ${locale.toUpperCase()}`} wide onClose={onClose}>
      {error && <div className="status err">{error}</div>}
      {!revisions ? (
        !error && <p className="subtle">Loading…</p>
      ) : revisions.length === 0 ? (
        <p className="subtle">This section has no earlier {locale.toUpperCase()} text. Each save keeps the one it replaces.</p>
      ) : (
        <ol className="revision-list">
          {revisions.map((revision) => {
            const content = resolved(revision)
            const changes = diffPublications(current, content)
            return (
              <li key={revision.id}>
                <div className="revision-head">
                  <span>
                    Until {new Date(revision.replacedAt).toLocaleString()}
                    {revision.replacedBy && <span className="subtle"> · replaced by {revision.replacedBy}</span>}
                  </span>
                  <button
                    type="button"
                    className="ghost"
                    disabled={changes.length === 0}
                    onClick={() => onUse(content, revision.replacedAt)}
                  >
                    {changes.length === 0 ? 'Same as the form' : 'Put in the form'}
                  </button>
                </div>
                {changes.length > 0 && (
                  <ul>
                    {changes.slice(0, LINES).map((change) => (
                      <li key={change.path} className="restore-line">
                        <code>{change.path || '(all of it)'}</code>
                        <span className="restore-before">{shown(change.before)}</span>
                        <span aria-hidden="true">→</span>
                        <span className="sr-only">becomes</span>
                        <span>{shown(change.after)}</span>
                      </li>
                    ))}
                    {changes.length > LINES && <li className="subtle">and {changes.length - LINES} more</li>}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </Modal>
  )
}
