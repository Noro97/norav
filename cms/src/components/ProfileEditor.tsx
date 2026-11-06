'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  PROFILE_FORM,
  setAtPath,
  SOURCE_LOCALE,
  type Profile,
  type SerializedCollectionDefinition,
} from '@norav/content-schema'
import { BlockForm } from './BlockForm'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, PreviewButton, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'

/**
 * The facts about the owner: title, years, employers, numbers. One `settings` row,
 * read by the page shell, the JSON-LD and the terminal, so it's corrected here
 * once. Nothing is live until the next publish, and a shared link's card only
 * changes with the site's rebuild that publish starts.
 */
export function ProfileEditor({
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saved, setSaved] = useState<Profile | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<'load' | 'save' | 'publish' | null>('load')
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/settings/profile')
    if (!response.ok) {
      setFeedback({ kind: 'err', message: 'Could not load the profile.' })
      setBusy(null)
      return
    }
    const body = await response.json()
    setProfile(body.data.value)
    setSaved(body.data.value)
    setBusy(null)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    if (!profile) return
    setBusy('save')
    setFeedback(null)
    setErrors({})

    const response = await fetch('/api/admin/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    const body = await response.json().catch(() => null)
    setBusy(null)

    if (!response.ok) {
      const fields: { path: string; message: string }[] = body?.error?.fields ?? []
      setErrors(Object.fromEntries(fields.map((field) => [field.path, field.message])))
      setFeedback({ kind: 'err', message: body?.error?.message ?? 'Save failed.' })
      return
    }

    setSaved(body.data.value)
    setProfile(body.data.value)
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

  const dirty = Boolean(profile && saved && JSON.stringify(profile) !== JSON.stringify(saved))

  return (
    <Workspace
      subtitle="profile"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy !== null}
    >
      <>
        <h1>Profile</h1>
        <p className="subtle">
          The facts the page metadata and the terminal read. Change <code>docs/plan/facts.md</code> first: it is the
          review record.
        </p>

        {busy === 'load' || !profile ? (
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

            <BlockForm
              fields={PROFILE_FORM}
              content={profile as unknown as Record<string, unknown>}
              settings={{}}
              errors={errors}
              disabled={busy !== null}
              locale={SOURCE_LOCALE}
              sourceLocale={SOURCE_LOCALE}
              onChange={(_source, path, value) => setProfile((current) => setAtPath(current, path, value))}
            />
          </>
        )}
      </>
    </Workspace>
  )
}
