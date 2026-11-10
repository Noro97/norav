import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAnchorPages, useCollection, useContent } from './ContentProvider'
import { HOME_SLUG, hrefFor, readPath, SITE_SLUG } from './routing'

interface NavigationRow {
  /** Localised, so it comes from the entry's content rather than its data. */
  label: string
  page: string
  /**
   * Entries written before the menu went route-only still carry the section
   * they used to scroll to. It is read only to follow a section that has
   * moved to another page (resolveTarget); nothing links to it.
   */
  anchor?: string
  external: string
}

export interface NavItem {
  id: string
  label: string
  /** A route in this site, or a full URL when `external`. Never a hash. */
  href: string
  /** The page the item leads to — what decides whether it is the active one. */
  page: string | null
  external: boolean
}

/**
 * The menu, from the CMS.
 *
 * An item stores a page's slug and never an address, so the address is worked
 * out here: renaming a page in the admin moves its menu item with it, and there
 * is no second place holding a URL that can quietly stop matching.
 *
 * Every item is a route. The site used to be one long page, where the menu
 * scrolled to sections and wrote their anchors into the address; each of those
 * sections is a page of its own now, and an address like /about#about said the
 * same thing twice.
 *
 * Items whose page no longer exists are dropped rather than rendered as dead
 * links. Hiding a page hides the way to it, which is what an editor means by
 * hiding a page.
 */
/**
 * Which page an item points at.
 *
 * The page the editor chose, whenever it is there to go to. A page is the
 * whole address now: an item that also names a section (older entries do) does
 * not get sent elsewhere because that section moved — the editor picked a page,
 * and a menu item that silently leads somewhere else is the harder bug to see.
 *
 * The section answers only when the chosen page is missing or empty, which is
 * the one case where following it beats a dead link.
 */
export function resolveTarget(
  pages: { slug: string; blocks: { anchorId?: string | null }[] }[],
  page: string,
  anchor: string,
  anchorPages: Map<string, string>,
): string {
  const chosen = page && pages.find((candidate) => candidate.slug === page)
  if (chosen && chosen.blocks.length > 0) return page
  return anchorPages.get(anchor) || page || HOME_SLUG
}

export function useNavigation(): NavItem[] {
  const rows = useCollection<NavigationRow>('navigation')
  const { snapshot, locale } = useContent()
  const anchorPages = useAnchorPages()

  return useMemo(() => {
    const items: NavItem[] = []

    for (const { id, data } of rows) {
      const { label, page, anchor, external } = data
      if (external) {
        items.push({ id, label, href: external, page: null, external: true })
        continue
      }

      const target = resolveTarget(snapshot.pages, page, anchor ?? '', anchorPages)
      if (!snapshot.pages.some((candidate) => candidate.slug === target)) continue
      // The chrome page is on every page and is never a destination. The menu
      // used to send Contact there, to a terminal; /contact is a page now.
      if (target === SITE_SLUG) continue

      items.push({ id, label, href: hrefFor(target, locale), page: target, external: false })
    }

    return items
  }, [rows, snapshot, locale, anchorPages])
}

/**
 * The item the reader is under: the one whose page is this address, or the
 * nearest page above it — a post at writing/<slug> is under Writing, a case
 * study at projects/merch under Projects. Home only at home, or it would be
 * above everything. When two items lead to one page, the first wins, so the
 * menu never lights up twice.
 */
export function activeNavItem(items: NavItem[], here: string): NavItem | undefined {
  let best: NavItem | undefined
  for (const item of items) {
    const page = item.page
    if (!page) continue
    const under = page === here || (page !== HOME_SLUG && here.startsWith(`${page}/`))
    if (under && (!best || page.length > (best.page?.length ?? 0))) best = item
  }
  return best
}

/**
 * Opens a section by its anchor: the page that holds it, by route.
 *
 * For code that names a section rather than a page — a bento tile knows it
 * opens "merch", not which address the merch case study lives at. The CMS
 * decides that, and moving the section to another page moves the link.
 *
 * When the section is on this very page there is nowhere to route to, so it
 * scrolls there instead — found by the renderer's `data-section`, and without
 * touching the address.
 */
export function useOpenSection(anchor: string): () => void {
  const anchorPages = useAnchorPages()
  const { locale } = useContent()
  const navigate = useNavigate()
  const here = readPath(useLocation().pathname).slug
  const page = anchorPages.get(anchor) ?? HOME_SLUG

  return useCallback(() => {
    if (page === here) {
      document
        .querySelector(`[data-section="${CSS.escape(anchor)}"]`)
        ?.firstElementChild?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    navigate(hrefFor(page, locale))
  }, [anchor, page, here, locale, navigate])
}
