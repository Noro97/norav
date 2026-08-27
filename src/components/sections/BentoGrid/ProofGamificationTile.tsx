import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'

interface Props {
  className?: string
}

/**
 * The four tiers the layout draws. Their order and their names are code — the
 * grid reserves four cells and the labels come from i18n — while the artwork
 * for each is content, matched by tier.
 */
const TIERS = ['common', 'rare', 'epic', 'legendary'] as const


const RARITY_STYLES: Record<string, string> = {
  common: 'border-white/10 text-white/40',
  rare: 'border-white/15 text-white/50',
  epic: 'border-crimson-500/25 text-crimson-400/50',
  legendary: 'border-crimson-500/40 text-crimson-400/70 shadow-[0_0_12px_color-mix(in_srgb,_var(--color-crimson-500)_15%,_transparent)]',
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
  const block = useBlock<BentoGridContent>('bento_grid')
  // Every tier is drawn whether or not it has artwork, so the cell keeps its
  // place in the grid and its label while an image is being chosen.
  const badges = TIERS.map((rarity) => ({
    rarity,
    image: block?.content.badges.find((badge) => badge.rarity === rarity)?.image ?? '',
  }))
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
            'radial-gradient(ellipse at 70% 30%, color-mix(in srgb, var(--color-crimson-500) 50%, transparent) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, color-mix(in srgb, var(--color-crimson-700) 30%, transparent) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-6 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
          </span>
          <h3 className="font-mono text-xs text-white/60 uppercase tracking-[0.2em]">
            {t('proof.gamification.label')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Dual Points + Level */}
          <div>
            <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-3">
              {t('proof.gamification.dualPoints')}
            </p>

            {/* Physio bar */}
            <div className="mb-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-white/50">{t('proof.gamification.physio')}</span>
                <span className="font-mono text-xs text-white/45">72%</span>
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
                <span className="font-mono text-xs text-crimson-400/60">{t('proof.gamification.neuro')}</span>
                <span className="font-mono text-xs text-white/45">58%</span>
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
                <span className="font-mono text-xs text-white/50">{t('proof.gamification.level')}</span>
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
              <span className="font-mono text-xs text-white/45 uppercase tracking-wider">{t('proof.gamification.xpLabel')}</span>
              <AnimatedXP />
            </div>
          </div>

          {/* Right: Badge grid */}
          <div>
            <p className="font-mono text-xs text-white/40 uppercase tracking-wider mb-3">
              {t('proof.gamification.badges')}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  className={`group/badge flex flex-col items-center justify-center w-full aspect-square rounded-lg border bg-black/30 transition-all duration-300 hover:scale-105 overflow-hidden ${RARITY_STYLES[badge.rarity]}`}
                >
                  {badge.image && (
                    <img
                      src={badge.image}
                      alt={`${badge.rarity} badge`}
                      loading="lazy"
                      className="w-3/4 h-3/4 object-contain transition-transform duration-300 group-hover/badge:scale-110"
                    />
                  )}
                  <span className="font-mono text-[9px] mt-1 opacity-60">
                    {t(`proof.gamification.badge${badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="font-mono text-xs text-white/45 mt-4 tracking-wide uppercase">
          {t('proof.gamification.description')}
        </p>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-crimson-500/2 to-transparent pointer-events-none" />
    </div>
  )
}
