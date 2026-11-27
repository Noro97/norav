import { useEffect, useRef } from 'react'

/**
 * How far down the page the reader is, as a 2px bar under the top edge.
 *
 * Written straight to the bar's transform, at most once a frame, rather than
 * through React state: kept in state, every frame of a scroll was a render.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const paint = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] bg-transparent">
      <div ref={bar} className="h-full bg-primary-500/80 origin-left" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}
