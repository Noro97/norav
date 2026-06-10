import { lazy, Suspense, useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { HeroSection } from '@/components/sections/HeroSection'

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
const VibeCoding = lazy(() =>
  import('@/components/sections/VibeCoding/VibeCoding').then((m) => ({
    default: m.VibeCoding,
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
const OmniGridWidget = lazy(() =>
  import('@/components/sections/OmniGrid/OmniGridWidget').then((m) => ({
    default: m.OmniGridWidget,
  }))
)
const ProofWidget = lazy(() =>
  import('@/components/sections/ProofWidget').then((m) => ({
    default: m.ProofWidget,
  }))
)
const WorkflowAutomation = lazy(() =>
  import('@/components/sections/WorkflowAutomation/WorkflowAutomation').then((m) => ({
    default: m.WorkflowAutomation,
  }))
)
const TerminalFooter = lazy(() =>
  import('@/components/sections/TerminalFooter').then((m) => ({
    default: m.TerminalFooter,
  }))
)
// Static import: enables tree-shaking of unused warmbros-components exports
// (Receipt3D pulls in Rapier/physics ~700KB gz, SplineScene pulls the Spline runtime ~585KB gz).
// A dynamic import of the barrel can't tree-shake, so we import statically.
import { ContainerScroll } from '@warmbros/warmbros-components'

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

        <Suspense fallback={<SectionLoader />}>
          <VibeCoding />
        </Suspense>

        {/* Scroll reveal intro for case studies */}
        <Suspense fallback={<SectionLoader />}>
          <section id="projects-intro" className="relative">
            <ContainerScroll
              titleComponent={
                <>
                  <p className="label-editorial tracking-[0.3em] text-xs mb-4">
                    Selected Work · 2024 — 2026
                  </p>
                  <h2
                    className="font-display font-semibold text-white tracking-[-0.02em] leading-[1.05]"
                    style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', margin: 0 }}
                  >
                    From zero to{' '}
                    <span className="italic text-[#B51A2B]">production</span>
                    <br />
                    in every frame.
                  </h2>
                  <p className="mt-6 text-[#DAD4D4]/70 text-base max-w-xl mx-auto leading-relaxed">
                    Five years, six shipped products — logistics, commerce,
                    merch AI, and an ops console powering thousands of daily users.
                  </p>
                </>
              }
            >
              <img
                src="/assets/img/case-studies-hero.webp"
                alt="A collage of shipped case studies — dashboards, mobile ops consoles, and commerce flows"
                width={1800}
                height={1029}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </ContainerScroll>
          </section>
        </Suspense>

        {/* Project case studies */}
        <Suspense fallback={<SectionLoader />}>
          <LogisticsWidget />
          <AIMerchWidget />
          <EcommerceWidget />
          <OmniGridWidget />
          <ProofWidget />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <WorkflowAutomation />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <TerminalFooter />
        </Suspense>
      </main>

      {/* TODO: AI chat is disabled — re-enable by lazy-importing
          @/components/ai/AIChatWidget and rendering it here, or delete
          src/components/ai/ + src/hooks/useChat.ts if it's not coming back. */}
    </>
  )
}

export default App
