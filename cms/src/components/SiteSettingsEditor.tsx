'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, PreviewButton, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'

interface SiteSettings {
  grain: boolean
  dynamicGrid: boolean
  navIndicator: 'dot' | 'gooey'
}

const DEFAULT_SETTINGS: SiteSettings = { grain: true, dynamicGrid: true, navIndicator: 'dot' }

interface SiteSettingsEditorProps {
  collections: SerializedCollectionDefinition[]
  userEmail: string
  environment?: EnvironmentInfo
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}

/**
 * Chrome that isn't a block — the grain, the dynamic grid,
 * and how the nav marks the active link. One row per key in `settings`,
 * carried into the published snapshot the same way the palette is.
 */
export function SiteSettingsEditor({
  collections,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: SiteSettingsEditorProps) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState<SiteSettings | null>(null)
  const [busy, setBusy] = useState<'load' | 'save' | 'publish' | null>('load')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/settings/site')
    if (!response.ok) {
      setFeedback({ kind: 'err', message: 'Could not load site settings.' })
      setBusy(null)
      return
    }
    const body = await response.json()
    const value = { ...DEFAULT_SETTINGS, ...body.data.value }
    setSettings(value)
    setSaved(value)
    setBusy(null)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    if (!settings) return
    setBusy('save')
    setFeedback(null)

    const response = await fetch('/api/admin/settings/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)

    if (!response.ok) {
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'Save failed.' })
      return
    }

    setSaved(body.data.value)
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

  const dirty = Boolean(settings && saved && JSON.stringify(settings) !== JSON.stringify(saved))

  return (
    <Workspace
      subtitle="effects"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null}
    >
      <>
        <h1>Effects</h1>
        <p className="subtle">Chrome that isn't a block — the same for every page.</p>

        {busy === 'load' || !settings ? (
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

            <BoolField
              label="Film grain"
              help="A faint animated grain over the whole page."
              value={settings.grain}
              disabled={busy !== null}
              onChange={(grain) => setSettings({ ...settings, grain })}
            />
            <BoolField
              label="Dynamic grid"
              help="The cursor-reactive background grid."
              value={settings.dynamicGrid}
              disabled={busy !== null}
              onChange={(dynamicGrid) => setSettings({ ...settings, dynamicGrid })}
            />
            <div className="field">
              <label htmlFor="nav-indicator">Nav active-link style</label>
              <select
                id="nav-indicator"
                value={settings.navIndicator}
                disabled={busy !== null}
                onChange={(e) =>
                  setSettings({ ...settings, navIndicator: e.target.value as SiteSettings['navIndicator'] })
                }
              >
                <option value="dot">Dot</option>
                <option value="gooey">Gooey</option>
              </select>
              <p className="help">A static dot, or a blob that morphs between links.</p>
            </div>
          </>
        )}
      </>
    </Workspace>
  )
}

function BoolField({
  label,
  help,
  value,
  disabled,
  onChange,
}: {
  label: string
  help: string
  value: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="field">
      <label>
        <input
          type="checkbox"
          checked={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />{' '}
        {label}
      </label>
      <p className="help">{help}</p>
    </div>
  )
}
