import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Stat {
  value: number
  prefix?: string
  suffix?: string
  labelKey: string
}

const STATS: Stat[] = [
  { value: 7, suffix: '+', labelKey: 'impact.0.label' },
  { value: 10, suffix: 'M+', labelKey: 'impact.1.label' },
  { value: 6, suffix: '', labelKey: 'impact.2.label' },
  { value: 50, suffix: 'K+', labelKey: 'impact.3.label' },
]

const DURATION = 1100

function Counter({ stat, run }: { stat: Stat; run: boolean }) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [n, setN] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    if (!run || reduced) return
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / DURATION, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * stat.value))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [run, stat.value, reduced])

  const display = reduced ? stat.value : n

  return (
    <span className="font-display text-4xl md:text-5xl font-bold text-white tabular-nums">
      {stat.prefix}{display}{stat.suffix}
    </span>
  )
}

export function ImpactStrip() {
  const { t } = useTranslation('extra')
  const ref = useRef<HTMLElement>(null)
  const [run, setRun] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRun(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative px-6 md:px-16 py-16" aria-label={t('impact.label')}>
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl px-6 py-10 md:py-12">
          <p className="text-center label-mono mb-8">{t('impact.label')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.labelKey} className="flex flex-col items-center text-center gap-2">
                <Counter stat={stat} run={run} />
                <span className="font-mono text-xs text-white/40 tracking-wider uppercase">
                  {t(stat.labelKey)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
