import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'

const ICONS: Record<string, React.ReactNode> = {
  zap: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  user: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  brain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a6 6 0 0 0-6 6c0 1.6.6 3 1.7 4.1L12 17l4.3-4.9A6 6 0 0 0 12 2z" />
      <path d="M9 10h.01M15 10h.01" />
      <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      <path d="M12 17v5" />
    </svg>
  ),
  database: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
}

// Pull the hero stat from each micro-tile description
const HERO_STATS = ['60%', '99%', '15s', '98.4%', '10K+']

interface BentoMicroTileProps {
  index: number
  icon: string
}

export function BentoMicroTile({ index, icon }: BentoMicroTileProps) {
  const { t } = useTranslation('bento')
  const tileRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  return (
    <div ref={tileRef} className="bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-xl p-5 md:p-6 flex flex-col transition-all duration-500 hover:border-crimson-500/15">
      {/* Ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-crimson-500/[0.03] blur-2xl group-hover:bg-crimson-500/[0.06] transition-all duration-700 pointer-events-none" />

      <motion.div style={{ y }}>
      {/* Icon with glow ring */}
      <div className="relative w-8 h-8 rounded-lg bg-crimson-500/[0.08] border border-crimson-500/15 flex items-center justify-center text-crimson-400/70 mb-4 group-hover:border-crimson-500/30 group-hover:text-crimson-400 transition-all duration-300">
        {ICONS[icon] ?? ICONS.zap}
        <div className="absolute inset-0 rounded-lg bg-crimson-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Hero stat — the number that pops */}
      <span className="font-mono text-2xl font-black text-white/90 tracking-tight mb-1">
        {HERO_STATS[index]}
      </span>

      {/* Title */}
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">
        {t(`tiles.${index}.title`)}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-white/50 leading-relaxed mt-auto">
        {t(`tiles.${index}.description`)}
      </p>
      </motion.div>

      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
        <div className="absolute bottom-3 right-3 w-px h-4 bg-gradient-to-t from-white/[0.06] to-transparent" />
        <div className="absolute bottom-3 right-3 h-px w-4 bg-gradient-to-l from-white/[0.06] to-transparent" />
      </div>
    </div>
  )
}
