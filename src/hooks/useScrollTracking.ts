import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

export function useScrollTracking() {
  useEffect(() => {
    const setScrollProgress = useAppStore.getState().setScrollProgress

    // Coalesce scroll events to one store write per frame — the raw event can
    // fire many times per frame and any future scrollProgress subscriber would
    // otherwise re-render at the scroll-event rate.
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight > 0) {
          setScrollProgress(scrollTop / docHeight)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
}
