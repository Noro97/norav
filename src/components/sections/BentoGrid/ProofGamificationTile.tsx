import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

interface Props {
  className?: string
}

const BADGES = [
  { rarity: 'common', icon: 'star' },
  { rarity: 'rare', icon: 'flame' },
  { rarity: 'epic', icon: 'shield' },
  { rarity: 'legendary', icon: 'crown' },
] as const

const RARITY_STYLES: Record<string, string> = {
  common: 'border-white/10 text-white/30',
  rare: 'border-white/15 text-white/40',
  epic: 'border-crimson-500/25 text-crimson-400/50',
  legendary: 'border-crimson-500/40 text-crimson-400/70 shadow-[0_0_12px_rgba(181,26,43,0.15)]',
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  flame: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  trophy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  crown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" /><path d="M3 20h18" />
    </svg>
  ),
}

function AnimatedXP() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const motionValue = useMotionValue(0)
  const display = useTransform(motionValue, (v) =>
    Math.round(v).toLocaleString()
  )

  useEffect(() => {
    if (!isInView) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      motionValue.set(15000)
      return
    }
    const controls = animate(motionValue, 15000, {
      duration: 2.4,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [isInView, motionValue])

  return (
    <div ref={ref} className="flex items-baseline gap-1.5">
      <motion.span className="font-mono text-2xl font-black text-white tabular-nums tracking-tight">
        {display}
      </motion.span>
      <span className="font-mono text-xs text-white/40 font-medium">XP</span>
    </div>
  )
}

export function ProofGamificationTile({ className = '' }: Props) {
  const { t } = useTranslation('bento')
  const tileRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(tileRef, { once: true, margin: '-50px' })

  return (
    <div
      ref={tileRef}
      className={`bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-crimson-500/15 ${className}`}
    >
      {/* Gradient mesh */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(181,26,43,0.5) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(140,21,35,0.3) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-6 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
          </span>
          <h3 className="font-mono text-[11px] text-white/60 uppercase tracking-[0.2em]">
            {t('proof.gamification.label')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Dual Points + Level */}
          <div>
            <p className="font-mono text-[9px] text-white/40 uppercase tracking-wider mb-3">
              {t('proof.gamification.dualPoints')}
            </p>

            {/* Physio bar */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-white/50">{t('proof.gamification.physio')}</span>
                <span className="font-mono text-[10px] text-white/30">72%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-white/30 to-white/50"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '72%' } : {}}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                />
              </div>
            </div>

            {/* Neuro bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-crimson-400/60">{t('proof.gamification.neuro')}</span>
                <span className="font-mono text-[10px] text-white/30">58%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-crimson-500 to-crimson-400"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '58%' } : {}}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                />
              </div>
            </div>

            {/* Level bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-white/50">{t('proof.gamification.level')}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-crimson-600 to-crimson-400"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '70%' } : {}}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                />
              </div>
            </div>

            {/* XP Counter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-white/35 uppercase tracking-wider">{t('proof.gamification.xpLabel')}</span>
              <AnimatedXP />
            </div>
          </div>

          {/* Right: Badge grid */}
          <div>
            <p className="font-mono text-[9px] text-white/40 uppercase tracking-wider mb-3">
              {t('proof.gamification.badges')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BADGES.map((badge, i) => (
                <div
                  key={i}
                  className={`group/badge flex flex-col items-center justify-center w-full aspect-square rounded-lg border bg-black/30 transition-all duration-300 hover:scale-105 ${RARITY_STYLES[badge.rarity]}`}
                >
                  {BADGE_ICONS[badge.icon]}
                  <span className="font-mono text-[7px] mt-1 opacity-60">
                    {t(`proof.gamification.badge${badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="font-mono text-[9px] text-white/30 mt-4 tracking-wide uppercase">
          {t('proof.gamification.description')}
        </p>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-crimson-500/[0.02] to-transparent pointer-events-none" />
    </div>
  )
}
