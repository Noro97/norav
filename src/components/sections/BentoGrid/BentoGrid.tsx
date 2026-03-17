import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import { useTranslation } from 'react-i18next'
import { BENTO_PROJECTS, BENTO_METRICS, MICRO_TILES } from './bento.data'
import { BentoProjectTile } from './BentoProjectTile'
import { BentoMicroTile } from './BentoMicroTile'
import { BentoImpactDashboard } from './BentoImpactDashboard'
import { BentoMarquee } from './BentoMarquee'

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

      {/* Micro-grid background */}
      <div className="absolute inset-0 micro-grid-bg pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bento-header mb-16">
          <span className="label-mono">{t('sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mt-4 mb-5">
            {t('title')}
          </h2>
          <p className="text-white/35 text-base md:text-lg max-w-xl leading-relaxed">
            {t('description')}
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-crimson-500/50 to-transparent mt-8" />
        </div>

        {/* Bento Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Row 1: NexusRoute (2col) + Perf Audit (1col) */}
          <BentoProjectTile project={BENTO_PROJECTS[0]!} index={0} className="md:col-span-2" />
          <BentoMicroTile index={MICRO_TILES[0]!.index} icon={MICRO_TILES[0]!.icon} />

          {/* Row 2: Type-Safe (1col) + MerchForge (2col) */}
          <BentoMicroTile index={MICRO_TILES[1]!.index} icon={MICRO_TILES[1]!.icon} />
          <BentoProjectTile project={BENTO_PROJECTS[1]!} index={1} className="md:col-span-2" />

          {/* Row 3: Impact Dashboard (2col) + UX Predict (1col) */}
          <BentoImpactDashboard metrics={BENTO_METRICS} />
          <BentoMicroTile index={MICRO_TILES[2]!.index} icon={MICRO_TILES[2]!.icon} />

          {/* Row 4: FilterGraph (full width) */}
          <BentoProjectTile project={BENTO_PROJECTS[2]!} index={2} className="md:col-span-3" />
        </div>

        {/* Marquee */}
        <BentoMarquee />
      </div>
    </section>
  )
}
