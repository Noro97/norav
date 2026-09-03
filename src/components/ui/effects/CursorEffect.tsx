import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * Replaces the system cursor with a small crosshair that tracks the pointer.
 * Position is written directly to the element's transform (no React state),
 * the same rAF-per-mousemove-batch pattern as `useMagneticEffect`, so it
 * costs nothing beyond one style write per frame.
 */
export function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const dot = dotRef.current
    if (!dot) return

    document.documentElement.classList.add('cursor-effect-active')

    let frame = 0
    let lastEvent: MouseEvent | null = null

    const apply = () => {
      frame = 0
      if (!lastEvent || !dot) return
      dot.style.transform = `translate(${lastEvent.clientX}px, ${lastEvent.clientY}px)`
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastEvent = e
      if (!frame) frame = requestAnimationFrame(apply)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      document.documentElement.classList.remove('cursor-effect-active')
      window.removeEventListener('mousemove', handleMouseMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2"
    >
      <div className="relative w-6 h-6">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-crimson-500/70" />
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-crimson-500/70" />
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson-500" />
      </div>
    </div>
  )
}
