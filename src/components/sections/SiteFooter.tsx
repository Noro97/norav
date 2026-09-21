import { Link, useLocation } from 'react-router'
import { ArrowUpRight, Github, Globe, Linkedin, Mail, Send, type LucideIcon } from 'lucide-react'
import { useBlock, useContent } from '@/content/ContentProvider'
import { useNavigation } from '@/content/navigation'
import { HOME_SLUG, hrefFor, readPath } from '@/content/routing'
import type { SiteFooterContent, SiteFooterSettings } from '@norav/content-schema'

const ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  telegram: Send,
  website: Globe,
}

const LINK = 'font-mono text-xs uppercase tracking-[0.15em] text-white/45 hover:text-white transition-colors'

export function SiteFooter({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<SiteFooterContent, SiteFooterSettings>('site_footer')
  const { locale } = useContent()
  const here = readPath(useLocation().pathname).slug
  // The same list the menu draws, so the two cannot disagree. Items are
  // page-relative on purpose: a hash for a section on this page, an address for
  // one elsewhere, exactly as the menu resolves them.
  const links = useNavigation(here)
  if (!block) return null
  const { content, settings } = block

  return (
    <footer {...(anchorId ? { id: anchorId } : {})} className="relative px-6 md:px-16 pt-16 pb-10 border-t border-white/[0.06]">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to={hrefFor(HOME_SLUG, locale)} className="inline-block font-mono text-sm font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity">
              <span className="text-crimson-500">norav</span>
              <span className="text-white/45">.</span>
              <span className="text-crimson-500">dev</span>
            </Link>
            {content.tagline && (
              <p className="mt-4 text-sm text-white/45 leading-relaxed max-w-sm">{content.tagline}</p>
            )}
          </div>

          <nav aria-label={content.linksLabel}>
            {content.linksLabel && <span className="label-mono block mb-4">{content.linksLabel}</span>}
            <ul className="space-y-2.5">
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
            <a href={`mailto:${settings.email}`} className={`${LINK} group inline-flex items-center gap-1.5 normal-case tracking-normal text-sm text-white/70`}>
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
                    className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/45 hover:text-crimson-400 hover:border-crimson-500/30 transition-all duration-300"
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
