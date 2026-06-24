import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

const WIDGET_SECTIONS = new Set(['logistics', 'merch', 'ecommerce', 'omnigrid', 'proof'])

/**
 * Each section calls this hook with its id.
 * Uses IntersectionObserver — works for lazy-loaded sections
 * because it registers when the component actually mounts.
 */
export function useSectionObserver(sectionId: string, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const { setActiveSection, setParticlesCollapsed } = useAppStore.getState()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection(sectionId)
          setParticlesCollapsed(WIDGET_SECTIONS.has(sectionId))
        }
      },
      {
        // Collapse the root to the viewport's horizontal center line. A section
        // intersects only while it crosses that line, so exactly one section is
        // active at a time — adjacent sections can't fight over "last observer
        // wins" (each section has its own observer seeing only its own element).
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionId, ref])
}
