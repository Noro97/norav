import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import type { BentoMetric } from './bento.data'

function AnimatedMetric({ metric }: { metric: BentoMetric }) {
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

    const controls = animate(motionValue, metric.value, {
      duration: 2,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [isInView, metric.value, motionValue])

  return (
    <div ref={ref} className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: metric.color }}
        />
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
          {t(metric.labelKey)}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        {metric.prefix && (
          <span className="font-mono text-lg text-white/50">{metric.prefix}</span>
        )}
        <motion.span className="font-mono text-2xl font-bold text-white">
          {display}
        </motion.span>
        <span className="font-mono text-sm text-white/40">{metric.suffix}</span>
      </div>
      <p className="font-mono text-[10px] text-white/20 mt-1">
        {t(metric.detailKey)}
      </p>
    </div>
  )
}

interface BentoImpactDashboardProps {
  metrics: BentoMetric[]
}

export function BentoImpactDashboard({ metrics }: BentoImpactDashboardProps) {
  const { t } = useTranslation('bento')

  return (
    <div className="bento-tile glass-card md:col-span-2 bg-[#0a0f0a] p-6 micro-grid-bg">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <h3 className="font-mono text-xs text-white/50 uppercase tracking-wider">
          {t('dashboard.title')}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <AnimatedMetric key={metric.key} metric={metric} />
        ))}
      </div>
    </div>
  )
}
