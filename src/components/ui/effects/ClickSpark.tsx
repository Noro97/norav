import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from 'react'
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
  const [sparks, setSparks] = useState<Spark[]>([])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      onClick?.(e)
      if (reducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      const id = idRef.current++
      setSparks((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
      setTimeout(() => {
        setSparks((prev) => prev.filter((spark) => spark.id !== id))
      }, SPARK_LIFETIME_MS)
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
                className="absolute block h-px w-3 origin-left rounded-full bg-crimson-400"
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
