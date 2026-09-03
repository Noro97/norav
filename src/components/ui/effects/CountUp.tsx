import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
  /**
   * When omitted, the number watches its own IntersectionObserver and starts
   * counting the moment it scrolls into view (ImpactStrip's original
   * behaviour). Pass this when the card is already gated by a scroll trigger
   * elsewhere (SkillsMatrix's `animate` state) so both stay in sync instead
   * of racing two separate observers.
   */
  run?: boolean
}

const DEFAULT_DURATION = 1100

/**
 * A count-up number that starts the moment it scrolls into view, extracted
 * from ImpactStrip's original inline `Counter` so bento/skills cards can reuse
 * the same easing and IntersectionObserver gating instead of re-deriving it.
 */
export function CountUp({
  target,
  prefix = '',
  suffix = '',
  duration = DEFAULT_DURATION,
  run: controlledRun,
  className,
}: Props) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)
  const [observedRun, setObservedRun] = useState(false)
  const [n, setN] = useState(0)
  const run = controlledRun ?? observedRun

  useEffect(() => {
    if (controlledRun !== undefined) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setObservedRun(true)
          obs.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [controlledRun])

  useEffect(() => {
    if (!run || reducedMotion) return
    let start: number | null = null
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * target))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [run, target, duration, reducedMotion])

  const display = reducedMotion ? target : n

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
