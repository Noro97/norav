'use client'

import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { ROOT_SLUG, SITE_SLUG } from '@/lib/pages'
import { usePages } from './PagesContext'
import {
  HomeIcon,
  MediaIcon,
  MenuIcon,
  PageIcon,
  PaletteIcon,
  PlusIcon,
  RowsIcon,
  SiteIcon,
  PenIcon,
  ProfileIcon,
} from './icons'

export interface PageSummary {
  id: string
  slug: string
  status: string
  /** Per locale: { en: { title, description }, ru: {...} }. */
  seo: Record<string, { title?: string; description?: string }>
  blocks: number
  /** Menu entries that link here — each one stops a delete until it goes too. */
  menuItems: number
  /** Edited since the last publish — work that is saved but not on the site. */
  changed: boolean
}

export type WorkspaceView =
  | { kind: 'page'; slug: string }
  | { kind: 'collection'; key: string }
  | { kind: 'theme' }
  | { kind: 'media' }
  | { kind: 'profile' }
  /** The writing: every post, and the one open in the editor if any. */
  | { kind: 'posts'; id?: string }

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
    <div className="views">
      <nav aria-label="Pages">
        <p className="views-heading">Pages</p>
        {pages.map((page) => {
          // work/merch is a child of work and reads as one. A wrapping row of
          // thirteen slugs was a pile; a site map is a list, one page per line,
          // children under their parent.
          const segments = page.slug.split('/')
          const depth = segments.length - 1
          const isRoot = page.slug === ROOT_SLUG
          const isSite = page.slug === SITE_SLUG

          return (
            <button
              key={page.slug}
              type="button"
              className="view-item"
              aria-current={view.kind === 'page' && view.slug === page.slug}
              disabled={disabled}
              onClick={() => onChange({ kind: 'page', slug: page.slug })}
              style={depth ? { paddingInlineStart: `${10 + depth * 16}px` } : undefined}
              title={`/${isRoot ? '' : page.slug} · ${page.status}`}
            >
              <span className="view-icon">
                {isRoot ? <HomeIcon /> : isSite ? <SiteIcon /> : <PageIcon />}
              </span>
              <span className="view-name">{isRoot ? '/' : segments[depth]}</span>
              <span className="view-meta">
                {page.changed && page.blocks > 0 && (
                  <em className="view-dot" title="Edited since the last publish" />
                )}
                {isSite ? 'every page' : page.blocks === 0 ? 'empty' : page.blocks}
              </span>
            </button>
          )
        })}

        {onNewPage && (
          <button
            type="button"
            className="view-item view-add"
            disabled={disabled}
            onClick={onNewPage}
          >
            <span className="view-icon">
              <PlusIcon />
            </span>
            <span className="view-name">New page</span>
          </button>
        )}
      </nav>

      <nav aria-label="Library">
        <p className="views-heading">Library</p>
        <button
          type="button"
          className="view-item"
          aria-current={view.kind === 'posts'}
          disabled={disabled}
          onClick={() => onChange({ kind: 'posts' })}
        >
          <span className="view-icon">
            <PenIcon />
          </span>
          <span className="view-name">Posts</span>
        </button>
        <button
          type="button"
          className="view-item"
          aria-current={view.kind === 'profile'}
          disabled={disabled}
          onClick={() => onChange({ kind: 'profile' })}
        >
          <span className="view-icon">
            <ProfileIcon />
          </span>
          <span className="view-name">Profile</span>
        </button>
        <button
          type="button"
          className="view-item"
          aria-current={view.kind === 'theme'}
          disabled={disabled}
          onClick={() => onChange({ kind: 'theme' })}
        >
          <span className="view-icon">
            <PaletteIcon />
          </span>
          <span className="view-name">Palette</span>
        </button>
        <button
          type="button"
          className="view-item"
          aria-current={view.kind === 'media'}
          disabled={disabled}
          onClick={() => onChange({ kind: 'media' })}
        >
          <span className="view-icon">
            <MediaIcon />
          </span>
          <span className="view-name">Media</span>
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
            <span className="view-icon">
              {collection.key === 'navigation' ? <MenuIcon /> : <RowsIcon />}
            </span>
            <span className="view-name">{collection.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
