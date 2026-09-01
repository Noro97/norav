import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SECTIONS } from '@/lib/constants'
import { useCollection, useContent } from './ContentProvider'
import { useAnchorPages } from './ContentProvider'
import { HOME_SLUG, SITE_SLUG, hrefFor } from './routing'

interface NavigationRow {
  /** Localised, so it comes from the entry's content rather than its data. */
  label: string
  page: string
  anchor: string
  external: string
}

export interface NavItem {
  id: string
  label: string
  /** Where it goes: an href for a link, or a hash for a section on this page. */
  href: string
  /** The anchor it points at, when it has one — the nav highlights by this. */
  anchor: string | null
  external: boolean
}

/**
 * The menu, from the CMS.
 *
 * An item stores a page's slug and never an address, so the address is worked
 * out here: renaming a page in the admin moves its menu item with it, and there
 * is no second place holding a URL that can quietly stop matching.
 *
 * Two cases keep a link on the current page rather than sending the reader
 * somewhere. A section that is already here is a scroll. And a section on the
 * `site` page is the chrome — the footer — which renders below every page, so
 * linking to its own address would be a page nobody means to visit.
 *
 * Items whose page no longer exists are dropped rather than rendered as dead
 * links. Hiding a page hides the way to it, which is what an editor means by
 * hiding a page.
 */
export function useNavigation(here: string): NavItem[] {
  const rows = useCollection<NavigationRow>('navigation')
  const { snapshot, locale } = useContent()
  const anchorPages = useAnchorPages()
  const { t } = useTranslation('common')

  return useMemo(() => {
    // Between the deploy that reads the menu and the publish that fills it, the
    // collection is empty — and a site with no menu is worse than a site whose
    // menu is a week old. The list the code used to hold stands in until then.
    // It can go once a publication carries navigation.
    const source: NavigationRow[] =
      rows.length > 0
        ? rows.map((row) => ({ ...row.data, label: row.data.label }))
        : SECTIONS.map((section) => ({
            page: anchorPages.get(section.id) ?? HOME_SLUG,
            anchor: section.id,
            external: '',
            label: t(section.labelKey),
          }))

    const items: NavItem[] = []

    for (const [index, row] of source.entries()) {
      const { label, page, anchor, external } = row

      if (external) {
        items.push({ id: `${index}`, label, href: external, anchor: null, external: true })
        continue
      }

      // An anchor knows its own page; the stored one is the fallback for an
      // item that points at a page rather than at a section of it.
      const target = (anchor && anchorPages.get(anchor)) || page || HOME_SLUG
      const exists = snapshot.pages.some((candidate) => candidate.slug === target)
      if (!exists) continue

      const local = target === here || target === SITE_SLUG
      const hash = anchor ? `#${anchor}` : ''
      items.push({
        id: `${index}`,
        label,
        href: local ? hash || hrefFor(target, locale) : `${hrefFor(target, locale)}${hash}`,
        anchor: anchor || null,
        external: false,
      })
    }

    return items
  }, [rows, snapshot, locale, anchorPages, here, t])
}
