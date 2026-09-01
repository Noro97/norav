import { lazy, Suspense, useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useHashScroll } from '@/hooks/useHashScroll'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { BlockRenderer } from '@/content/BlockRenderer'
import { PageHead } from '@/content/PageHead'
import { NotFound } from '@/components/NotFound'
import { readPath } from '@/content/routing'
import { useContent } from '@/content/ContentProvider'

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
  const { slug } = readPath(useLocation().pathname)
  const { snapshot } = useContent()
  // A page with nothing on it is not a page. Hiding its last section in the CMS
  // leaves the row in the database and the slug in the snapshot, and rendering
  // that gives a reader a header above an empty screen — which reads as broken
  // rather than as an address that has nothing behind it.
  const exists = snapshot.pages.some((page) => page.slug === slug && page.blocks.length > 0)
  const hasHero = snapshot.pages.some(
    (page) => page.slug === slug && page.blocks.some((block) => block.type === 'hero'),
  )
  const isMobile = useMediaQuery('(max-width: 768px)')
  const setIsMobile = useAppStore((s) => s.setIsMobile)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  useScrollTracking()
  useHashScroll()

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
      </Suspense>

      {/* The 3D mark belongs to the hero, so it goes where the hero goes.
          It used to hang in the app shell, which was invisible while the site
          was one page and wrong the moment it was several: the mark floated
          behind About and Skills, over sections that were never designed to sit
          under it — and paid for a WebGL context on every page. */}
      {!prefersReducedMotion && hasHero && (
        <Suspense fallback={null}>
          <SceneController />
        </Suspense>
      )}

      <Navigation />
      <ScrollProgress />

      {/* Sections, their order and their visibility all come from the CMS —
          and so does the set of pages. A slug the CMS has not published is a
          404, not an empty page under a working header. */}
      <main ref={mainRef} className="relative z-10">
        {exists ? (
          <>
            <PageHead slug={slug} />
            <BlockRenderer slug={slug} />
          </>
        ) : (
          <NotFound />
        )}
      </main>
    </>
  )
}

export default App
