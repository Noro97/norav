import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAppStore } from '@/store/useAppStore'
import { useContent } from '@/content/ContentProvider'
import { useNavigation } from '@/content/navigation'
import { HOME_SLUG, hrefFor, otherLocale, readPath } from '@/content/routing'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { GooeyNavIndicator } from '@/components/ui/effects/GooeyNavIndicator'

/** Site-wide chrome settings, not a block — see `settings.site` in the published snapshot. */
interface SiteSettings {
  navIndicator?: 'dot' | 'gooey'
}

// Map widget section IDs to their parent nav section
const NAV_SECTION_MAP: Record<string, string> = {
  ecommerce: 'logistics',
  omnigrid: 'logistics',
  merch: 'logistics',
  vibecoding: 'overview',
}

export function Navigation() {
  const rawActiveSection = useAppStore((s) => s.activeSection)
  const activeSection = NAV_SECTION_MAP[rawActiveSection] ?? rawActiveSection
  // isRefreshing is set the moment the manifest's checksum disagrees with the
  // one baked into this bundle — that is, when a different menu is already on
  // its way. Painting the bundle's copy in that window shows items that are
  // about to vanish, which is what "hidden item visible for a second" is.
  //
  // Holding the items for that fetch is the lesser fault: a menu that appears a
  // moment late is a load, a menu that offers a section which is not there is a
  // broken promise.
  const { locale, isRefreshing, snapshot } = useContent()
  const reducedMotion = useReducedMotion()
  const siteSettings = snapshot.settings.site as SiteSettings | undefined
  const navIndicator = reducedMotion ? 'dot' : (siteSettings?.navIndicator ?? 'dot')
  const here = readPath(useLocation().pathname).slug
  // The menu is content. An item whose page or section is hidden in the CMS
  // drops out on its own: the item names a page, and the snapshot only carries
  // pages that are published.
  const published = useNavigation(here)
  const sections = isRefreshing ? [] : published
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  /**
   * Scroll rather than navigate when the section is already here. The link keeps
   * its href either way: a menu item should be right-clickable, and a crawler
   * should see where it goes.
   */
  const handleClick = useCallback(
    (event: React.MouseEvent, id: string) => {
      const el = document.getElementById(id)
      if (!el) return
      event.preventDefault()
      // Native scroll — Lenis intercepts this automatically.
      el.scrollIntoView()
      // And the address follows. Scrolling without it left every section of a
      // page at the same URL, so a reader looking at one could neither send it
      // to anyone nor come back to it. replace rather than push: reading down a
      // page is one visit, and the back button should leave the page rather
      // than retrace the sections.
      navigate(`${window.location.pathname}#${id}`, { replace: true })
    },
    [navigate],
  )

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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 backdrop-blur-md bg-tertiary-bg/60 border-b border-tertiary-ink/5">
      {/* Logo */}
      <Link
        to={hrefFor(HOME_SLUG, locale)}
        onClick={(event) => here === HOME_SLUG && handleClick(event, 'hero')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <span className="hidden sm:inline font-mono text-body-sm font-semibold tracking-widest uppercase">
          <span className="text-primary-500">nor</span><span className="text-primary-500">av</span><span className="text-tertiary-ink/45">.</span><span className="text-primary-500">dev</span>
        </span>
      </Link>

      {/* Dot navigation — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          return (
            <Link
              key={section.id}
              to={section.href}
              onClick={(event) => section.anchor && handleClick(event, section.anchor)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-full
                transition-all duration-300 ease-out
                ${isActive && navIndicator === 'dot'
                  ? 'bg-primary-500/10'
                  : 'hover:bg-tertiary-ink/5'
                }
              `}
            >
              {isActive && navIndicator === 'gooey' && <GooeyNavIndicator />}
              <span
                className={`
                  block w-1.5 h-1.5 rounded-full shrink-0
                  transition-all duration-300
                  ${isActive
                    ? 'bg-primary-500 shadow-[0_0_8px_color-mix(in_srgb,_var(--color-primary-500)_60%,_transparent)]'
                    : 'bg-tertiary-ink/25 group-hover:bg-tertiary-ink/40'
                  }
                `}
              />
              <span
                className={`type-label transition-all duration-300
                  ${isActive
                    ? 'text-primary-400'
                    : 'text-tertiary-ink/40 hover:text-tertiary-ink/60'
                  }
                `}
              >
                {section.label}
              </span>
            </Link>
          )
        })}
        <Link
          to={hrefFor(here, otherLocale(locale))}
          className="type-label px-3 py-2 rounded-full text-tertiary-ink/40 hover:text-tertiary-ink/60 hover:bg-tertiary-ink/5 transition-all duration-300"
          aria-label="Switch language"
          hrefLang={otherLocale(locale)}
        >
          {otherLocale(locale).toUpperCase()}
        </Link>
      </div>

      {/* Mobile — current section dropdown + language toggle */}
      <div className="md:hidden flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="type-label flex items-center gap-1.5 text-tertiary-ink/40"
          >
            {sections.find((item) => item.anchor === activeSection)?.label ?? ''}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl border border-tertiary-ink/10 bg-tertiary-bg/90 backdrop-blur-md py-1.5 shadow-xl">
              {sections.map((section) => {
                const isActive = section.anchor !== null && activeSection === section.anchor
                return (
                  <Link
                    key={section.id}
                    to={section.href}
                    onClick={(event) => {
                      if (section.anchor) handleClick(event, section.anchor)
                      setDropdownOpen(false)
                    }}
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
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <Link
          to={hrefFor(here, otherLocale(locale))}
          className="type-label px-3 py-2 rounded-full text-tertiary-ink/40 hover:text-tertiary-ink/60 hover:bg-tertiary-ink/5 transition-all duration-300"
          aria-label="Switch language"
          hrefLang={otherLocale(locale)}
        >
          {otherLocale(locale).toUpperCase()}
        </Link>
      </div>
    </nav>
  )
}
