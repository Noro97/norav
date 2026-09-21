import { ArrowUpRight, Check, FileText, Linkedin, Mail } from 'lucide-react'
import { useBlock } from '@/content/ContentProvider'
import type { RecruiterCtaContent, RecruiterCtaSettings } from '@norav/content-schema'

const PRIMARY =
  'group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/90 hover:bg-primary-500 text-primary-fg font-medium text-body-sm transition-all duration-300 hover:shadow-[0_0_30px_-6px_color-mix(in_srgb,_var(--color-primary-500)_60%,_transparent)]'

const SECONDARY =
  'group inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-tertiary-ink/[0.1] bg-tertiary-ink/[0.02] text-tertiary-ink/70 hover:text-tertiary-ink hover:border-primary-500/40 font-medium text-body-sm transition-all duration-300'

export function RecruiterCTA({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<RecruiterCtaContent, RecruiterCtaSettings>('recruiter_cta')
  if (!block) return null
  const { content, settings } = block

  return (
    <section {...(anchorId ? { id: anchorId } : {})} className="relative px-6 md:px-16 py-16">
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl px-6 py-10 md:px-12 md:py-12">
          <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none bg-primary-500/10" />

          <div className="relative grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12 items-center">
            <div>
              <span className="label-mono block">{content.label}</span>
              <h2 className="font-display text-display-sm font-black text-tertiary-ink mt-3">
                {content.title}
              </h2>
              <ul className="mt-6 space-y-3">
                {content.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-tertiary-ink/60 text-body-md">
                    <Check className="mt-1.5 w-4 h-4 shrink-0 text-primary-400" strokeWidth={2.25} aria-hidden />
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap md:flex-col md:items-stretch gap-3 md:pl-10 md:border-l md:border-tertiary-ink/[0.06]">
              {settings.cvHref && (
                <a href={settings.cvHref} download className={`${PRIMARY} md:justify-center`}>
                  <FileText className="w-4 h-4" strokeWidth={2} />
                  {content.cvLabel}
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              <a href={`mailto:${settings.email}`} className={`${SECONDARY} md:justify-center`}>
                <Mail className="w-4 h-4" strokeWidth={1.75} />
                {content.emailLabel}
              </a>
              <a
                href={settings.linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${SECONDARY} md:justify-center`}
              >
                <Linkedin className="w-4 h-4" strokeWidth={1.75} />
                {content.linkedinLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
