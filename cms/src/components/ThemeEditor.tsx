'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SerializedCollectionDefinition, Theme, ThemeTokens } from '@norav/content-schema'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, PreviewButton, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'
import { publishFromAdmin } from '@/lib/publish-client'

/** The steps worth showing: the accent itself and the tones built around it. */
const PREVIEW_STEPS = [300, 400, 500, 600, 700] as const


interface ThemeEditorProps {
  collections: SerializedCollectionDefinition[]
  userEmail: string
  environment?: EnvironmentInfo
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}

/**
 * The palette, as the three decisions it is built from.
 *
 * Everything else — both accents' scales, the surfaces, the text tones — is
 * derived, and the preview here is the same derivation the publish will run,
 * so what is shown is what the site will paint.
 */
export function ThemeEditor({
  collections,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [saved, setSaved] = useState<Theme | null>(null)
  const [tokens, setTokens] = useState<ThemeTokens>({})
  const [busy, setBusy] = useState<'load' | 'save' | 'publish' | null>('load')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

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
    const { feedback } = await publishFromAdmin()
    setBusy(null)
    setFeedback(feedback)
  }

  const dirty = Boolean(
    theme &&
      saved &&
      (theme.accent !== saved.accent ||
        theme.secondary !== saved.secondary ||
        theme.background !== saved.background),
  )

  return (
    <Workspace
      subtitle="palette"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null}
    >
      <>
        <h1>Palette</h1>
        <p className="subtle">
          Three colours. Both scales, the surfaces and the text tones are derived from them.
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
              <PreviewButton disabled={busy !== null} />
          <button className="primary" type="button" onClick={publish} disabled={busy !== null}>
                {busy === 'publish' ? 'Publishing…' : 'Publish'}
              </button>
            </div>

            <FeedbackBanner feedback={feedback} unsaved={dirty} />

            <ColourField
              label="Accent"
              help="Links, highlights, the particle field. Painted exactly as given."
              value={theme.accent}
              disabled={busy !== null}
              onChange={(accent) => setTheme({ ...theme, accent })}
            />

            <ColourField
              label="Secondary"
              help="Case studies and the interactive widgets — the parts that are not brand."
              value={theme.secondary}
              disabled={busy !== null}
              onChange={(secondary) => setTheme({ ...theme, secondary })}
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
                {PREVIEW_STEPS.map((step) => (
                  <Swatch key={step} name={String(step)} value={tokens[`--color-cyan-${step}`]} />
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
      </>
    </Workspace>
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
