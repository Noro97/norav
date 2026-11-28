import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { useContent } from '@/content/ContentProvider'
import { activeNavItem, useNavigation, type NavItem } from '@/content/navigation'
import { HOME_SLUG, hrefFor, readPath } from '@/content/routing'
import { Logo } from '@/components/brand/Logo'

const ITEM =
  'relative rounded-full px-3 py-2 text-body-small transition-colors duration-150 aria-[current=page]:text-tertiary-ink text-tertiary-ink/70 hover:text-tertiary-ink'

/** A menu link: a route through the router, or a plain link out of the site. */
function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const marker = active && (
    // The one place the accent marks state in the chrome: under the page you're on.
    <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary-500" />
  )
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={ITEM}>
      {item.label}
    </a>
  ) : (
    <Link to={item.href} aria-current={active ? 'page' : undefined} className={ITEM}>
      {item.label}
      {marker}
    </Link>
  )
}

/**
 * The name and the three pages, at every width.
 *
 * Three short words fit beside the logo on a 375px screen, so the phone gets
 * the same menu as the desktop: no sheet, and no dropdown labelled with the
 * page you're already on.
 */
export function Navigation() {
  // isRefreshing is set the moment the manifest's checksum disagrees with the
  // one baked into this bundle — that is, when a different menu is already on
  // its way. Holding the items for that fetch is the lesser fault: a menu that
  // blinks is a load, a menu that offers a page which is not there is a
  // broken promise.
  const { locale, isRefreshing } = useContent()
  const { t } = useTranslation('common')
  const here = readPath(useLocation().pathname).slug
  // An item marked for the footer only stays out of this menu.
  const published = useNavigation().filter((item) => !item.footerOnly)
  const items = isRefreshing ? [] : published
  // Which item is lit follows the address: every item is a page.
  const active = activeNavItem(items, here)

  return (
    <header
      data-surface="chrome"
      className="fixed top-0 left-0 right-0 z-50 border-b border-tertiary-ink/[0.06] bg-tertiary-bg/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-gutter-x py-3">
        <Link
          to={hrefFor(HOME_SLUG, locale)}
          aria-label="norav.dev"
          aria-current={here === HOME_SLUG ? 'page' : undefined}
          className="flex items-center text-tertiary-ink transition-opacity hover:opacity-80"
        >
          <Logo className="h-6 w-auto" />
        </Link>

        <nav aria-label={t('nav.label')} className="min-w-0">
          {/* Scrolls rather than spilling if the CMS ever lists more than fits. */}
          <ul className="flex items-center gap-0.5 overflow-x-auto py-1 [scrollbar-width:none] sm:gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <NavLink item={item} active={item === active} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
