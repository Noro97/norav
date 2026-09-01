import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SECTIONS } from '@/lib/constants'
import { useAnchorPages, useCollection, useContent } from './ContentProvider'
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
/**
 * Which page an item points at.
 *
 * The editor's choice first. The anchor index answers only when the chosen page
 * does not hold that section — which means the section moved, and following it
 * beats pointing at where it used to be.
 *
 * The other order made the Page field inert: every item has an anchor, so the
 * index would have decided all of them and the control would have changed
 * nothing.
 */
export function resolveTarget(
  pages: { slug: string; blocks: { anchorId?: string | null }[] }[],
  page: string,
  anchor: string,
  anchorPages: Map<string, string>,
): string {
  const holdsAnchor =
    !anchor ||
    pages.some(
      (candidate) =>
        candidate.slug === page && candidate.blocks.some((block) => block.anchorId === anchor),
    )
  return (page && holdsAnchor ? page : anchorPages.get(anchor)) || page || HOME_SLUG
}

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
    const source: (NavigationRow & { id: string })[] =
      rows.length > 0
        ? rows.map((row) => ({ ...row.data, id: row.id }))
        : SECTIONS.map((section, index) => ({
            id: `fallback-${index}`,
            page: anchorPages.get(section.id) ?? HOME_SLUG,
            anchor: section.id,
            external: '',
            label: t(section.labelKey),
          }))

    const items: NavItem[] = []

    for (const { id, label, page, anchor, external } of source) {
      if (external) {
        items.push({ id, label, href: external, anchor: null, external: true })
        continue
      }

      const target = resolveTarget(snapshot.pages, page, anchor, anchorPages)

      const exists = snapshot.pages.some((candidate) => candidate.slug === target)
      if (!exists) continue

      const local = target === here || target === SITE_SLUG
      const hash = anchor ? `#${anchor}` : ''
      items.push({
        id,
        label,
        href: local ? hash || hrefFor(target, locale) : `${hrefFor(target, locale)}${hash}`,
        anchor: anchor || null,
        external: false,
      })
    }

    return items
  }, [rows, snapshot, locale, anchorPages, here, t])
}
