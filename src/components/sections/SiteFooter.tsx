import { Link } from 'react-router'
import { useBlock, useContent } from '@/content/ContentProvider'
import { useNavigation } from '@/content/navigation'
import { Logo } from '@/components/brand/Logo'
import { HOME_SLUG, hrefFor } from '@/content/routing'
import { TERMINAL_ID, useAppStore } from '@/store/useAppStore'
import type { BlockComponentProps } from '@/content/blocks'
import type { SiteFooterContent, SiteFooterSettings } from '@norav/content-schema'

const LINK = 'break-words text-body-small text-tertiary-ink/70 hover:text-tertiary-ink transition-colors duration-150'

/**
 * The bottom of every page: where else to go, how to reach me, how the site is
 * built, and the button that opens the terminal. The page links are the menu's
 * own list, so the two can't disagree.
 */
export function SiteFooter({ blockId }: BlockComponentProps) {
  const block = useBlock<SiteFooterContent, SiteFooterSettings>('site_footer', blockId)
  const { locale, snapshot } = useContent()
  const links = useNavigation()
  const terminalOpen = useAppStore((state) => state.terminalOpen)
  const setTerminalOpen = useAppStore((state) => state.setTerminalOpen)
  if (!block) return null
  const { content, settings } = block
  // The button only when there is a terminal to open.
  const hasTerminal = Boolean(
    content.terminalOpenLabel &&
      snapshot.pages.some((page) => page.blocks.some((candidate) => candidate.type === 'terminal_footer')),
  )

  return (
    <footer className="relative px-gutter-x pt-16 pb-12 border-t border-tertiary-ink/10">
      <div className="w-full max-w-content mx-auto">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link
              to={hrefFor(HOME_SLUG, locale)}
              aria-label="norav.dev"
              className="inline-flex items-center gap-2 text-tertiary-ink hover:opacity-80 transition-opacity"
            >
              <Logo className="h-7 w-auto" />
            </Link>
            {content.tagline && <p className="mt-4 text-body-small text-tertiary-ink/70 max-w-sm">{content.tagline}</p>}
            {content.colophon && <p className="mt-4 text-caption text-tertiary-ink/55 max-w-sm leading-relaxed">{content.colophon}</p>}
          </div>

          <nav aria-label={content.linksLabel || undefined} className="md:col-span-3">
            {content.linksLabel && <p className="label-mono mb-4">{content.linksLabel}</p>}
            <ul className="space-y-2.5">
              {links.map((item) => (
                <li key={item.id}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.href} className={LINK}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            {content.reachLabel && <p className="label-mono mb-4">{content.reachLabel}</p>}
            <ul className="space-y-2.5">
              <li>
                <a href={`mailto:${settings.email}`} className={LINK}>
                  {content.emailLabel}
                </a>
              </li>
              {content.cvLabel && settings.cvHref && (
                <li>
                  <a href={settings.cvHref} className={LINK}>
                    {content.cvLabel}
                  </a>
                </li>
              )}
              {content.socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {hasTerminal && (
          <div className="mt-12">
            <button
              type="button"
              aria-expanded={terminalOpen}
              aria-controls={TERMINAL_ID}
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="font-mono text-body-small text-tertiary-ink/70 hover:text-tertiary-ink transition-colors duration-150"
            >
              {terminalOpen ? content.terminalCloseLabel || content.terminalOpenLabel : content.terminalOpenLabel}
            </button>
          </div>
        )}
      </div>
    </footer>
  )
}
