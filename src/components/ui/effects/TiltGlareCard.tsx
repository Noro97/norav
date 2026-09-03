import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { TILT_MAX_DEG, TILT_GLARE_OPACITY } from '@/lib/constants'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * A 3D tilt + cursor-glare wrapper, generalized from the tilt cards hand-rolled
 * separately in AboutHero, ExperienceTimeline and BentoGrid. Mouse position is
 * batched to one re-render per frame (a raw mousemove fires several times per
 * frame, and each write would otherwise force a layout flush).
 */
export function TiltGlareCard({ children, className = '' }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)')
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const frameRef = useRef(0)
  const latest = useRef({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      latest.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0
        const { x, y } = latest.current
        setTransform(
          `perspective(800px) rotateX(${(y - 0.5) * -TILT_MAX_DEG}deg) rotateY(${(x - 0.5) * TILT_MAX_DEG}deg) scale3d(1.03,1.03,1.03)`
        )
        setGlare({ x: x * 100, y: y * 100, opacity: TILT_GLARE_OPACITY })
      })
    },
    [reducedMotion]
  )

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)')
    setGlare({ x: 50, y: 50, opacity: 0 })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform ${className}`}
      style={reducedMotion ? undefined : { transform, transition: 'transform 0.15s ease-out' }}
    >
      {children}
      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          }}
        />
      )}
    </div>
  )
}
