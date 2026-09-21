import { useEffect, useRef } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'

export function BentoMarquee() {
  const block = useBlock<BentoGridContent>('bento_grid')
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion && trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused'
    }
  }, [])

  const principles = (block?.content.principles ?? []).map((principle) => principle.text)

  // Triple for seamless loop at any viewport width
  const items = [...principles, ...principles, ...principles]

  return (
    <div className="relative mt-12 py-5 overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-tertiary-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-tertiary-bg to-transparent z-10 pointer-events-none" />

      {/* Screen reader text */}
      <span className="sr-only">
        Engineering principles: {principles.join(', ')}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        className="marquee-track flex items-center whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((principle, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-mono text-body-small text-tertiary-ink/45 uppercase tracking-[0.2em] px-6">
              {principle}
            </span>
            <span className="text-primary-500/40 text-caption">&#9670;</span>
          </span>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
    </div>
  )
}
