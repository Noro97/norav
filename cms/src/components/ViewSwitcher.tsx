'use client'

import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { ROOT_SLUG } from '@/lib/pages'
import { usePages } from './PagesContext'

export interface PageSummary {
  id: string
  slug: string
  status: string
  /** Per locale: { en: { title, description }, ru: {...} }. */
  seo: Record<string, { title?: string; description?: string }>
  blocks: number
}

export type WorkspaceView =
  | { kind: 'page'; slug: string }
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
  onNewPage,
}: {
  view: WorkspaceView
  collections: SerializedCollectionDefinition[]
  disabled?: boolean
  onChange: (next: WorkspaceView) => void
  onNewPage?: () => void
}) {
  const { pages } = usePages()

  return (
    <nav className="views" aria-label="Workspace">
      {pages.map((page) => (
        <button
          key={page.slug}
          type="button"
          className="view-item"
          aria-current={view.kind === 'page' && view.slug === page.slug}
          disabled={disabled}
          onClick={() => onChange({ kind: 'page', slug: page.slug })}
          title={`${page.blocks} section${page.blocks === 1 ? '' : 's'} · ${page.status}`}
        >
          /{page.slug === ROOT_SLUG ? '' : page.slug}
        </button>
      ))}
      {onNewPage && (
        <button type="button" className="view-item" disabled={disabled} onClick={onNewPage}>
          + Page
        </button>
      )}
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
