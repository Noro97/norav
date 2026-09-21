import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from 'framer-motion'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { TerminalGhosting } from './TerminalGhosting'
import { VibeSlider } from './VibeSlider'
import { useBlock } from '@/content/ContentProvider'
import { ScrambleText } from '@/components/ui/effects/ScrambleText'
import type { VibeCodingContent, VibeCodingSettings } from '@norav/content-schema'

/** Tone names the CMS offers, resolved to the palette classes. */
const TONE_CLASS: Record<string, string> = {
  sky: 'border-secondary-500/30 text-secondary-400/70',
  violet: 'border-secondary-700/40 text-secondary-300/70',
  emerald: 'border-tertiary-ink/20 text-tertiary-ink/60',
  crimson: 'border-primary-500/30 text-primary-400/70',
}

export function VibeCoding({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<VibeCodingContent, VibeCodingSettings>('vibecoding')
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'vibecoding', sectionRef)

  const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

  // GSAP scroll-triggered entrance
  useGSAP(() => {
    const header = sectionRef.current!.querySelector('.vc-header')
    if (header) {
      gsap.fromTo(
        header.children,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 80%' },
        }
      )
    }

    const content = contentRef.current
    if (content) {
      gsap.fromTo(
        content.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: content, start: 'top 80%' },
        }
      )
    }
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block
  const nodeLabels = Object.fromEntries(content.archNodes.map((n) => [n.node, n.label]))

  return (
    <section
      id={anchorId ?? 'vibecoding'}
      ref={sectionRef}
      className="relative px-6 md:px-16 py-28 md:py-36 overflow-hidden"
    >
      {/* Terminal ghosting background */}
      <TerminalGhosting active={isInView} />

      {/* Soft fade edges for ghosting — transparent so page body shows through */}
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-tertiary-bg/60 to-transparent pointer-events-none z-1" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-tertiary-bg/60 to-transparent pointer-events-none z-1" />

      {/* Section ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="vc-header mb-16">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="font-display text-display-xl font-black text-tertiary-ink mt-4 mb-5">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/45 text-body-md md:text-body-lg max-w-xl leading-relaxed">
            {content.body}
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-primary-500/50 to-transparent mt-8" />
        </div>

        {/* Two-column layout */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Manifesto content */}
          <div className="flex flex-col gap-10">
            {/* Micro-copy */}
            <blockquote className="pl-5 border-l-2 border-primary-500/40">
              <p className="font-mono text-body-sm md:text-body-md text-tertiary-ink/50 italic leading-relaxed">
                <ScrambleText text={content.microCopy} variant={settings.codeReveal} />
              </p>
            </blockquote>

            {/* Systems synced */}
            <div>
              <span className="type-label text-tertiary-ink/40 block mb-3">
                {content.systemsSyncedLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {content.systems.map((system) => (
                  <span
                    key={system.name}
                    className={`font-mono text-body-xs px-3 py-1.5 rounded-lg border bg-tertiary-ink/[0.02] ${TONE_CLASS[system.tone] ?? ''}`}
                  >
                    {system.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {content.stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-display-md font-black text-tertiary-ink/80">
                    {stat.value}
                  </div>
                  <div className="type-label text-tertiary-ink/40 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Vibe Slider */}
          <VibeSlider
            copy={{
              lowVibe: content.slider.lowVibe,
              highVibe: content.slider.highVibe,
              boringLabel: content.slider.boringLabel,
              archLabel: content.slider.archLabel,
              nodeLabels,
            }}
          />
        </div>
      </div>
    </section>
  )
}
