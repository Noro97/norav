import { useEffect, type RefObject } from 'react'
import { useSpring } from 'framer-motion'
import { MAGNETIC_RADIUS, MAGNETIC_STRENGTH } from '@/lib/constants'
import { SPRING_VALUE } from '@/lib/motion'

/**
 * Pulls the element a little toward a pointer that comes within `radius` of
 * its centre, and lets it go when the pointer leaves.
 *
 * Two springs, one per axis, do the moving. The pointer only ever sets their
 * targets, so a pointer that leaves and comes straight back retargets a
 * spring already in motion — it turns around carrying its velocity, where
 * the CSS transition this replaced would restart from a standstill and read
 * as a stutter. Under reduced motion nothing is attached at all.
 */
export function useMagneticEffect(
  ref: RefObject<HTMLElement | null>,
  radius: number = MAGNETIC_RADIUS,
  strength: number = MAGNETIC_STRENGTH,
) {
  const x = useSpring(0, SPRING_VALUE.follow)
  const y = useSpring(0, SPRING_VALUE.follow)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const write = () => {
      el.style.transform = `translate(${x.get()}px, ${y.get()}px)`
    }
    const unsubscribeX = x.on('change', write)
    const unsubscribeY = y.on('change', write)

    let inside = false
    const handlePointerMove = (e: PointerEvent) => {
      // A finger is not near a button; it is on it or it is not.
      if (e.pointerType === 'touch') return
      const rect = el.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      if (Math.hypot(dx, dy) < radius) {
        inside = true
        x.set(dx * strength)
        y.set(dy * strength)
      } else if (inside) {
        inside = false
        x.set(0)
        y.set(0)
      }
    }
    const handlePointerLeave = () => {
      inside = false
      x.set(0)
      y.set(0)
    }

    const parent = el.parentElement || document.body
    parent.addEventListener('pointermove', handlePointerMove, { passive: true })
    el.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      parent.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerleave', handlePointerLeave)
      unsubscribeX()
      unsubscribeY()
      el.style.transform = ''
    }
  }, [ref, radius, strength, x, y])
}
