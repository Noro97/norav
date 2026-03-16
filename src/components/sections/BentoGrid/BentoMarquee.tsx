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

  const items = [...principles, ...principles]

  return (
    <div className="border-y border-white/5 py-3 mt-8 overflow-hidden relative">
      <span className="sr-only">
        {principles.join(' - ')}
      </span>
      <div
        ref={trackRef}
        className="marquee-track flex items-center gap-4 whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((principle, i) => (
          <span key={i} className="flex items-center gap-4">
            <span className="font-mono text-xs text-white/20 uppercase tracking-wider">
              {principle}
            </span>
            <span className="text-crimson-500/40 text-xs">&#8226;</span>
          </span>
        ))}
      </div>
    </div>
  )
}
