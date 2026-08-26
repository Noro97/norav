'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SerializedCollectionDefinition, Theme, ThemeTokens } from '@norav/content-schema'
import { ViewSwitcher, type WorkspaceView } from './ViewSwitcher'

/** The steps worth showing: the accent itself and the tones built around it. */
const PREVIEW_STEPS = [300, 400, 500, 600, 700] as const

type Feedback = { kind: 'ok' | 'err' | 'warn'; message: string } | null

interface ThemeEditorProps {
  collections: SerializedCollectionDefinition[]
  userEmail: string
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}

/**
 * The palette, as the two decisions it is built from.
 *
 * Everything else — the accent's scale, the surfaces, the text tones — is
 * derived, and the preview here is the same derivation the publish will run,
 * so what is shown is what the site will paint.
 */
export function ThemeEditor({
  collections,
  userEmail,
  view,
  onViewChange,
  onSignOut,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [saved, setSaved] = useState<Theme | null>(null)
  const [tokens, setTokens] = useState<ThemeTokens>({})
  const [busy, setBusy] = useState<'load' | 'save' | 'publish' | null>('load')
  const [feedback, setFeedback] = useState<Feedback>(null)

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/settings/theme')
    if (!response.ok) {
      setFeedback({ kind: 'err', message: 'Could not load the palette.' })
      setBusy(null)
      return
    }
    const body = await response.json()
    setTheme(body.data.value)
    setSaved(body.data.value)
    setTokens(body.data.derived ?? {})
    setBusy(null)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    if (!theme) return
    setBusy('save')
    setFeedback(null)

    const response = await fetch('/api/admin/settings/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)

    if (!response.ok) {
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'Save failed.' })
      return
    }

    setSaved(body.data.value)
    setTokens(body.data.derived ?? {})
    setFeedback({ kind: 'ok', message: 'Saved. Publish to put it live.' })
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
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'Publish failed.' })
      return
    }
    setFeedback(
      body.data.unchanged
        ? { kind: 'warn', message: `Nothing changed since version ${body.data.version}.` }
        : { kind: 'ok', message: `Published version ${body.data.version}.` },
    )
  }

  const dirty = Boolean(theme && saved && (theme.accent !== saved.accent || theme.background !== saved.background))

  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">
          norav<span>.</span>cms
        </p>
        <p className="brand-sub">palette</p>

        <ViewSwitcher view={view} collections={collections} disabled={busy !== null} onChange={onViewChange} />

        <p className="brand-sub" style={{ marginTop: 28, marginBottom: 8 }}>
          {userEmail}
        </p>
        <button className="ghost" type="button" onClick={onSignOut} style={{ width: '100%' }}>
          Sign out
        </button>
      </aside>

      <main className="main">
        <h1>Palette</h1>
        <p className="subtle">
          Two colours. The accent&apos;s scale, the surfaces and the text tones are derived from them.
        </p>

        {busy === 'load' || !theme ? (
          <p className="subtle">Loading…</p>
        ) : (
          <>
            <div className="toolbar">
              <span className="spacer" />
              <button className="ghost" type="button" onClick={save} disabled={busy !== null || !dirty}>
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
              <button className="primary" type="button" onClick={publish} disabled={busy !== null}>
                {busy === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </div>

            {feedback && <div className={`status ${feedback.kind}`}>{feedback.message}</div>}
            {dirty && !feedback && <div className="status warn">Unsaved changes. Save, then publish.</div>}

            <ColourField
              label="Accent"
              help="Links, highlights, the particle field. Painted exactly as given."
              value={theme.accent}
              disabled={busy !== null}
              onChange={(accent) => setTheme({ ...theme, accent })}
            />

            <ColourField
              label="Background"
              help="Cards and panels are lifted from this, so a tinted background tints them too."
              value={theme.background}
              disabled={busy !== null}
              onChange={(background) => setTheme({ ...theme, background })}
            />

            <fieldset>
              <legend>Derived — last saved</legend>
              <p className="help" style={{ marginTop: 0 }}>
                What publishing would paint with. Save to refresh.
              </p>
              <div className="swatches">
                {PREVIEW_STEPS.map((step) => (
                  <Swatch key={step} name={String(step)} value={tokens[`--color-crimson-${step}`]} />
                ))}
              </div>
              <div className="swatches">
                <Swatch name="background" value={tokens['--color-background']} />
                <Swatch name="card" value={tokens['--color-card']} />
                <Swatch name="text" value={tokens['--color-foreground']} />
                <Swatch name="muted" value={tokens['--color-muted-foreground']} />
              </div>
            </fieldset>
          </>
        )}
      </main>
    </div>
  )
}

function ColourField({
  label,
  help,
  value,
  disabled,
  onChange,
}: {
  label: string
  help: string
  value: string
  disabled?: boolean
  onChange: (next: string) => void
}) {
  return (
    <div className="field">
      <label htmlFor={`colour-${label}`}>{label}</label>
      <div className="colour-field">
        <input
          id={`colour-${label}`}
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
        <input
          type="text"
          aria-label={`${label} hex`}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <p className="help">{help}</p>
    </div>
  )
}

function Swatch({ name, value }: { name: string; value?: string }) {
  return (
    <div className="swatch">
      <span className="chip" style={{ background: value ?? 'transparent' }} />
      <span className="swatch-name">{name}</span>
      <span className="swatch-value">{value ?? '—'}</span>
    </div>
  )
}
