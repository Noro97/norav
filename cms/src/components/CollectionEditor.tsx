'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale, SerializedCollectionDefinition } from '@norav/content-schema'
import { getAtPath, mergeLocale, pickLocalized, setAtPath } from '@norav/content-schema'
import { BlockForm, type FieldSource } from './BlockForm'
import { ViewSwitcher, type WorkspaceView } from './ViewSwitcher'
import { WorkspaceFooter } from './WorkspaceFooter'
import type { EnvironmentInfo } from '@/lib/environment'

export interface CollectionEntry {
  id: string
  slug: string
  is_visible: boolean
  data: Record<string, unknown>
  version: number
  translations: Record<string, { data: Record<string, unknown>; status: string }>
}

interface Draft {
  version: number
  isVisible: boolean
  slug: string
  data: Record<string, unknown>
  content: Record<Locale, Record<string, unknown>>
}

type Feedback = { kind: 'ok' | 'err' | 'warn'; message: string; details?: string[] } | null

function buildDrafts(
  entries: CollectionEntry[],
  definition: SerializedCollectionDefinition,
  locales: readonly Locale[],
  sourceLocale: Locale,
): Record<string, Draft> {
  const drafts: Record<string, Draft> = {}

  for (const entry of entries) {
    const fallback = (definition.defaults.content ?? {}) as Record<string, unknown>
    const source = entry.translations[sourceLocale]?.data ?? fallback
    const content = {} as Record<Locale, Record<string, unknown>>

    for (const locale of locales) {
      content[locale] =
        locale === sourceLocale
          ? source
          : (mergeLocale(source, entry.translations[locale]?.data) as Record<string, unknown>)
    }

    drafts[entry.id] = {
      version: entry.version,
      isVisible: entry.is_visible,
      slug: entry.slug,
      data: { ...(definition.defaults.data as object), ...entry.data },
      content,
    }
  }

  return drafts
}

function toFormErrors(
  fields: { path: string; message: string }[] | undefined,
  locale: Locale,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields ?? []) {
    const translationPrefix = `translations.${locale}.`
    if (field.path.startsWith(translationPrefix)) {
      errors[field.path.slice(translationPrefix.length)] = field.message
    } else if (field.path.startsWith('data.')) {
      errors[field.path.slice('data.'.length)] = field.message
    }
  }
  return errors
}

interface CollectionEditorProps {
  definition: SerializedCollectionDefinition
  collections: SerializedCollectionDefinition[]
  locales: readonly Locale[]
  sourceLocale: Locale
  userEmail: string
  environment?: EnvironmentInfo
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}

