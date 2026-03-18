import { useEffect, useRef, type RefObject } from 'react'
import { MAGNETIC_RADIUS, MAGNETIC_STRENGTH } from '@/lib/constants'

export function useMagneticEffect(
  ref: RefObject<HTMLElement | null>,
  radius: number = MAGNETIC_RADIUS,
  strength: number = MAGNETIC_STRENGTH,
) {
  const animating = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < radius) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
        el.style.transition = 'transform 0.1s ease-out'
        animating.current = true
      } else if (animating.current) {
        el.style.transform = 'translate(0, 0)'
        el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        animating.current = false
      }
    }

    const handleMouseLeave = () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      animating.current = false
    }

    const parent = el.parentElement || document.body
    parent.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [ref, radius, strength])
}
