'use client'

import { useMemo, useState } from 'react'
import type {
  Locale,
  SerializedBlockDefinition,
  SerializedCollectionDefinition,
} from '@norav/content-schema'
import { mergeLocale, pickLocalized, setAtPath } from '@norav/content-schema'
import { BlockForm, type FieldSource } from './BlockForm'
import { type WorkspaceView } from './ViewSwitcher'
import { usePages } from './PagesContext'
import { PageSettings } from './PageSettings'
import { BlockHistory } from './BlockHistory'
import { Modal } from './Modal'
import { SLUG } from '@/lib/pages'
import { Workspace, FeedbackBanner, LocaleTabs, PreviewButton, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'
import { publishFromAdmin } from '@/lib/publish-client'

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
  /** Re-reads the page list after one is created, renamed or deleted. */
  onPagesChanged: () => Promise<void>
  /** Another page was chosen and its sections are still on the way. */
  loading?: boolean
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
  onPagesChanged,
  loading,
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
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState('')
  const [pendingType, setPendingType] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [newPageSlug, setNewPageSlug] = useState<string | null>(null)

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
    const { feedback } = await publishFromAdmin()
    setBusy(null)
    setFeedback(feedback)
  }

  const { pages } = usePages()
  const current = pages.find((page) => page.slug === pageSlug)
  const elsewhere = pages.filter((page) => page.slug !== pageSlug)

  /** Moves a section to another page. It lands at the end of that one. */
  const moveToPage = (id: string, slug: string) => {
    const block = blocks.find((candidate) => candidate.id === id)
    if (!block) return
    void structural(
      'move',
      () =>
        fetch(`/api/admin/blocks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: block.version, pageSlug: slug }),
        }),
    ).then(onPagesChanged)
  }

  async function createPage(slug: string) {
    const response = await fetch('/api/admin/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'That did not work.' })
      return
    }
    await onPagesChanged()
    setNewPageSlug(null)
    onViewChange({ kind: 'page', slug })
  }

  const hasUnsaved = Object.values(dirty).some(Boolean)

  return (
    <Workspace
      subtitle={loading ? 'loading…' : `/${pageSlug === 'home' ? '' : pageSlug}`}
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null || loading === true}
      onNewPage={() => setNewPageSlug('')}
      sidebar={
        <>
          {/* A filter rather than groups: the page is one ordered sequence, and
              grouping it would hide the thing the list is mostly used for —
              seeing what comes after what. */}
          {blocks.length > 8 && (
            <input
              className="block-filter"
              type="search"
              placeholder="Filter sections"
              aria-label="Filter sections"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          )}

          <ul className="block-list">
          {blocks.length === 0 && (
            <li className="block-empty subtle">
              Nothing on this page yet. Add a section below, or move one here
              from another page.
            </li>
          )}
          {blocks.map((block, index) => {
            const label = definitionsByType.get(block.type)?.label ?? block.type
            if (
              filter &&
              !`${label} ${block.type}`.toLowerCase().includes(filter.trim().toLowerCase())
            ) {
              return null
            }
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
                  <span className="block-name">{label}</span>
                  {dirty[block.id] && <em className="block-unsaved" title="Unsaved">•</em>}
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
                  {elsewhere.length > 0 && (
                    <select
                      className="move-to"
                      value=""
                      disabled={busy !== null}
                      aria-label="Move to another page"
                      title="Move to another page"
                      onChange={(event) => {
                        if (event.target.value) moveToPage(block.id, event.target.value)
                      }}
                    >
                      <option value="">⇄</option>
                      {elsewhere.map((page) => (
                        <option key={page.slug} value={page.slug}>
                          /{page.slug === 'home' ? '' : page.slug}
                        </option>
                      ))}
                    </select>
                  )}
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
            {/* Grouped rather than listed: the imported kit takes this picker
                past eighty entries, and a flat list that long is one nobody
                reads to the end. */}
            {[...new Map(available.map((d) => [d.group, true])).keys()].map((group) => (
              <optgroup key={group} label={group}>
                {available
                  .filter((definition) => definition.group === group)
                  .map((definition) => (
                    <option key={definition.type} value={definition.type}>
                      {definition.label}
                    </option>
                  ))}
              </optgroup>
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
        </>
      }
    >
      <>
        {!selected || !definition || !draft ? (
          // Two different empty states, and the difference matters: a page with
          // no sections needs one added, while a page that has them just needs
          // one picked. This used to say "Run `npm run seed`" in both cases —
          // advice that only ever applied to a database with nothing in it at
          // all, and that sends anyone who has just created a page off to run a
          // command that will not add a section to it.
          <>
            <p className="subtle">
              {blocks.length === 0
                ? 'Nothing on this page yet. Add a section from the list on the left.'
                : 'Pick a section on the left to edit it.'}
            </p>
            {/* The settings live in the section toolbar, which an empty page
                never shows — so an empty page could not be renamed, archived
                or deleted, the one case where deleting is most likely. */}
            <div className="toolbar">
              <span className="spacer" />
              <button
                className="ghost"
                type="button"
                onClick={() => setSettingsOpen(true)}
                disabled={busy !== null}
                title="Address, status and search listing"
              >
                Page settings
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{definition.label}</h1>
            <p className="subtle">{definition.description}</p>

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
                  onChange={(event) => toggleVisible(event.target.checked)}
                />
                <span style={{ fontSize: 13 }}>Visible</span>
              </label>

              <span className="spacer" />

              <button
                className="ghost"
                type="button"
                onClick={() => setHistoryOpen(true)}
                disabled={busy !== null}
                title="Earlier texts of this section"
              >
                History
              </button>
              <button className="ghost" type="button" onClick={save} disabled={busy !== null || !dirty[selected.id]}>
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setSettingsOpen(true)}
                disabled={busy !== null}
                title="Address, status and search listing"
              >
                Page settings
              </button>
              <PreviewButton slug={pageSlug} disabled={busy !== null} />
          <button className="primary" type="button" onClick={publish} disabled={busy !== null}>
                {busy === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </div>

            <FeedbackBanner feedback={feedback} unsaved={hasUnsaved} />

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
      </>
      {historyOpen && selected && draft && definition && (
        <BlockHistory
          blockId={selected.id}
          label={definition.label}
          locale={locale}
          sourceLocale={sourceLocale}
          source={draft.content[sourceLocale] ?? {}}
          current={draft.content[locale] ?? {}}
          onClose={() => setHistoryOpen(false)}
          onUse={(content, replacedAt) => {
            setHistoryOpen(false)
            setDrafts((all) => {
              const existing = all[selected.id]
              return existing
                ? { ...all, [selected.id]: { ...existing, content: { ...existing.content, [locale]: content } } }
                : all
            })
            setDirty((all) => ({ ...all, [selected.id]: true }))
            setFieldErrors({})
            setFeedback({
              kind: 'warn',
              message: `The form holds the text from before ${new Date(replacedAt).toLocaleString()}. Save to keep it, then publish.`,
            })
          }}
        />
      )}

      {settingsOpen && current && (
        <PageSettings
          slug={pageSlug}
          status={current.status}
          seo={current.seo ?? {}}
          locales={locales}
          blocks={current.blocks}
          menuItems={current.menuItems}
          onClose={() => setSettingsOpen(false)}
          onSaved={(next) => {
            setSettingsOpen(false)
            if (next !== pageSlug) onViewChange({ kind: 'page', slug: next })
          }}
          onDeleted={() => {
            setSettingsOpen(false)
            onViewChange({ kind: 'page', slug: 'home' })
          }}
        />
      )}

      {newPageSlug !== null && (
        <Modal
          title="New page"
          onClose={() => setNewPageSlug(null)}
          footer={
            <>
              <button type="button" className="ghost" onClick={() => setNewPageSlug(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => void createPage(newPageSlug)}
                disabled={!SLUG.test(newPageSlug)}
              >
                Create
              </button>
            </>
          }
        >
          <label className="field">
            <span>Address</span>
            <input
              autoFocus
              value={newPageSlug}
              placeholder="work/new-case-study"
              spellCheck={false}
              onChange={(event) => setNewPageSlug(event.target.value)}
            />
            <small className="subtle">
              {newPageSlug && !SLUG.test(newPageSlug)
                ? 'Lowercase words, separated by - and /.'
                : `The site will serve it at /${newPageSlug}`}
            </small>
          </label>
          <p className="subtle">
            It starts empty. Add sections to it, or move them here from another page.
          </p>
        </Modal>
      )}
    </Workspace>
  )
}
