import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/store/useAppStore'
import { SECTIONS } from '@/lib/constants'

export function Navigation() {
  const activeSection = useAppStore((s) => s.activeSection)
  const { t, i18n } = useTranslation('common')

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      // Use native scroll — Lenis intercepts this automatically
      el.scrollIntoView()
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 backdrop-blur-md bg-background/60 border-b border-white/5">
      {/* Logo */}
      <button
        onClick={() => handleClick('hero')}
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <img
          src="/assets/img/logo-new.svg"
          alt="Logo"
          className="h-7 w-7"
        />
        <span className="hidden sm:inline font-mono text-sm font-semibold tracking-widest text-crimson-500 uppercase">
          AM<span className="text-white/30">.</span>dev
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
                  text-[11px] font-mono tracking-wider uppercase
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
          className="font-mono text-[11px] tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
          aria-label="Switch language"
        >
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
      </div>

      {/* Mobile — current section label + language toggle */}
      <div className="md:hidden flex items-center gap-3">
        <span className="font-mono text-[11px] text-white/40 tracking-widest uppercase">
          {t(SECTIONS.find((s) => s.id === activeSection)?.labelKey ?? '')}
        </span>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}
          className="font-mono text-[11px] tracking-wider uppercase px-3 py-2 rounded-full text-white/40 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
          aria-label="Switch language"
        >
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
      </div>
    </nav>
  )
}
