import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Brand/tech names — proper nouns, not translated.
const TECH = [
  'React', 'TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'GraphQL',
  'Supabase', 'PostgreSQL', 'Zustand', 'GSAP', 'Three.js', 'Vite',
  'Module Federation', 'Design Systems', 'Docker', 'AI Agents', 'MCP', 'Claude Code',
]

/**
 * Full-width auto-scrolling tech ribbon — a creative transition band between
 * the Skills and case-study sections. Reuses the shared `.marquee-track`
 * animation (paused under prefers-reduced-motion).
 */
export function TechMarquee() {
  const { t } = useTranslation('skills')
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced && trackRef.current) {
      trackRef.current.style.animationPlayState = 'paused'
    }
  }, [])

  // Triple for a seamless loop at any viewport width.
  const items = [...TECH, ...TECH, ...TECH]

  return (
    <section className="relative py-10 overflow-hidden" aria-label={t('marqueeLabel')}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <p className="text-center label-mono mb-6">{t('marqueeLabel')}</p>

      {/* Fade edges */}
      <div className="absolute left-0 bottom-0 top-[3.25rem] w-32 bg-gradient-to-r from-[#0a0a1a] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 bottom-0 top-[3.25rem] w-32 bg-gradient-to-l from-[#0a0a1a] to-transparent z-10 pointer-events-none" />

      <span className="sr-only">{TECH.join(', ')}</span>

      <div
        ref={trackRef}
        className="marquee-track flex items-center whitespace-nowrap"
        aria-hidden="true"
      >
        {items.map((tech, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="font-display text-2xl md:text-3xl font-semibold text-white/15 hover:text-white/40 transition-colors duration-300 px-7 tracking-tight">
              {tech}
            </span>
            <span className="text-crimson-500/40 text-xs">&#9670;</span>
          </span>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
