import { useTranslation } from 'react-i18next'
import { Mail, Github, Linkedin, Send, ArrowUpRight, type LucideIcon } from 'lucide-react'

const LINKS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/Noro97' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/norayravetisyan/' },
  { icon: Send, label: 'Telegram', href: 'https://t.me/antarber' },
]

export function ContactCTA() {
  const { t } = useTranslation('extra')

  return (
    <section className="relative px-6 md:px-16 py-24">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-crimson-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl px-8 py-14 md:px-14 md:py-16 text-center">
          {/* Ambient glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none bg-crimson-500/10" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/60 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-xs text-white/50 tracking-[0.2em] uppercase">
                {t('contact.availability')}
              </span>
            </div>

            <span className="label-mono">{t('contact.label')}</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-5">
              {t('contact.title')}
            </h2>
            <p className="text-white/45 text-base max-w-xl mx-auto mb-9 leading-relaxed">
              {t('contact.body')}
            </p>

            <a
              href="mailto:noroavetisyan@gmail.com"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-crimson-500/90 hover:bg-crimson-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-[0_0_30px_-6px_rgba(181,26,43,0.6)]"
            >
              <Mail className="w-4 h-4" strokeWidth={2} />
              {t('contact.email')}
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <div className="flex items-center justify-center gap-3 mt-9">
              {LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/45 hover:text-crimson-400 hover:border-crimson-500/30 transition-all duration-300"
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
