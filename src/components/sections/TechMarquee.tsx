import { useEffect, useRef } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { TechMarqueeContent, TechMarqueeSettings } from '@norav/content-schema'

/**
 * Full-width auto-scrolling tech ribbon — a creative transition band between
 * the Skills and case-study sections. Reuses the shared `.marquee-track`
 * animation (paused under prefers-reduced-motion).
 */
export function TechMarquee() {
  const block = useBlock<TechMarqueeContent, TechMarqueeSettings>('tech_marquee')
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced && trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused'
    }
  }, [])

  if (!block) return null
  const { content, settings } = block
  const names = content.items.map((item) => item.name)

  if (settings.layout === 'logo-wall') {
    return (
      <section
        className="relative py-10"
        aria-label={content.label}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
        <p className="text-center label-mono mb-6">{content.label}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 max-w-content mx-auto">
          {names.map((tech, i) => (
            <span
              key={i}
              className="font-display text-body-large font-semibold text-tertiary-ink/25 hover:text-tertiary-ink/50 transition-colors duration-300 tracking-tight"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
      </section>
    )
  }

  // Triple for a seamless loop at any viewport width.
  const items = [...names, ...names, ...names]

  return (
    <section
      className="relative py-10 overflow-hidden"
      aria-label={content.label}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />

      <p className="text-center label-mono mb-6">{content.label}</p>

      {/* Fade edges */}
      <div className="absolute left-0 bottom-0 top-[3.25rem] w-32 bg-gradient-to-r from-tertiary-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 bottom-0 top-[3.25rem] w-32 bg-gradient-to-l from-tertiary-bg to-transparent z-10 pointer-events-none" />

      <span className="sr-only">{names.join(', ')}</span>

      <div
        ref={trackRef}
        className="marquee-track flex items-center whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((tech, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-display text-heading-medium font-black text-tertiary-ink/15 hover:text-tertiary-ink/40 transition-colors duration-300 px-7">
              {tech}
            </span>
            <span className="text-primary-500/40 text-caption">&#9670;</span>
          </span>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
    </section>
  )
}
