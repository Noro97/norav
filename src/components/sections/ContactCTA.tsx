import { ArrowUpRight, Github, Globe, Linkedin, Mail, Send, type LucideIcon } from 'lucide-react'
import { useBlock } from '@/content/ContentProvider'
import type { ContactCtaContent, ContactCtaSettings } from '@norav/content-schema'

/** The social icons the CMS offers, resolved to components. */
const ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  telegram: Send,
  email: Mail,
  website: Globe,
}

export function ContactCTA() {
  const block = useBlock<ContactCtaContent, ContactCtaSettings>('contact_cta')
  if (!block) return null
  const { content, settings } = block

  return (
    <section className="relative px-gutter-x py-24">
      <div className="relative z-10 w-full max-w-content mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-tertiary-ink/[0.08] bg-gradient-to-br from-primary-500/[0.06] via-tertiary-ink/[0.02] to-transparent backdrop-blur-xl px-8 py-14 md:px-14 md:py-16 text-center">
          {/* Ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-primary-500/10" />

          <div className="relative">
            {settings.showAvailability && (
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="inline-flex h-2 w-2 rounded-full bg-status-success" />
                <span className="type-label text-tertiary-ink/50">
                  {content.availability}
                </span>
              </div>
            )}

            {/* block: the availability badge above is inline-flex, and an inline
                eyebrow would share its line. */}
            <span className="label-mono block">{content.label}</span>
            <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-5">
              {content.title}
            </h2>
            <p className="text-tertiary-ink/45 text-body-regular max-w-xl mx-auto mb-9 leading-relaxed">
              {content.body}
            </p>

            <a
              href={`mailto:${settings.email}`}
              className="press group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-primary-500/90 hover:bg-primary-500 text-tertiary-ink font-medium text-body-small transition-all duration-300 hover:shadow-[0_0_30px_-6px_color-mix(in_srgb,_var(--color-primary-500)_60%,_transparent)]"
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              {content.emailLabel}
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <div className="flex items-center justify-center gap-3 mt-9">
              {content.socials.map((social) => {
                const Icon = ICONS[social.icon] ?? Globe
                return (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="press w-11 h-11 rounded-full border border-tertiary-ink/[0.08] bg-tertiary-ink/[0.02] flex items-center justify-center text-tertiary-ink/45 hover:text-primary-400 hover:border-primary-500/30 transition-all duration-300"
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
