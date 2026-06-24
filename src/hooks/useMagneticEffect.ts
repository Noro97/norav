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

    // Batch style writes to one per frame; the raw mousemove can fire several
    // times per frame and each write would otherwise force a layout flush.
    let frame = 0
    let lastEvent: MouseEvent | null = null

    const apply = () => {
      frame = 0
      if (!lastEvent) return
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = lastEvent.clientX - centerX
      const dy = lastEvent.clientY - centerY
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

    const handleMouseMove = (e: MouseEvent) => {
      lastEvent = e
      if (!frame) frame = requestAnimationFrame(apply)
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
      if (frame) cancelAnimationFrame(frame)
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [ref, radius, strength])
}
