'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Locale, SerializedBlockDefinition } from '@norav/content-schema'
import { BlockForm, setPath, type FieldSource } from './BlockForm'

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
  locales: readonly Locale[]
  sourceLocale: Locale
  userEmail: string
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

export function Editor({
  pageSlug,
  blocks,
  definitions,
  locales,
  sourceLocale,
  userEmail,
}: EditorProps) {
  const router = useRouter()
  const definitionsByType = useMemo(
    () => new Map(definitions.map((definition) => [definition.type, definition])),
    [definitions],
  )

  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    const initial: Record<string, Draft> = {}
    for (const block of blocks) {
      const definition = definitionsByType.get(block.type)
      const fallback = (definition?.defaults.content ?? {}) as Record<string, unknown>
      const source = block.translations[sourceLocale]?.content ?? fallback
      const content = {} as Record<Locale, Record<string, unknown>>
      for (const locale of locales) {
        // An untranslated locale opens on the source copy, so the editor
        // translates in place instead of facing empty fields.
        content[locale] = block.translations[locale]?.content ?? source
      }
      initial[block.id] = {
        version: block.version,
        isVisible: block.is_visible,
        settings: { ...(definition?.defaults.settings as object), ...block.settings },
        content,
      }
    }
    return initial
  })

  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? '')
  const [locale, setLocale] = useState<Locale>(sourceLocale)
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
          ? { ...existing, settings: setPath(existing.settings, path, value) }
          : {
              ...existing,
              content: {
                ...existing.content,
                [locale]: setPath(existing.content[locale] ?? {}, path, value),
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

  async function save() {
    if (!selectedId || !draft) return
    setBusy('save')
    setFeedback(null)
    setFieldErrors({})

    const response = await fetch(`/api/admin/blocks/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: draft.version,
        isVisible: draft.isVisible,
        settings: draft.settings,
        translations: [{ locale, content: draft.content[locale] }],
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
    router.refresh()
  }

  const hasUnsaved = Object.values(dirty).some(Boolean)

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">
          norav<span>.</span>cms
        </p>
        <p className="brand-sub">/{pageSlug}</p>

        <ul className="block-list">
          {blocks.map((block) => {
            const blockDraft = drafts[block.id]
            return (
              <li key={block.id}>
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
              </li>
            )
          })}
        </ul>

        <p className="brand-sub" style={{ marginTop: 28, marginBottom: 8 }}>
          {userEmail}
        </p>
        <form action="/api/auth/logout" method="post" onSubmit={async (event) => {
          event.preventDefault()
          await fetch('/api/auth/logout', { method: 'POST' })
          router.replace('/login')
          router.refresh()
        }}>
          <button className="ghost" type="submit" style={{ width: '100%' }}>
            Sign out
          </button>
        </form>
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
              onChange={handleChange}
            />
          </>
        )}
      </main>
    </div>
  )
}
