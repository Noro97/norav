import { useCallback, useRef, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * A cursor-tracked radial-gradient spotlight, written directly onto CSS custom
 * properties instead of React state — the mouse position never needs to
 * trigger a re-render, only a style write, so this stays cheaper than
 * TiltGlareCard for grids with many cards on screen at once (Capabilities,
 * bento tiles).
 */
export function SpotlightCard({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--spotlight-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
      el.style.setProperty('--spotlight-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
      el.style.setProperty('--spotlight-opacity', '1')
    },
    [reducedMotion]
  )

  const handleMouseLeave = useCallback(() => {
    ref.current?.style.setProperty('--spotlight-opacity', '0')
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
      style={{ '--spotlight-x': '50%', '--spotlight-y': '50%', '--spotlight-opacity': '0' } as React.CSSProperties}
    >
      {children}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: 'var(--spotlight-opacity)',
            background:
              'radial-gradient(400px circle at var(--spotlight-x) var(--spotlight-y), color-mix(in srgb, var(--color-crimson-500) 15%, transparent), transparent 60%)',
          }}
        />
      )}
    </div>
  )
}
