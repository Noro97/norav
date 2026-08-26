import { lazy, Suspense, useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { BlockRenderer } from '@/content/BlockRenderer'

const CursorManager = lazy(() =>
  import('@/components/cursor/CursorManager').then((m) => ({ default: m.CursorManager }))
)
const AnimatedGrain = lazy(() =>
  import('@/components/ui/AnimatedGrain').then((m) => ({ default: m.AnimatedGrain }))
)
const DynamicGrid = lazy(() =>
  import('@/components/ui/DynamicGrid').then((m) => ({ default: m.DynamicGrid }))
)
const FloatingArtifacts = lazy(() =>
  import('@/components/ui/FloatingArtifacts').then((m) => ({ default: m.FloatingArtifacts }))
)
const SceneController = lazy(() =>
  import('@/components/canvas/SceneController').then((m) => ({
    default: m.SceneController,
  }))
)

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const setIsMobile = useAppStore((s) => s.setIsMobile)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  useScrollTracking()

  const mainRef = useRef<HTMLElement>(null)

  // Refresh ScrollTrigger when lazy sections change page height
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    let timerId: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(timerId)
      timerId = setTimeout(() => ScrollTrigger.refresh(), 300)
    })
    observer.observe(main)

    return () => {
      observer.disconnect()
      clearTimeout(timerId)
    }
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        {!prefersReducedMotion && (
          <>
            <DynamicGrid />
            <FloatingArtifacts />
            <AnimatedGrain />
          </>
        )}
        <CursorManager />
      </Suspense>

      {/* R3F Canvas */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <SceneController />
        </Suspense>
      )}

      <Navigation />
      <ScrollProgress />

      {/* Sections, their order and their visibility all come from the CMS. */}
      <main ref={mainRef} className="relative z-10">
        <BlockRenderer />
      </main>
    </>
  )
}

export default App
