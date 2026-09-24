import { useEffect, useRef, useState } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { ImpactStripContent, ImpactStripSettings } from '@norav/content-schema'

type Stat = ImpactStripContent['stats'][number]

const DURATION = 800

/**
 * Counts from 80% of the number, never from zero. A counter parked at 0 until it
 * scrolls into view is what a screenshot, a shared link and a recruiter skimming
 * the page see — and with counting off it used to stay at 0 for good.
 */
const startOf = (value: number) => Math.round(value * 0.8)

function Counter({ stat, animate, run }: { stat: Stat; animate: boolean; run: boolean }) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const counts = animate && !reduced
  const [n, setN] = useState(() => (counts ? startOf(stat.value) : stat.value))
  const frame = useRef(0)

  useEffect(() => {
    if (!run || !counts) return
    const from = startOf(stat.value)
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / DURATION, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(from + eased * (stat.value - from)))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [run, stat.value, counts])

  const display = counts ? n : stat.value

  return (
    <span className="font-display text-heading-large font-black text-tertiary-ink tabular-nums">
      {stat.prefix}{display}{stat.suffix}
    </span>
  )
}

export function ImpactStrip() {
  const block = useBlock<ImpactStripContent, ImpactStripSettings>('impact_strip')
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

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      ref={ref}
      className="relative px-gutter-x py-16"
      aria-label={content.label}
    >
      <div className="relative z-10 w-full max-w-content mx-auto">
        <div className="rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl px-6 py-10 md:py-12">
          <p className="text-center label-mono mb-8">{content.label}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-2">
                <Counter stat={stat} animate={settings.animateCounters} run={run} />
                <span className="type-label text-tertiary-ink/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
