import { Fragment, useRef } from 'react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { toneOf, type Tone } from '@/content/accent'
import type { HeroContent, HeroSettings } from '@norav/content-schema'

/** How a tagline segment is painted. */
const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'text-primary-400',
}

/** Segments are space-joined, except one that opens with punctuation. */
function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/**
 * The first thing on the site, and the LCP element — so it is static. The
 * per-character reveal, the scramble on the subtitle, the parallax and the
 * scroll-progress feed to the 3D mark are all gone with the mark: a name that
 * takes nine seconds to finish typing itself is a name a recruiter has already
 * scrolled past.
 */
export function HeroSection() {
  const hero = useBlock<HeroContent, HeroSettings>('hero')
  const containerRef = useRef<HTMLElement>(null)
  useSectionObserver(hero?.anchorId ?? 'hero', containerRef)

  // Every hook has run by here, so the block being absent — hidden in the CMS —
  // can short-circuit the render.
  if (!hero) return null
  const { content, settings } = hero
  const { first, last } = content.name

  return (
    <section
      id={hero.anchorId ?? 'hero'}
      ref={containerRef}
      className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto pt-[20vh]">
        <p className="type-label md:text-body-small text-primary-500 mb-6">{content.subtitle}</p>

        <h1
          className="font-display text-heading-display font-black text-tertiary-ink mb-8 pr-[0.05em]"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          <span className="text-primary-500">{first.highlight}</span>
          {first.rest}
          {/* One word per line on a phone; the break disappears once both fit. */}
          <br className="min-[425px]:hidden" />
          <span className="hidden min-[425px]:inline">{' '}</span>
          <span className="text-primary-500">{last.highlight}</span>
          {last.rest}
        </h1>

        <p className="text-body-large text-tertiary-ink/50 max-w-2xl mx-auto leading-relaxed font-normal">
          {content.tagline.map((segment, index) => (
            <Fragment key={index}>
              {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
              <span className={TONE_CLASS[toneOf(segment.accent)]}>{segment.text}</span>
            </Fragment>
          ))}
        </p>
      </div>

      {settings.showScrollHint && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="type-label text-tertiary-ink/20">{content.scrollHint}</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary-500/50 to-transparent" />
        </div>
      )}
    </section>
  )
}
