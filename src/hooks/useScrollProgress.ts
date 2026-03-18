import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

const WIDGET_SECTIONS = new Set(['logistics', 'merch', 'ecommerce', 'omnigrid'])

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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId)
            setParticlesCollapsed(WIDGET_SECTIONS.has(sectionId))
          }
        })
      },
      {
        rootMargin: '-35% 0px -35% 0px',
        threshold: 0,
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [sectionId, ref])
}
