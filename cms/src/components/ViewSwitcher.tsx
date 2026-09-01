'use client'

import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { ROOT_SLUG, SITE_SLUG } from '@/lib/pages'
import { usePages } from './PagesContext'

export interface PageSummary {
  id: string
  slug: string
  status: string
  /** Per locale: { en: { title, description }, ru: {...} }. */
  seo: Record<string, { title?: string; description?: string }>
  blocks: number
  /** Edited since the last publish — work that is saved but not on the site. */
  changed: boolean
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
      {pages.map((page) => {
        // work/merch reads as a child of work, so it is shown as one: the list
        // is a site map, and a flat run of slugs is the one thing a site map
        // must not be.
        const depth = page.slug.split('/').length - 1
        const leaf = page.slug.split('/').pop()!
        return (
          <button
            key={page.slug}
            type="button"
            className="view-item"
            aria-current={view.kind === 'page' && view.slug === page.slug}
            disabled={disabled}
            onClick={() => onChange({ kind: 'page', slug: page.slug })}
            style={depth ? { paddingLeft: `${0.75 + depth * 0.85}rem` } : undefined}
            title={
              page.slug === SITE_SLUG
                ? 'Renders below every page'
                : `/${page.slug === ROOT_SLUG ? '' : page.slug} · ${page.blocks} section${page.blocks === 1 ? '' : 's'} · ${page.status}`
            }
          >
            {page.slug === ROOT_SLUG ? '/' : depth ? leaf : `/${page.slug}`}
            {page.blocks === 0 && <em className="view-note">empty</em>}
            {page.slug === SITE_SLUG && <em className="view-note">every page</em>}
            {page.changed && page.blocks > 0 && (
              <em className="view-dot" title="Edited since the last publish" />
            )}
          </button>
        )
      })}
      {onNewPage && (
        <button type="button" className="view-item view-add" disabled={disabled} onClick={onNewPage}>
          + New page
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
