import { Fragment, useRef, useState } from 'react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import { toneOf, type Tone } from '@/content/accent'
import { EffectCard } from '@/components/ui/effects/EffectCard'
import type { AboutContent, AboutSettings } from '@norav/content-schema'

// Third-party brand marks. A GitHub icon in GitHub's colour is content, like a
// product's garment colour — the one place a hex that is not a token belongs.
/* eslint-disable no-restricted-syntax -- brand colours, not the palette */
const SOCIAL_ART: Record<string, { color: string; icon: React.ReactNode }> = {
  github: {
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
  linkedin: {
    color: '#0077b5',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  telegram: {
    color: '#26a5e4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  email: {
    color: 'var(--color-primary-500)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4L12 13 2 4" />
      </svg>
    ),
  },
}
/* eslint-enable no-restricted-syntax */

/** How an accented run of the biography is painted. */
const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'text-primary-400',
}

function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

export function AboutHero({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<AboutContent, AboutSettings>('about')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('about', sectionRef)

  const [emailCopied, setEmailCopied] = useState<{ x: number; y: number } | null>(null)

  useReveal(sectionRef, '.about-avatar, .about-content > *, .about-facts > *')

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      id={anchorId ?? 'about'}
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-content mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mt-8">
          {/* Left — Interactive Avatar Card */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="about-avatar relative w-full">
              {/* Ambient glow behind card */}
              <div className="absolute -inset-4 rounded-3xl bg-primary-500/[0.06] blur-2xl pointer-events-none transition-opacity duration-500" />

              <EffectCard
                effect={settings.cardEffect}
                className="rounded-2xl border border-tertiary-ink/[0.08] bg-gradient-to-br from-tertiary-ink/[0.04] to-tertiary-ink/[0.01] backdrop-blur-xl overflow-hidden"
              >
                {/* Photo */}
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={settings.photo}
                    alt="Norayr Avetisyan"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-tertiary-bg via-tertiary-bg/60 to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-tertiary-shade/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-status-success/20">
                    <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
                    <span className="font-mono text-caption text-status-success/80">{content.statusLabel}</span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-5 space-y-4">
                  {/* Social links */}
                  <div className="flex gap-2 justify-center">
                    {content.socials.map((link) => {
                      const art = SOCIAL_ART[link.icon]
                      const isMail = link.href.startsWith('mailto')
                      const email = isMail ? link.href.replace('mailto:', '') : ''
                      if (!art) return null
                      return (
                        <a
                          key={link.icon}
                          href={isMail ? undefined : link.href}
                          target={isMail ? undefined : '_blank'}
                          rel={isMail ? undefined : 'noopener noreferrer'}
                          title={link.label}
                          onClick={isMail ? (e) => {
                            e.preventDefault()
                            navigator.clipboard.writeText(email)
                            setEmailCopied({ x: e.clientX, y: e.clientY })
                            setTimeout(() => setEmailCopied(null), 600)
                          } : undefined}
                          className={`press group relative w-11 h-11 rounded-xl border border-tertiary-ink/[0.08] bg-tertiary-ink/[0.03] flex items-center justify-center text-tertiary-ink/40 transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${isMail ? 'cursor-pointer' : ''}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `${art.color}40`
                            e.currentTarget.style.color = art.color
                            e.currentTarget.style.boxShadow = `0 4px 20px ${art.color}25, 0 0 40px ${art.color}10`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = ''
                            e.currentTarget.style.color = ''
                            e.currentTarget.style.boxShadow = ''
                          }}
                        >
                          {art.icon}
                        </a>
                      )
                    })}
                  </div>

                  {/* Download CV */}
                  <a
                    href={settings.cvHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="type-label group w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/20 hover:border-primary-500/40 hover:shadow-[0_0_30px_-5px_color-mix(in_srgb,_var(--color-primary-500)_30%,_transparent)] transition-all duration-300"
                  >
                    <svg viewBox="0 0 16 16" className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M8 2v9M4.5 7.5L8 11l3.5-3.5M3 13h10" />
                    </svg>
                    {content.cvLabel}
                  </a>
                </div>
              </EffectCard>
            </div>
          </div>

          {/* Right — Bio */}
          <div className="about-content space-y-6">
            {/* Visually the name, but not a heading — the hero <h1> already owns that role, and repeating it confuses screen readers. */}
            <p
              className="font-display text-heading-large font-black text-tertiary-ink"
              aria-hidden="true"
            >
              {content.name}
            </p>
            <p className="font-mono text-body-small text-primary-400 tracking-wider">
              {content.role}
            </p>

            <div className="space-y-4 text-tertiary-ink/50 text-body-regular leading-relaxed max-w-2xl">
              <p>
                {content.bio.lead.map((run, index) => (
                  <Fragment key={index}>
                    {index > 0 && needsLeadingSpace(run.text) ? ' ' : ''}
                    <span className={TONE_CLASS[toneOf(run.accent)]}>{run.text}</span>
                  </Fragment>
                ))}
              </p>
              {content.bio.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph.text}</p>
              ))}
            </div>

            {/* Quick facts */}
            <div className="about-facts grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {content.facts.map((fact) => (
                <div key={fact.label} className="glass-card p-3">
                  <span className="type-label text-tertiary-ink/30 block">
                    {fact.label}
                  </span>
                  <span className="font-mono text-body-small text-tertiary-ink/80 mt-1 block">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copied! floating text at cursor */}
      {emailCopied && (
        <span
          key={`${emailCopied.x}-${emailCopied.y}`}
          className="fixed z-50 font-mono text-caption font-semibold text-primary-400 pointer-events-none animate-[copiedPop_0.5s_ease-out_forwards]"
          style={{ left: emailCopied.x, top: emailCopied.y, transform: 'translate(-50%, -50%)' }}
        >
          Copied!
        </span>
      )}
    </section>
  )
}
