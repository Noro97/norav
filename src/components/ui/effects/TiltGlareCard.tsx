import { useCallback, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SPRING_VALUE } from '@/lib/motion'
import { TILT_MAX_DEG, TILT_GLARE_OPACITY } from '@/lib/constants'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * A 3D tilt + cursor-glare wrapper, generalized from the tilt cards hand-rolled
 * separately in AboutHero, ExperienceTimeline and BentoGrid.
 *
 * The pointer writes targets into springs, and the springs write the element:
 * nothing here goes through React state, and a pointer that comes back while
 * the card is still settling flat simply retargets the springs mid-flight —
 * they carry their velocity into the new target instead of restarting, which
 * a CSS transition cannot do. Touch is ignored: a finger covering the card has
 * no hover position to speak of, and tilting under it only fights the scroll.
 */
export function TiltGlareCard({ children, className = '' }: Props) {
  const reducedMotion = useReducedMotion()

  const rotateX = useSpring(0, SPRING_VALUE.follow)
  const rotateY = useSpring(0, SPRING_VALUE.follow)
  const scale = useSpring(1, SPRING_VALUE.follow)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const glareOpacity = useSpring(0, SPRING_VALUE.follow)

  const transform = useMotionTemplate`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glareOpacity}), transparent 60%)`

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || e.pointerType === 'touch') return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      rotateX.set((y - 0.5) * -TILT_MAX_DEG)
      rotateY.set((x - 0.5) * TILT_MAX_DEG)
      scale.set(1.03)
      glareX.set(x * 100)
      glareY.set(y * 100)
      glareOpacity.set(TILT_GLARE_OPACITY)
    },
    [reducedMotion, rotateX, rotateY, scale, glareX, glareY, glareOpacity]
  )

  const handlePointerLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    glareOpacity.set(0)
  }, [rotateX, rotateY, scale, glareOpacity])

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative will-change-transform ${className}`}
      style={reducedMotion ? undefined : { transform }}
    >
      {children}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: glare }}
        />
      )}
    </motion.div>
  )
}
