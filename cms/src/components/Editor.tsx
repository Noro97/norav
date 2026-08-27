'use client'

import { useMemo, useState } from 'react'
import type {
  Locale,
  SerializedBlockDefinition,
  SerializedCollectionDefinition,
} from '@norav/content-schema'
import { mergeLocale, pickLocalized, setAtPath } from '@norav/content-schema'
import { BlockForm, type FieldSource } from './BlockForm'
import { ViewSwitcher, type WorkspaceView } from './ViewSwitcher'
import { WorkspaceFooter } from './WorkspaceFooter'
import type { EnvironmentInfo } from '@/lib/environment'

export interface EditorBlock {
  id: string
  type: string
  anchor_id: string | null
  is_visible: boolean
  settings: Record<string, unknown>
  version: number
  translations: Record<string, { content: Record<string, unknown>; status: string }>
}

interface EditorProps {
  pageSlug: string
  blocks: EditorBlock[]
  definitions: SerializedBlockDefinition[]
  collections: SerializedCollectionDefinition[]
  locales: readonly Locale[]
  sourceLocale: Locale
  userEmail: string
  environment?: EnvironmentInfo
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}

interface Draft {
  version: number
  isVisible: boolean
  settings: Record<string, unknown>
  content: Record<Locale, Record<string, unknown>>
}

type Feedback =
  | { kind: 'ok' | 'err' | 'warn'; message: string; details?: string[] }
  | null

/** Turns API field paths back into form paths for the locale on screen. */
function toFormErrors(
  fields: { path: string; message: string }[] | undefined,
  locale: Locale,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields ?? []) {
    const translationPrefix = `translations.${locale}.`
    if (field.path.startsWith(translationPrefix)) {
      errors[field.path.slice(translationPrefix.length)] = field.message
    } else if (field.path.startsWith('settings.')) {
      errors[field.path.slice('settings.'.length)] = field.message
    }
  }
  return errors
}

function buildDrafts(
  blocks: EditorBlock[],
  definitionsByType: Map<string, SerializedBlockDefinition>,
  locales: readonly Locale[],
  sourceLocale: Locale,
): Record<string, Draft> {
  const drafts: Record<string, Draft> = {}

  for (const block of blocks) {
    const definition = definitionsByType.get(block.type)
    const fallback = (definition?.defaults.content ?? {}) as Record<string, unknown>
    const source = block.translations[sourceLocale]?.content ?? fallback
    const content = {} as Record<Locale, Record<string, unknown>>

    for (const locale of locales) {
      // The editor works on the resolved document — the translation overlaid on
      // its source — so inherited values are visible (read-only) instead of
      // showing as blanks. `pickLocalized` strips them again on save.
      content[locale] =
        locale === sourceLocale
          ? source
          : (mergeLocale(source, block.translations[locale]?.content) as Record<string, unknown>)
    }

    drafts[block.id] = {
      version: block.version,
      isVisible: block.is_visible,
      settings: { ...(definition?.defaults.settings as object), ...block.settings },
      content,
    }
  }

  return drafts
}

