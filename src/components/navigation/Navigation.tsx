import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useAppStore } from '@/store/useAppStore'
import { SECTIONS } from '@/lib/constants'
import { useAnchorPages, useContent } from '@/content/ContentProvider'
import { HOME_SLUG, SITE_SLUG, hrefFor, otherLocale, readPath } from '@/content/routing'

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
  const { t } = useTranslation('common')
  // A section hidden in the CMS is on no page, so it must not be in the menu.
  const anchorPages = useAnchorPages()
  const sections = SECTIONS.filter((section) => anchorPages.has(section.id))
  const { locale } = useContent()
  const here = readPath(useLocation().pathname).slug

  /**
   * Where a menu item points. A section on this page is a hash; a section on
   * another page is that page's address plus the hash, so the browser lands and
   * scrolls in one move.
   */
  const linkTo = useCallback(
    (id: string) => {
      const page = anchorPages.get(id) ?? HOME_SLUG
      // A section in the site chrome renders below whatever page you are on, so
      // it is always here. Linking to /site would send a reader to the footer's
      // own address, which is a page nobody means to visit.
      const elsewhere = page !== here && page !== SITE_SLUG
      return elsewhere ? `${hrefFor(page, locale)}#${id}` : `#${id}`
    },
    [anchorPages, here, locale],
  )
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
    },
    [],
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 backdrop-blur-md bg-background/60 border-b border-white/5">
      {/* Logo */}
      <Link
        to={hrefFor(HOME_SLUG, locale)}
        onClick={(event) => here === HOME_SLUG && handleClick(event, 'hero')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <span className="hidden sm:inline font-mono text-sm font-semibold tracking-widest uppercase">
          <span className="text-crimson-500">nor</span><span className="text-crimson-500">av</span><span className="text-white/45">.</span><span className="text-crimson-500">dev</span>
        </span>
      </Link>

      {/* Dot navigation — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          return (
            <Link
              key={section.id}
              to={linkTo(section.id)}
              onClick={(event) => handleClick(event, section.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-full
                transition-all duration-300 ease-out
                ${isActive
                  ? 'bg-crimson-500/10'
                  : 'hover:bg-white/5'
                }
              `}
            >
              <span
                className={`
                  block w-1.5 h-1.5 rounded-full shrink-0
                  transition-all duration-300
                  ${isActive
                    ? 'bg-crimson-500 shadow-[0_0_8px_color-mix(in_srgb,_var(--color-crimson-500)_60%,_transparent)]'
                    : 'bg-white/25 group-hover:bg-white/40'
                  }
                `}
              />
              <span
                className={`
                  text-xs font-mono tracking-wider uppercase
                  transition-all duration-300
                  ${isActive
                    ? 'text-crimson-400'
                    : 'text-white/40 hover:text-white/60'
                  }
                `}
              >
                {t(section.labelKey)}
              </span>
            </Link>
          )
        })}
        <Link
          to={hrefFor(here, otherLocale(locale))}
          className="font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
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
            className="flex items-center gap-1.5 font-mono text-xs text-white/40 tracking-widest uppercase"
          >
            {t(sections.find((s) => s.id === activeSection)?.labelKey ?? '')}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl border border-white/10 bg-background/90 backdrop-blur-md py-1.5 shadow-xl">
              {sections.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <Link
                    key={section.id}
                    to={linkTo(section.id)}
                    onClick={(event) => {
                      handleClick(event, section.id)
                      setDropdownOpen(false)
                    }}
                    className={`
                      flex items-center gap-2.5 w-full px-4 py-2.5 text-left
                      font-mono text-xs tracking-wider uppercase
                      transition-colors duration-150
                      ${isActive
                        ? 'text-crimson-400'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                      }
                    `}
                  >
                    <span
                      className={`
                        block w-1.5 h-1.5 rounded-full shrink-0
                        ${isActive
                          ? 'bg-crimson-500 shadow-[0_0_8px_color-mix(in_srgb,_var(--color-crimson-500)_60%,_transparent)]'
                          : 'bg-white/20'
                        }
                      `}
                    />
                    {t(section.labelKey)}
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <Link
          to={hrefFor(here, otherLocale(locale))}
          className="font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
          aria-label="Switch language"
          hrefLang={otherLocale(locale)}
        >
          {otherLocale(locale).toUpperCase()}
        </Link>
      </div>
    </nav>
  )
}
