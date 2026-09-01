'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Locale, SerializedCollectionDefinition } from '@norav/content-schema'
import { getAtPath, mergeLocale, pickLocalized, setAtPath } from '@norav/content-schema'
import { BlockForm, type FieldSource } from './BlockForm'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, LocaleTabs, PreviewButton, type Feedback } from './Workspace'
import { Modal } from './Modal'
import type { EnvironmentInfo } from '@/lib/environment'

interface CollectionEntry {
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
  const [feedback, setFeedback] = useState<Feedback | null>(null)
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
      // Nothing opens on its own. The list used to select the first row so the
      // form beside it had something to show; now that editing happens in a
      // dialog, opening one unasked would put a modal in front of the table
      // every time it loads.
      setSelectedId((current) =>
        selectId ?? (next.some((entry) => entry.id === current) ? current : ''),
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
    <Workspace
      subtitle={definition.label.toLowerCase()}
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null}
      sidebar={
        <>
          <div className="palette">
          <button type="button" className="ghost" disabled={busy !== null} onClick={add} style={{ width: '100%' }}>
            + New {definition.label.toLowerCase()}
          </button>
        </div>
        </>
      }
    >
      <>
        <h1>{definition.label}</h1>
        <p className="subtle">{definition.description}</p>

        <FeedbackBanner feedback={feedback} unsaved={hasUnsaved} />

        {busy === 'load' ? (
          <p className="subtle">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="subtle">Nothing here yet — add the first one.</p>
        ) : (
          <div className="table-scroll">
            {/* A table rather than a list, because the useful facts about a row —
                whether it is visible, whether a translation is stale, whether it
                is saved — are things you want to compare across rows, and a list
                can only show one of them. */}
            <table className="rows">
              <thead>
                <tr>
                  <th scope="col" className="num">#</th>
                  <th scope="col">{definition.label}</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Visible</th>
                  <th scope="col">Translations</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const row = drafts[entry.id]
                  const stale = locales.filter(
                    (code) => entry.translations[code]?.status === 'stale',
                  )
                  return (
                    <tr key={entry.id}>
                      <td className="num">{String(index + 1).padStart(2, '0')}</td>
                      <td>
                        <button
                          type="button"
                          className="row-open"
                          disabled={busy !== null}
                          onClick={() => {
                            setSelectedId(entry.id)
                            setFieldErrors({})
                            setFeedback(null)
                          }}
                        >
                          {title(entry)}
                        </button>
                        {dirty[entry.id] && <em className="row-dirty" title="Unsaved">•</em>}
                      </td>
                      <td className="mono">{row?.slug ?? entry.slug}</td>
                      <td>
                        <span className={`pill ${row?.isVisible ? 'pill-on' : 'pill-off'}`}>
                          {row?.isVisible ? 'shown' : 'hidden'}
                        </span>
                      </td>
                      <td className="mono">
                        {stale.length > 0 ? (
                          <span className="pill pill-warn">{stale.join(', ').toUpperCase()} stale</span>
                        ) : (
                          <span className="subtle">up to date</span>
                        )}
                      </td>
                      <td className="row-actions">
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {selected && draft && (
          <Modal
            wide
            title={title(selected)}
            onClose={() => setSelectedId('')}
            footer={
              <>
                <button
                  className="ghost"
                  type="button"
                  onClick={save}
                  disabled={busy !== null || !dirty[selected.id]}
                >
                  {busy === 'save' ? 'Saving…' : 'Save'}
                </button>
                <PreviewButton disabled={busy !== null} />
          <button className="primary" type="button" onClick={publish} disabled={busy !== null}>
                  {busy === 'publish' ? 'Publishing…' : 'Publish'}
                </button>
              </>
            }
          >
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
              <LocaleTabs
                locales={locales}
                locale={locale}
                stale={(code) => selected.translations[code]?.status === 'stale'}
                onChange={(next) => {
                  setLocale(next)
                  setFieldErrors({})
                }}
              />

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
            </div>

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
          </Modal>
        )}
      </>
    </Workspace>
  )
}
