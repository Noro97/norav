import { lazy, Suspense, useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useLenisScroll } from '@/hooks/useLenisScroll'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { HeroSection } from '@/components/sections/HeroSection'
import { CursorManager } from '@/components/cursor/CursorManager'
import { AnimatedGrain } from '@/components/ui/AnimatedGrain'
import { DynamicGrid } from '@/components/ui/DynamicGrid'

// Lazy-load heavy sections
const SceneController = lazy(() =>
  import('@/components/canvas/SceneController').then((m) => ({
    default: m.SceneController,
  }))
)
const AboutHero = lazy(() =>
  import('@/components/sections/AboutHero').then((m) => ({
    default: m.AboutHero,
  }))
)
const ExperienceTimeline = lazy(() =>
  import('@/components/sections/ExperienceTimeline').then((m) => ({
    default: m.ExperienceTimeline,
  }))
)
const SkillsMatrix = lazy(() =>
  import('@/components/sections/SkillsMatrix').then((m) => ({
    default: m.SkillsMatrix,
  }))
)
const BentoGrid = lazy(() =>
  import('@/components/sections/BentoGrid/BentoGrid').then((m) => ({
    default: m.BentoGrid,
  }))
)
const LogisticsWidget = lazy(() =>
  import('@/components/sections/LogisticsWidget').then((m) => ({
    default: m.LogisticsWidget,
  }))
)
const AIMerchWidget = lazy(() =>
  import('@/components/sections/AIMerchWidget').then((m) => ({
    default: m.AIMerchWidget,
  }))
)
const EcommerceWidget = lazy(() =>
  import('@/components/sections/EcommerceWidget').then((m) => ({
    default: m.EcommerceWidget,
  }))
)
const EducationCerts = lazy(() =>
  import('@/components/sections/EducationCerts').then((m) => ({
    default: m.EducationCerts,
  }))
)
const TerminalFooter = lazy(() =>
  import('@/components/sections/TerminalFooter').then((m) => ({
    default: m.TerminalFooter,
  }))
)

const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-crimson-500/20 border-t-crimson-500 rounded-full animate-spin" />
  </div>
)

function App() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const setIsMobile = useAppStore((s) => s.setIsMobile)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  useLenisScroll()

  const mainRef = useRef<HTMLElement>(null)

  // Refresh ScrollTrigger when lazy sections change page height
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    let rafId: number
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    observer.observe(main)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <DynamicGrid />
      <CursorManager />
      <AnimatedGrain />

      {/* R3F Canvas */}
      {!prefersReducedMotion && (
        <Suspense fallback={null}>
          <SceneController />
        </Suspense>
      )}

      <Navigation />
      <ScrollProgress />

      <main ref={mainRef} className="relative z-10">
        <HeroSection />

        <Suspense fallback={<SectionLoader />}>
          <AboutHero />
          <ExperienceTimeline />
          <SkillsMatrix />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BentoGrid />
        </Suspense>

        {/* Project case studies */}
        <Suspense fallback={<SectionLoader />}>
          <LogisticsWidget />
          <AIMerchWidget />
          <EcommerceWidget />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <EducationCerts />
          <TerminalFooter />
        </Suspense>
      </main>
    </>
  )
}

export default App
