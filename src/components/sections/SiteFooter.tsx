import { Link } from 'react-router'
import { ArrowUpRight, Github, Globe, Linkedin, Mail, Send, type LucideIcon } from 'lucide-react'
import { useBlock, useContent } from '@/content/ContentProvider'
import { useNavigation } from '@/content/navigation'
import { Logo } from '@/components/brand/Logo'
import { HOME_SLUG, hrefFor } from '@/content/routing'
import type { SiteFooterContent, SiteFooterSettings } from '@norav/content-schema'

const ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  telegram: Send,
  website: Globe,
}

const LINK = 'type-label text-tertiary-ink/45 hover:text-tertiary-ink transition-colors'

export function SiteFooter() {
  const block = useBlock<SiteFooterContent, SiteFooterSettings>('site_footer')
  const { locale } = useContent()
  // The same list the menu draws, so the two cannot disagree: every item a
  // route, exactly as the menu resolves them.
  const links = useNavigation()
  if (!block) return null
  const { content, settings } = block

  return (
    <footer className="relative px-gutter-x pt-16 pb-10 border-t border-tertiary-ink/[0.06]">
      <div className="relative z-10 w-full max-w-content mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1.2fr_1fr]">
          <div>
            <Link
              to={hrefFor(HOME_SLUG, locale)}
              aria-label="norav.dev"
              className="inline-flex items-center gap-2 text-tertiary-ink hover:opacity-80 transition-opacity"
            >
              <Logo className="h-7 w-auto" />
              <span className="font-mono text-body-small font-semibold tracking-widest uppercase text-primary-500">
                dev
              </span>
            </Link>
            {content.tagline && (
              <p className="mt-4 text-body-small text-tertiary-ink/45 max-w-sm">{content.tagline}</p>
            )}
          </div>

          <nav aria-label={content.linksLabel}>
            {content.linksLabel && <span className="label-mono block mb-4">{content.linksLabel}</span>}
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5">
              {links.map((item) =>
                item.external ? (
                  <li key={item.id}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className={LINK}>{item.label}</a>
                  </li>
                ) : (
                  <li key={item.id}>
                    <Link to={item.href} className={LINK}>{item.label}</Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div>
            {content.reachLabel && <span className="label-mono block mb-4">{content.reachLabel}</span>}
            <a href={`mailto:${settings.email}`} className="group inline-flex items-center gap-1.5 font-mono text-body-small text-tertiary-ink/70 hover:text-tertiary-ink transition-colors">
              <Mail className="w-4 h-4" strokeWidth={1.75} aria-hidden />
              {content.emailLabel}
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
            <div className="flex items-center gap-3 mt-5">
              {content.socials.map((social) => {
                const Icon = ICONS[social.icon] ?? Globe
                return (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border border-tertiary-ink/[0.08] bg-tertiary-ink/[0.02] flex items-center justify-center text-tertiary-ink/45 hover:text-primary-400 hover:border-primary-500/30 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