export function Editor({
  pageSlug,
  blocks: initialBlocks,
  definitions,
  collections,
  locales,
  sourceLocale,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: EditorProps) {
  const definitionsByType = useMemo(
    () => new Map(definitions.map((definition) => [definition.type, definition])),
    [definitions],
  )

  const [blocks, setBlocks] = useState(initialBlocks)
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    buildDrafts(initialBlocks, definitionsByType, locales, sourceLocale),
  )

  const [selectedId, setSelectedId] = useState(initialBlocks[0]?.id ?? '')
  const [locale, setLocale] = useState<Locale>(sourceLocale)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<'save' | 'publish' | 'add' | 'remove' | 'move' | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [pendingType, setPendingType] = useState('')

  // A singleton already on the page cannot be added twice.
  const available = useMemo(() => {
    const present = new Set(blocks.map((block) => block.type))
    return definitions.filter((definition) => !definition.singleton || !present.has(definition.type))
  }, [definitions, blocks])

  const selected = blocks.find((block) => block.id === selectedId)
  const draft = selectedId ? drafts[selectedId] : undefined
  const definition = selected ? definitionsByType.get(selected.type) : undefined

  function handleChange(source: FieldSource, path: string, value: unknown) {
    if (!selectedId) return
    setDrafts((current) => {
      const existing = current[selectedId]
      if (!existing) return current
      const next: Draft =
        source === 'settings'
          ? { ...existing, settings: setAtPath(existing.settings, path, value) }
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

  function toggleVisible(next: boolean) {
    if (!selectedId) return
    setDrafts((current) => {
      const existing = current[selectedId]
      return existing ? { ...current, [selectedId]: { ...existing, isVisible: next } } : current
    })
    setDirty((current) => ({ ...current, [selectedId]: true }))
  }

  /** Structural changes touch several rows, so the page is re-read afterwards. */
  async function refresh(selectId?: string) {
    const response = await fetch(`/api/admin/pages/${pageSlug}`)
    if (!response.ok) return
    const body = await response.json()
    const next = body.data.blocks as EditorBlock[]

    setBlocks(next)
    setDrafts(buildDrafts(next, definitionsByType, locales, sourceLocale))
    setDirty({})
    setSelectedId(
      selectId ?? (next.some((block) => block.id === selectedId) ? selectedId : (next[0]?.id ?? '')),
    )
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
    setBusy(null)

    if (!response.ok) {
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'That did not work.' })
      return
    }

    await refresh(selectAfter?.(body))
    setFeedback({ kind: 'ok', message: 'Structure updated. Publish to put it live.' })
  }

  const move = (id: string, delta: number) => {
    const index = blocks.findIndex((block) => block.id === id)
    const target = index + delta
    if (index === -1 || target < 0 || target >= blocks.length) return

    const order = blocks.map((block) => block.id)
    const [moved] = order.splice(index, 1)
    if (moved) order.splice(target, 0, moved)

    void structural('move', () =>
      fetch('/api/admin/blocks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageSlug, order }),
      }),
    )
  }

  const remove = (id: string) => {
    const definition = definitionsByType.get(blocks.find((block) => block.id === id)?.type ?? '')
    if (!window.confirm(`Remove "${definition?.label ?? 'this section'}" from the page?`)) return

    void structural('remove', () => fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' }))
  }

  const add = (type: string) => {
    if (!type) return
    void structural(
      'add',
      () =>
        fetch('/api/admin/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageSlug, type, afterId: selectedId || null }),
        }),
      (body) => (body as { data?: { id?: string } })?.data?.id,
    )
  }

  async function save() {
    if (!selectedId || !draft) return
    setBusy('save')
    setFeedback(null)
    setFieldErrors({})

    // A translation stores only what a translator owns. Numbers, URLs and
    // product names stay on the source locale, so changing one there updates
    // every language instead of leaving copies behind to drift.
    const definitionForSave = definitionsByType.get(selected?.type ?? '')
    const payload =
      locale === sourceLocale || !definitionForSave
        ? draft.content[locale]
        : pickLocalized(definitionForSave.form, draft.content[locale])

    const response = await fetch(`/api/admin/blocks/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: draft.version,
        isVisible: draft.isVisible,
        settings: draft.settings,
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
        ? { ...current, [selectedId]: { ...existing, version: body.data.version } }
        : current
    })
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

  const hasUnsaved = Object.values(dirty).some(Boolean)

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">
          norav<span>.</span>cms
        </p>
        <p className="brand-sub">/{pageSlug}</p>

        <ViewSwitcher
          view={view}
          collections={collections}
          disabled={busy !== null}
          onChange={onViewChange}
        />

        <ul className="block-list">
          {blocks.map((block, index) => {
            const blockDraft = drafts[block.id]
            return (
              <li key={block.id} className="block-row">
                <button
                  type="button"
                  className="block-item"
                  aria-current={block.id === selectedId}
                  onClick={() => {
                    setSelectedId(block.id)
                    setFieldErrors({})
                    setFeedback(null)
                  }}
                >
                  <span className={`dot${blockDraft?.isVisible ? '' : ' hidden'}`} />
                  {definitionsByType.get(block.type)?.label ?? block.type}
                  {dirty[block.id] && <em style={{ color: 'var(--warn)' }}>•</em>}
                  <span className="type">{block.type}</span>
                </button>

                <span className="block-actions">
                  <button
                    type="button"
                    onClick={() => move(block.id, -1)}
                    disabled={busy !== null || index === 0}
                    aria-label="Move up"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(block.id, 1)}
                    disabled={busy !== null || index === blocks.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(block.id)}
                    disabled={busy !== null}
                    aria-label="Remove section"
                    title="Remove from the page"
                  >
                    ✕
                  </button>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="palette">
          <select
            value={pendingType}
            disabled={busy !== null}
            onChange={(event) => setPendingType(event.target.value)}
            aria-label="Section to add"
          >
            <option value="">Add a section…</option>
            {available.map((definition) => (
              <option key={definition.type} value={definition.type}>
                {definition.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ghost"
            disabled={!pendingType || busy !== null}
            onClick={() => {
              add(pendingType)
              setPendingType('')
            }}
          >
            Add
          </button>
        </div>

        <WorkspaceFooter userEmail={userEmail} environment={environment} onSignOut={onSignOut} />
      </aside>

      <main className="main">
        {!selected || !definition || !draft ? (
          <p className="subtle">This page has no blocks yet. Run `npm run seed` in cms/.</p>
        ) : (
          <>
            <h1>{definition.label}</h1>
            <p className="subtle">{definition.description}</p>

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
                  onChange={(event) => toggleVisible(event.target.checked)}
                />
                <span style={{ fontSize: 13 }}>Visible</span>
              </label>

              <span className="spacer" />

              <button className="ghost" type="button" onClick={save} disabled={busy !== null || !dirty[selected.id]}>
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

            {locale !== sourceLocale && !selected.translations[locale] && (
              <div className="status warn">
                No {locale.toUpperCase()} translation yet — the fields below start from{' '}
                {sourceLocale.toUpperCase()}.
              </div>
            )}

            <BlockForm
              fields={definition.form}
              content={draft.content[locale] ?? {}}
              settings={draft.settings}
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
