import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

export function useScrollTracking() {
  useEffect(() => {
    const setScrollProgress = useAppStore.getState().setScrollProgress

    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setScrollProgress(scrollTop / docHeight)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
