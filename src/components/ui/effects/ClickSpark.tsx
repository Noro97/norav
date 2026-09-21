import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

interface Spark {
  id: number
  x: number
  y: number
}

const SPARK_COUNT = 6
const SPARK_LIFETIME_MS = 500

/**
 * Wraps any element and bursts a handful of small rays from the click point.
 * A micro-interaction, deliberately smaller than the site's existing
 * `canvas-confetti` moments (which stay reserved for bigger celebrations).
 */
export function ClickSpark({ children, className = '', onClick }: Props) {
  const reducedMotion = useReducedMotion()
  const idRef = useRef(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const [sparks, setSparks] = useState<Spark[]>([])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onClick?.(e)
      if (reducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      // `detail` is 0 for a click the keyboard synthesised, and its clientX/Y
      // are 0 with it — bursting from there would put the sparks off the
      // element entirely. Burst from the middle instead.
      const fromKeyboard = e.detail === 0
      const id = idRef.current++
      setSparks((prev) => [
        ...prev,
        fromKeyboard
          ? { id, x: rect.width / 2, y: rect.height / 2 }
          : { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
      const timer = setTimeout(() => {
        setSparks((prev) => prev.filter((spark) => spark.id !== id))
        timersRef.current = timersRef.current.filter((t) => t !== timer)
      }, SPARK_LIFETIME_MS)
      timersRef.current.push(timer)
    },
    [onClick, reducedMotion]
  )

  return (
    <span className={`relative inline-flex ${className}`} onClick={handleClick}>
      {children}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ left: spark.x, top: spark.y }}
        >
          {Array.from({ length: SPARK_COUNT }, (_, i) => {
            const angle = (i / SPARK_COUNT) * Math.PI * 2
            return (
              <span
                key={i}
                className="absolute block h-px w-3 origin-left rounded-full bg-primary-400"
                style={
                  {
                    '--spark-angle': `${angle}rad`,
                    animation: `clickSparkRay ${SPARK_LIFETIME_MS}ms ease-out forwards`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </span>
      ))}
    </span>
  )
}
