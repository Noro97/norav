import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export function BentoMarquee() {
  const { t } = useTranslation('bento')
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion && trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused'
    }
  }, [])

  const principles = Array.from({ length: 4 }, (_, i) =>
    t(`marquee.principles.${i}`)
  )

  // Triple for seamless loop at any viewport width
  const items = [...principles, ...principles, ...principles]

  return (
    <div className="relative mt-12 py-5 overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10 pointer-events-none" />

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
            <span className="font-mono text-sm text-white/30 uppercase tracking-[0.2em] px-6">
              {principle}
            </span>
            <span className="text-crimson-500/40 text-[10px]">&#9670;</span>
          </span>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}
