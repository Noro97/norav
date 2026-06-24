import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useTranslation } from 'react-i18next'
import { BENTO_PROJECTS, BENTO_METRICS, MICRO_TILES } from './bento.data'
import { BentoProjectTile } from './BentoProjectTile'
import { BentoMicroTile } from './BentoMicroTile'
import { BentoImpactDashboard } from './BentoImpactDashboard'
import { BentoMarquee } from './BentoMarquee'
import { ProofVerificationTile } from './ProofVerificationTile'
import { ProofEconomyTile } from './ProofEconomyTile'
import { ProofGamificationTile } from './ProofGamificationTile'
import { OmniGridBentoTile } from './OmniGridBentoTile'

function BentoIllustration({ src, alt }: { src: string; alt: string }) {
  // Coalesce the tilt write to one per frame instead of per mousemove event.
  const frameRef = useRef(0)
  const pending = useRef<{ el: HTMLDivElement; x: number; y: number } | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    pending.current = {
      el,
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const p = pending.current
      if (!p) return
      p.el.style.transform = `perspective(600px) rotateX(${(p.y - 0.5) * -14}deg) rotateY(${(p.x - 0.5) * 14}deg) scale3d(1.04,1.04,1.04)`
    })
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    e.currentTarget.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }, [])

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-500 hover:border-crimson-500/20 will-change-transform"
      style={{ transition: 'transform 0.15s ease-out' }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-auto max-h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
      />
      {/* Glare */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent_60%)]" />
    </div>
  )
}

export function BentoGrid() {
  const { t } = useTranslation('bento')
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useSectionObserver('overview', sectionRef)

  useGSAP(() => {
    const headerEl = sectionRef.current!.querySelector('.bento-header')
    if (headerEl) {
      gsap.fromTo(headerEl.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: headerEl, start: 'top 80%' } }
      )
    }

    const tiles = gridRef.current!.children
    if (tiles.length > 0) {
      gsap.fromTo(tiles,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } }
      )
    }
  }, { scope: sectionRef })

  return (
    <section
      id="overview"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-28 md:py-36"
    >
      {/* Section ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-crimson-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bento-header mb-16">
          <span className="label-mono">{t('sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mt-4 mb-5">
            {t('title')}
          </h2>
          <p className="text-white/45 text-base md:text-lg max-w-xl leading-relaxed">
            {t('description')}
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-crimson-500/50 to-transparent mt-8" />
        </div>

        {/* Bento Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Row 1: NexusRoute (2col) + Perf Audit (1col) */}
          <BentoProjectTile project={BENTO_PROJECTS[0]!} index={0} className="md:col-span-2" />
          <BentoMicroTile index={MICRO_TILES[0]!.index} icon={MICRO_TILES[0]!.icon} illustration="/assets/img/bento-perf-audit.png" />

          {/* Row 2: Type-Safe (1col) + MerchForge (2col) */}
          <BentoMicroTile index={MICRO_TILES[1]!.index} icon={MICRO_TILES[1]!.icon} illustration="/assets/img/bento-typesafe.png" />
          <BentoProjectTile project={BENTO_PROJECTS[1]!} index={1} className="md:col-span-2" />

          {/* Row 3: Impact Dashboard (2col) + UX Predict (1col) */}
          <BentoImpactDashboard metrics={BENTO_METRICS} />
          <BentoMicroTile index={MICRO_TILES[2]!.index} icon={MICRO_TILES[2]!.icon} illustration="/assets/img/bento-ux.png" />

          {/* Row 4: FilterGraph (full width) */}
          <BentoProjectTile project={BENTO_PROJECTS[2]!} index={2} className="md:col-span-3" />

          {/* Row 5: Cache Hit-Rate + illustration (1col stacked) + OmniGrid (2col) */}
          <div className="flex flex-col gap-3 md:gap-4">
            <BentoMicroTile index={MICRO_TILES[4]!.index} icon={MICRO_TILES[4]!.icon} />
            <BentoIllustration src="/assets/img/bento-omnigrid.png" alt="OmniGrid illustration" />
          </div>
          <OmniGridBentoTile className="md:col-span-2" />

          {/* Row 6: ProofVerification (2col) + ProofEconomy (1col) */}
          <ProofVerificationTile className="md:col-span-2" />
          <ProofEconomyTile />

          {/* Row 7: AI Liveness + illustration (1col stacked) + ProofGamification (2col) */}
          <div className="flex flex-col gap-3 md:gap-4">
            <BentoMicroTile index={MICRO_TILES[3]!.index} icon={MICRO_TILES[3]!.icon} />
            <BentoIllustration src="/assets/img/bento-gamification.png" alt="Gamification illustration" />
          </div>
          <ProofGamificationTile className="md:col-span-2" />
        </div>

        {/* Marquee */}
        <BentoMarquee />
      </div>
    </section>
  )
}
