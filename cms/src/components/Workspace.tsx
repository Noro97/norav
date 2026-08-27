'use client'

import type { ReactNode } from 'react'
import type { Locale, SerializedCollectionDefinition } from '@norav/content-schema'
import { ViewSwitcher, type WorkspaceView } from './ViewSwitcher'
import { WorkspaceFooter } from './WorkspaceFooter'
import type { EnvironmentInfo } from '@/lib/environment'

/**
 * The frame every editor sits in.
 *
 * Four of them had their own copy of it — the mark, the view switcher, the
 * footer — and the copies were how the environment warning nearly became a
 * fourth variation of the same eight lines. What differs between editors is
 * what goes in the sidebar below the switcher, and that is a slot.
 */
export function Workspace({
  subtitle,
  collections,
  view,
  onViewChange,
  userEmail,
  environment,
  onSignOut,
  busy,
  sidebar,
  children,
}: {
  subtitle: string
  collections: SerializedCollectionDefinition[]
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  userEmail: string
  environment?: EnvironmentInfo
  onSignOut: () => void
  busy?: boolean
  /** Whatever this editor needs below the switcher: a block list, a counter. */
  sidebar?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <p className="brand">
          norav<span>.</span>cms
        </p>
        <p className="brand-sub">{subtitle}</p>

        <ViewSwitcher
          view={view}
          collections={collections}
          disabled={busy}
          onChange={onViewChange}
        />

        {sidebar}

        <WorkspaceFooter userEmail={userEmail} environment={environment} onSignOut={onSignOut} />
      </aside>

      <main className="main">{children}</main>
    </div>
  )
}

export interface Feedback {
  kind: 'ok' | 'err' | 'warn'
  message: string
  /** Field-level reasons a save was refused. */
  details?: string[]
}

/**
 * What just happened, or what has not been saved yet.
 *
 * The unsaved warning is here rather than beside it because the two are one
 * decision: a result replaces the reminder, so they never appear together and
 * every editor was writing that rule out again.
 */
export function FeedbackBanner({
  feedback,
  unsaved,
}: {
  feedback: Feedback | null
  unsaved?: boolean
}) {
  if (feedback) {
    return (
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
    )
  }
  if (unsaved) return <div className="status warn">Unsaved changes. Save, then publish.</div>
  return null
}

/** The language being edited. A dot marks a translation the source has outrun. */
export function LocaleTabs({
  locales,
  locale,
  stale,
  onChange,
}: {
  locales: readonly Locale[]
  locale: Locale
  stale?: (code: Locale) => boolean
  onChange: (next: Locale) => void
}) {
  return (
    <div className="tabs" role="tablist">
      {locales.map((code) => (
        <button
          key={code}
          role="tab"
          type="button"
          aria-selected={code === locale}
          onClick={() => onChange(code)}
        >
          {code.toUpperCase()}
          {stale?.(code) ? ' •' : ''}
        </button>
      ))}
    </div>
  )
}
