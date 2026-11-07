import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useContent } from '@/content/ContentProvider'
import { activeNavItem, useNavigation, type NavItem } from '@/content/navigation'
import { HOME_SLUG, hrefFor, readPath } from '@/content/routing'
import { Logo } from '@/components/brand/Logo'

/** A menu link: a route through the router, or a plain link out of the site. */
function NavLink({
  item,
  className,
  onClick,
  children,
}: {
  item: NavItem
  className: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
      {children}
    </a>
  ) : (
    <Link to={item.href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export function Navigation() {
  // isRefreshing is set the moment the manifest's checksum disagrees with the
  // one baked into this bundle — that is, when a different menu is already on
  // its way. Holding the items for that fetch is the lesser fault: a menu that
  // blinks is a load, a menu that offers a section which is not there is a
  // broken promise.
  const { locale, isRefreshing } = useContent()
  const here = readPath(useLocation().pathname).slug
  // The menu is content. An item whose page or section is hidden in the CMS
  // drops out on its own: the item names a page, and the snapshot only carries
  // pages that are published.
  const published = useNavigation()
  const sections = isRefreshing ? [] : published
  // Which item is lit is a question about the address, not the scroll
  // position: every item is a page, so the reader is under exactly one.
  const active = activeNavItem(sections, here)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [dropdownOpen])

  // Close dropdown on scroll
  useEffect(() => {
    if (!dropdownOpen) return
    const onScroll = () => setDropdownOpen(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dropdownOpen])

  return (
    <nav
      data-surface="chrome"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 backdrop-blur-md bg-tertiary-bg/60 border-b border-tertiary-ink/5"
    >
      {/* Logo */}
      <Link
        to={hrefFor(HOME_SLUG, locale)}
        aria-label="norav.dev"
        className="flex items-center gap-2 text-tertiary-ink hover:opacity-80 transition-opacity"
      >
        {/* The mark carries its own dot, so the domain is only the word
            after it: [NORAV.] DEV. */}
        <Logo className="h-6 w-auto" />
        <span className="font-mono text-body-small font-semibold tracking-widest uppercase text-primary-500">
          dev
        </span>
      </Link>

      {/* Dot navigation — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {sections.map((section) => {
          const isActive = section === active
          return (
            <NavLink
              key={section.id}
              item={section}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-full
                transition-colors duration-150
                ${isActive
                  ? 'bg-primary-500/10'
                  : 'hover:bg-tertiary-ink/5'
                }
              `}
            >
              <span
                className={`
                  block w-1.5 h-1.5 rounded-full shrink-0
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-primary-500 shadow-[0_0_8px_color-mix(in_srgb,_var(--color-primary-500)_60%,_transparent)]'
                    : 'bg-tertiary-ink/25 group-hover:bg-tertiary-ink/40'
                  }
                `}
              />
              <span
                className={`type-label transition-colors duration-150
                  ${isActive
                    ? 'text-primary-400'
                    : 'text-tertiary-ink/40 hover:text-tertiary-ink/60'
                  }
                `}
              >
                {section.label}
              </span>
            </NavLink>
          )
        })}
      </div>

      {/* Mobile — current section dropdown */}
      <div className="md:hidden flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="type-label flex items-center gap-1.5 text-tertiary-ink/40"
          >
            {active?.label ?? ''}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div
              data-surface="chrome"
              className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl border border-tertiary-ink/10 bg-tertiary-bg/90 backdrop-blur-md py-1.5 shadow-xl"
            >
              {sections.map((section) => {
                const isActive = section === active
                return (
                  <NavLink
                    key={section.id}
                    item={section}
                    onClick={() => setDropdownOpen(false)}
                    className={`type-label flex items-center gap-2.5 w-full px-4 py-2.5 text-left
                     
                      transition-colors duration-150
                      ${isActive
                        ? 'text-primary-400'
                        : 'text-tertiary-ink/40 hover:text-tertiary-ink/60 hover:bg-tertiary-ink/5'
                      }
                    `}
                  >
                    <span
                      className={`
                        block w-1.5 h-1.5 rounded-full shrink-0
                        ${isActive
                          ? 'bg-primary-500 shadow-[0_0_8px_color-mix(in_srgb,_var(--color-primary-500)_60%,_transparent)]'
                          : 'bg-tertiary-ink/20'
                        }
                      `}
                    />
                    {section.label}
                  </NavLink>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