export function CollectionEditor({
  definition,
  collections,
  locales,
  sourceLocale,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: CollectionEditorProps) {
  const [entries, setEntries] = useState<CollectionEntry[]>([])
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [selectedId, setSelectedId] = useState('')
  const [locale, setLocale] = useState<Locale>(sourceLocale)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<'load' | 'save' | 'publish' | 'add' | 'remove' | 'move' | null>('load')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const load = useCallback(
    async (selectId?: string) => {
      const response = await fetch(`/api/admin/entries?collection=${definition.key}`)
      if (!response.ok) {
        setFeedback({ kind: 'err', message: 'Could not load this collection.' })
        setBusy(null)
        return
      }
      const body = await response.json()
      const next = body.data.entries as CollectionEntry[]

      setEntries(next)
      setDrafts(buildDrafts(next, definition, locales, sourceLocale))
      setDirty({})
      setSelectedId((current) =>
        selectId ?? (next.some((entry) => entry.id === current) ? current : (next[0]?.id ?? '')),
      )
      setBusy(null)
    },
    [definition, locales, sourceLocale],
  )

  useEffect(() => {
    setBusy('load')
    void load()
  }, [load])

  const selected = entries.find((entry) => entry.id === selectedId)
  const draft = selectedId ? drafts[selectedId] : undefined

  /**
   * Reads the draft rather than the saved row, so a row relabels itself while
   * it is being typed — a list of blank rows is unusable.
   */
  const title = (entry: CollectionEntry) => {
    const draftContent = drafts[entry.id]?.content[sourceLocale]
    const saved = entry.translations[sourceLocale]?.data
    const value = getAtPath(draftContent ?? saved ?? {}, definition.titleField)
    return String(value || 'Untitled')
  }

  function handleChange(source: FieldSource, path: string, value: unknown) {
    if (!selectedId) return
    setDrafts((current) => {
      const existing = current[selectedId]
      if (!existing) return current
      const next: Draft =
        source === 'data'
          ? { ...existing, data: setAtPath(existing.data, path, value) }
          : {
              ...existing,
              content: {
                ...existing.content,
                [locale]: setAtPath(existing.content[locale] ?? {}, path, value),
              },
            }
      return { ...current, [selectedId]: next }
    })
    setDirty((current) => ({ ...current, [selectedId]: true }))
  }

  async function structural(
    action: 'add' | 'remove' | 'move',
    request: () => Promise<Response>,
    selectAfter?: (body: unknown) => string | undefined,
  ) {
    setBusy(action)
    setFeedback(null)

    const response = await request()
    const body = await response.json().catch(() => null)

    if (!response.ok) {
      setBusy(null)
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'That did not work.' })
      return
    }

    await load(selectAfter?.(body))
    setFeedback({ kind: 'ok', message: 'Collection updated. Publish to put it live.' })
  }

  const move = (id: string, delta: number) => {
    const index = entries.findIndex((entry) => entry.id === id)
    const target = index + delta
    if (index === -1 || target < 0 || target >= entries.length) return

    const order = entries.map((entry) => entry.id)
    const [moved] = order.splice(index, 1)
    if (moved) order.splice(target, 0, moved)

    void structural('move', () =>
      fetch('/api/admin/entries/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: definition.key, order }),
      }),
    )
  }

  const remove = (id: string) => {
    const entry = entries.find((candidate) => candidate.id === id)
    if (!entry) return
    if (!window.confirm(`Remove "${title(entry)}" from ${definition.label}?`)) return
    void structural('remove', () => fetch(`/api/admin/entries/${id}`, { method: 'DELETE' }))
  }

  const add = () => {
    void structural(
      'add',
      () =>
        fetch('/api/admin/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection: definition.key, afterId: selectedId || null }),
        }),
      (body) => (body as { data?: { id?: string } })?.data?.id,
    )
  }

  async function save() {
    if (!selectedId || !draft) return
    setBusy('save')
    setFeedback(null)
    setFieldErrors({})

    const payload =
      locale === sourceLocale
        ? draft.content[locale]
        : pickLocalized(definition.form, draft.content[locale])

    const response = await fetch(`/api/admin/entries/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: draft.version,
        isVisible: draft.isVisible,
        slug: draft.slug,
        data: draft.data,
        translations: [{ locale, content: payload }],
      }),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)

    if (!response.ok) {
      setFieldErrors(toFormErrors(body?.error?.fields, locale))
      setFeedback({
        kind: 'err',
        message: body?.error?.message ?? 'Save failed.',
        details: body?.error?.fields?.map((f: { path: string; message: string }) => `${f.path} — ${f.message}`),
      })
      return
    }

    setDrafts((current) => {
      const existing = current[selectedId]
      return existing
        ? {
            ...current,
            [selectedId]: { ...existing, version: body.data.version, slug: body.data.slug },
          }
        : current
    })
    setEntries((current) =>
      current.map((entry) => (entry.id === selectedId ? { ...entry, slug: body.data.slug } : entry)),
    )
    setDirty((current) => ({ ...current, [selectedId]: false }))
    setFeedback({ kind: 'ok', message: `Saved (${locale.toUpperCase()}). Publish to put it live.` })
  }

  async function publish() {
    setBusy('publish')
    setFeedback(null)

    const response = await fetch('/api/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)

    if (!response.ok) {
      setFeedback({
        kind: 'err',
        message: body?.error?.message ?? 'Publish failed.',
        details: body?.error?.fields?.map((f: { path: string; message: string }) => `${f.path} — ${f.message}`),
      })
      return
    }

    setFeedback(
      body.data.unchanged
        ? { kind: 'warn', message: `Nothing changed since version ${body.data.version}.` }
        : { kind: 'ok', message: `Published version ${body.data.version}.` },
    )
  }

  const hasUnsaved = useMemo(() => Object.values(dirty).some(Boolean), [dirty])

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">
          norav<span>.</span>cms
        </p>
        <p className="brand-sub">{definition.label.toLowerCase()}</p>

        <ViewSwitcher
          view={view}
          collections={collections}
          disabled={busy !== null}
          onChange={onViewChange}
        />

        <ul className="block-list">
          {entries.map((entry, index) => (
            <li key={entry.id} className="block-row">
              <button
                type="button"
                className="block-item"
                aria-current={entry.id === selectedId}
                onClick={() => {
                  setSelectedId(entry.id)
                  setFieldErrors({})
                  setFeedback(null)
                }}
              >
                <span className={`dot${drafts[entry.id]?.isVisible ? '' : ' hidden'}`} />
                {title(entry)}
                {dirty[entry.id] && <em style={{ color: 'var(--warn)' }}>•</em>}
              </button>

              <span className="block-actions">
                <button
                  type="button"
                  onClick={() => move(entry.id, -1)}
                  disabled={busy !== null || index === 0}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(entry.id, 1)}
                  disabled={busy !== null || index === entries.length - 1}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  disabled={busy !== null}
                  aria-label="Remove entry"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>

        <div className="palette">
          <button type="button" className="ghost" disabled={busy !== null} onClick={add} style={{ width: '100%' }}>
            + New {definition.label.toLowerCase()}
          </button>
        </div>

        <WorkspaceFooter userEmail={userEmail} environment={environment} onSignOut={onSignOut} />
      </aside>

      <main className="main">
        {busy === 'load' ? (
          <p className="subtle">Loading…</p>
        ) : !selected || !draft ? (
          <>
            <h1>{definition.label}</h1>
            <p className="subtle">{definition.description}</p>
            <p className="subtle">Nothing here yet — add the first one.</p>
          </>
        ) : (
          <>
            <h1>{title(selected)}</h1>
            <p className="subtle slug-line">
              {definition.label} ·
              <input
                aria-label="Slug"
                className="slug-input"
                value={draft.slug}
                disabled={busy !== null}
                onChange={(event) => {
                  setDrafts((current) => {
                    const existing = current[selectedId]
                    return existing
                      ? { ...current, [selectedId]: { ...existing, slug: event.target.value } }
                      : current
                  })
                  setDirty((current) => ({ ...current, [selectedId]: true }))
                }}
              />
            </p>

            <div className="toolbar">
              <div className="tabs" role="tablist">
                {locales.map((code) => (
                  <button
                    key={code}
                    role="tab"
                    type="button"
                    aria-selected={code === locale}
                    onClick={() => {
                      setLocale(code)
                      setFieldErrors({})
                    }}
                  >
                    {code.toUpperCase()}
                    {selected.translations[code]?.status === 'stale' ? ' •' : ''}
                  </button>
                ))}
              </div>

              <label className="field checkbox" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={draft.isVisible}
                  onChange={(event) => {
                    setDrafts((current) => {
                      const existing = current[selectedId]
                      return existing
                        ? { ...current, [selectedId]: { ...existing, isVisible: event.target.checked } }
                        : current
                    })
                    setDirty((current) => ({ ...current, [selectedId]: true }))
                  }}
                />
                <span style={{ fontSize: 13 }}>Visible</span>
              </label>

              <span className="spacer" />

              <button
                className="ghost"
                type="button"
                onClick={save}
                disabled={busy !== null || !dirty[selected.id]}
              >
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
              <button className="primary" type="button" onClick={publish} disabled={busy !== null}>
                {busy === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </div>

            {feedback && (
              <div className={`status ${feedback.kind}`}>
                {feedback.message}
                {feedback.details && feedback.details.length > 0 && (
                  <ul>
                    {feedback.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {hasUnsaved && !feedback && (
              <div className="status warn">Unsaved changes. Save, then publish.</div>
            )}

            <BlockForm
              fields={definition.form}
              content={draft.content[locale] ?? {}}
              settings={{}}
              data={draft.data}
              errors={fieldErrors}
              disabled={busy !== null}
              locale={locale}
              sourceLocale={sourceLocale}
              onChange={handleChange}
            />
          </>
        )}
      </main>
    </div>
  )
}
