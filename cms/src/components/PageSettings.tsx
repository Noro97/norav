'use client'

import { useState } from 'react'
import type { Locale } from '@norav/content-schema'
import { Modal } from './Modal'
import { usePages } from './PagesContext'
import { ROOT_SLUG, SLUG } from '@/lib/pages'

type Seo = Record<string, { title?: string; description?: string }>

/**
 * Everything about a page that is not its sections: its address, whether it is
 * published, and what a search engine shows for it.
 *
 * Deleting is here too, behind the same dialog rather than a button on the
 * page list — a page is a URL someone may already have followed, and removing
 * one should take opening its settings first.
 */
export function PageSettings({
  slug,
  status,
  seo,
  locales,
  blocks,
  menuItems,
  onClose,
  onSaved,
  onDeleted,
}: {
  slug: string
  status: string
  seo: Seo
  locales: readonly Locale[]
  blocks: number
  menuItems: number
  onClose: () => void
  onSaved: (slug: string) => void
  onDeleted: () => void
}) {
  const { reload } = usePages()
  const [draftSlug, setDraftSlug] = useState(slug)
  const [draftStatus, setDraftStatus] = useState(status)
  const [draftSeo, setDraftSeo] = useState<Seo>(seo ?? {})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRoot = slug === ROOT_SLUG
  const slugValid = SLUG.test(draftSlug)

  function setField(locale: string, field: 'title' | 'description', value: string) {
    setDraftSeo((prev) => ({ ...prev, [locale]: { ...prev[locale], [field]: value } }))
  }

  async function save() {
    setBusy(true)
    setError(null)
    const response = await fetch(`/api/admin/pages/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(draftSlug !== slug ? { slug: draftSlug } : {}),
        ...(draftStatus !== status ? { status: draftStatus } : {}),
        seo: draftSeo,
      }),
    })
    const body = await response.json().catch(() => null)
    setBusy(false)

    if (!response.ok) {
      setError(body?.error?.message ?? 'That did not work.')
      return
    }
    await reload()
    onSaved(body.data.page.slug)
  }

  const menuLabel = `${menuItems} menu item${menuItems === 1 ? '' : 's'}`
  // Sections are refused outright — losing them should take a step of its own.
  // Menu items are not: the only sensible thing to do with a link to a page
  // being deleted is remove it, so the dialog offers to, and asks.
  const deleteBlocked = blocks > 0

  async function remove() {
    const question =
      menuItems > 0
        ? `Delete /${slug} and remove the ${menuLabel} that link${menuItems === 1 ? 's' : ''} to it?`
        : `Delete /${slug}?`
    if (!window.confirm(question)) return

    setBusy(true)
    setError(null)
    const response = await fetch(
      `/api/admin/pages/${slug}${menuItems > 0 ? '?unlink=1' : ''}`,
      { method: 'DELETE' },
    )
    const body = await response.json().catch(() => null)
    setBusy(false)

    if (!response.ok) {
      setError(body?.error?.message ?? 'That did not work.')
      return
    }
    await reload()
    onDeleted()
  }

  return (
    <Modal
      title={`/${isRoot ? '' : slug}`}
      onClose={onClose}
      footer={
        <>
          {!isRoot && (
            <button
              type="button"
              className="ghost"
              onClick={remove}
              disabled={busy || deleteBlocked}
              title={deleteBlocked ? 'Move or delete its sections first' : undefined}
            >
              Delete page
            </button>
          )}
          <button type="button" className="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="primary" onClick={save} disabled={busy || !slugValid}>
            Save
          </button>
        </>
      }
    >
      {error && <p className="feedback err">{error}</p>}

      <label className="field">
        <span>Address</span>
        <input
          value={draftSlug}
          onChange={(event) => setDraftSlug(event.target.value)}
          disabled={isRoot || busy}
          spellCheck={false}
        />
        <small className="subtle">
          {isRoot
            ? 'This page is the site’s front door and keeps its name.'
            : draftSlug && !slugValid
              ? 'Lowercase words, separated by - and /.'
              : `The site serves it at /${draftSlug}`}
        </small>
      </label>

      <label className="field">
        <span>Status</span>
        <select
          value={draftStatus}
          onChange={(event) => setDraftStatus(event.target.value)}
          disabled={busy}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      {locales.map((locale) => (
        <fieldset key={locale} className="field">
          <legend>Search listing · {locale.toUpperCase()}</legend>
          <input
            placeholder="Title — the first section’s own title if left empty"
            value={draftSeo[locale]?.title ?? ''}
            onChange={(event) => setField(locale, 'title', event.target.value)}
            disabled={busy}
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={draftSeo[locale]?.description ?? ''}
            onChange={(event) => setField(locale, 'description', event.target.value)}
            disabled={busy}
          />
        </fieldset>
      ))}

      {!isRoot && deleteBlocked && (
        <p className="subtle">
          Holds {blocks} section{blocks === 1 ? '' : 's'}. Move or delete them before deleting the
          page.
        </p>
      )}
      {!isRoot && !deleteBlocked && menuItems > 0 && (
        <p className="subtle">
          Linked from {menuLabel}. Deleting the page removes {menuItems === 1 ? 'it' : 'them'} from
          the menu too.
        </p>
      )}
    </Modal>
  )
}
