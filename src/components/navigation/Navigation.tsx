import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SECTIONS } from '@/lib/constants'

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
  const { t, i18n } = useTranslation('common')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      // Use native scroll — Lenis intercepts this automatically
      el.scrollIntoView()
    }
  }, [])

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
      <button
        onClick={() => handleClick('hero')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <span className="hidden sm:inline font-mono text-sm font-semibold tracking-widest uppercase">
          <span className="text-crimson-500">nor</span><span className="text-crimson-500">av</span><span className="text-white/45">.</span><span className="text-crimson-500">dev</span>
        </span>
      </button>

      {/* Dot navigation — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id
          return (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
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
                    ? 'bg-crimson-500 shadow-[0_0_8px_rgba(181,26,43,0.6)]'
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
            </button>
          )
        })}
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}
          className="font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
          aria-label="Switch language"
        >
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
      </div>

      {/* Mobile — current section dropdown + language toggle */}
      <div className="md:hidden flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 font-mono text-xs text-white/40 tracking-widest uppercase"
          >
            {t(SECTIONS.find((s) => s.id === activeSection)?.labelKey ?? '')}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 min-w-[180px] rounded-xl border border-white/10 bg-background/90 backdrop-blur-md py-1.5 shadow-xl">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      handleClick(section.id)
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
                          ? 'bg-crimson-500 shadow-[0_0_8px_rgba(181,26,43,0.6)]'
                          : 'bg-white/20'
                        }
                      `}
                    />
                    {t(section.labelKey)}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}
          className="font-mono text-xs tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
          aria-label="Switch language"
        >
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
      </div>
    </nav>
  )
}
