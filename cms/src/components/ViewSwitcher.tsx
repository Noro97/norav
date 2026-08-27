'use client'

import type { SerializedCollectionDefinition } from '@norav/content-schema'

export type WorkspaceView =
  | { kind: 'page' }
  | { kind: 'collection'; key: string }
  | { kind: 'theme' }
  | { kind: 'media' }

/**
 * Moves between the page and the collections. Collections hold the rows that a
 * block renders but does not own — the career timeline, the case studies — so
 * they are edited beside the page rather than inside it.
 */
export function ViewSwitcher({
  view,
  collections,
  disabled,
  onChange,
}: {
  view: WorkspaceView
  collections: SerializedCollectionDefinition[]
  disabled?: boolean
  onChange: (next: WorkspaceView) => void
}) {
  return (
    <nav className="views" aria-label="Workspace">
      <button
        type="button"
        className="view-item"
        aria-current={view.kind === 'page'}
        disabled={disabled}
        onClick={() => onChange({ kind: 'page' })}
      >
        Page
      </button>
      <button
        type="button"
        className="view-item"
        aria-current={view.kind === 'theme'}
        disabled={disabled}
        onClick={() => onChange({ kind: 'theme' })}
      >
        Palette
      </button>
      <button
        type="button"
        className="view-item"
        aria-current={view.kind === 'media'}
        disabled={disabled}
        onClick={() => onChange({ kind: 'media' })}
      >
        Media
      </button>
      {collections.map((collection) => (
        <button
          key={collection.key}
          type="button"
          className="view-item"
          aria-current={view.kind === 'collection' && view.key === collection.key}
          disabled={disabled}
          onClick={() => onChange({ kind: 'collection', key: collection.key })}
        >
          {collection.label}
        </button>
      ))}
    </nav>
  )
}
