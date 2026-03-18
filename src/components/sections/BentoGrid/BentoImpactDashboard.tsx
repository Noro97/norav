import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import type { BentoMetric } from './bento.data'

function AnimatedMetric({ metric, delay }: { metric: BentoMetric; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const { t } = useTranslation('bento')

  const motionValue = useMotionValue(0)
  const display = useTransform(motionValue, (v) =>
    metric.value % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString()
  )

  useEffect(() => {
    if (!isInView) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      motionValue.set(metric.value)
      return
    }

    const timer = setTimeout(() => {
      animate(motionValue, metric.value, {
        duration: 2.4,
        ease: [0.16, 1, 0.3, 1],
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [isInView, metric.value, motionValue, delay])

  return (
    <div
      ref={ref}
      className="relative p-4 rounded-xl bg-black/30 border border-white/[0.04] group/metric hover:border-crimson-500/15 transition-all duration-300"
    >
      {/* Scanline texture */}
      <div
        className="absolute inset-0 rounded-xl opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />

      {/* Status indicator + label */}
      <div className="relative flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
            style={{ backgroundColor: metric.color }}
          />
          <span
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: metric.color }}
          />
        </span>
        <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.15em]">
          {t(metric.labelKey)}
        </span>
      </div>

      {/* Value */}
      <div className="relative flex items-baseline gap-1">
        {metric.prefix && (
          <span className="font-mono text-base text-white/50 font-light">{metric.prefix}</span>
        )}
        <motion.span className="font-mono text-3xl font-black text-white tabular-nums tracking-tight">
          {display}
        </motion.span>
        <span className="font-mono text-xs text-white/45 font-medium ml-0.5">{metric.suffix}</span>
      </div>

      {/* Detail line */}
      <p className="font-mono text-[9px] text-white/35 mt-2 tracking-wide uppercase">
        {t(metric.detailKey)}
      </p>

      {/* Bottom accent on hover */}
      <div
        className="absolute bottom-0 left-3 right-3 h-px opacity-0 group-hover/metric:opacity-100 transition-opacity duration-500"
        style={{ backgroundImage: `linear-gradient(90deg, transparent, ${metric.color}40, transparent)` }}
      />
    </div>
  )
}

interface BentoImpactDashboardProps {
  metrics: BentoMetric[]
}

export function BentoImpactDashboard({ metrics }: BentoImpactDashboardProps) {
  const { t } = useTranslation('bento')

  return (
    <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a14] backdrop-blur-xl">
      {/* Subtle crimson gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-crimson-500/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern — crimson tint */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(181,26,43,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(181,26,43,0.25) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative p-6 md:p-7">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-400" />
            </span>
            <h3 className="font-mono text-[11px] text-white/60 uppercase tracking-[0.2em]">
              {t('dashboard.title')}
            </h3>
          </div>
          <span className="font-mono text-[9px] text-crimson-500/50 tracking-wider">
            REAL-TIME
          </span>
        </div>

        {/* Metrics 2x2 grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {metrics.map((metric, i) => (
            <AnimatedMetric key={metric.key} metric={metric} delay={i * 200} />
          ))}
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-crimson-500/[0.02] to-transparent pointer-events-none" />
    </div>
  )
}
