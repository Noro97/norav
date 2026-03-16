import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import { useTranslation } from 'react-i18next'
import { BENTO_PROJECTS, BENTO_METRICS, MICRO_TILES } from './bento.data'
import { BentoProjectTile } from './BentoProjectTile'
import { BentoMicroTile } from './BentoMicroTile'
import { BentoImpactDashboard } from './BentoImpactDashboard'
import { BentoMarquee } from './BentoMarquee'

gsap.registerPlugin(ScrollTrigger)

export function BentoGrid() {
  const { t } = useTranslation('bento')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('overview', sectionRef)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento-header', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })

      gsap.from('.bento-tile', {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="overview"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24 micro-grid-bg"
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bento-header mb-12">
          <span className="label-mono">{t('sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
            {t('title')}
          </h2>
          <p className="text-white/40 text-base max-w-xl">
            {t('description')}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Row 1: NexusRoute (2col) + Perf Audit (1col) */}
          <BentoProjectTile project={BENTO_PROJECTS[0]!} className="md:col-span-2" />
          <BentoMicroTile index={MICRO_TILES[0]!.index} icon={MICRO_TILES[0]!.icon} />

          {/* Row 2: Type-Safe (1col) + MerchForge (2col) */}
          <BentoMicroTile index={MICRO_TILES[1]!.index} icon={MICRO_TILES[1]!.icon} />
          <BentoProjectTile project={BENTO_PROJECTS[1]!} className="md:col-span-2" />

          {/* Row 3: Impact Dashboard (2col) + UX Predict (1col) */}
          <BentoImpactDashboard metrics={BENTO_METRICS} />
          <BentoMicroTile index={MICRO_TILES[2]!.index} icon={MICRO_TILES[2]!.icon} />

          {/* Row 4: FilterGraph (full width) */}
          <BentoProjectTile project={BENTO_PROJECTS[2]!} className="md:col-span-3" />
        </div>

        {/* Row 5: Marquee (outside grid) */}
        <BentoMarquee />
      </div>
    </section>
  )
}
