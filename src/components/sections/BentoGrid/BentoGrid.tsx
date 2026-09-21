import { useCallback, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { BENTO_PROJECTS, MICRO_TILES } from './bento.data'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent, BentoGridSettings } from '@norav/content-schema'
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
      className="bento-tile group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl flex items-center justify-center p-4 transition-all duration-500 hover:border-primary-500/20 will-change-transform"
      style={{ transition: 'transform 0.15s ease-out' }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-auto max-h-full object-contain rounded-lg transition-transform duration-500 group-hover:scale-105"
      />
      {/* Glare */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,color-mix(in srgb, var(--color-tertiary-ink) 6%, transparent),transparent_60%)]" />
    </div>
  )
}

export function BentoGrid({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<BentoGridContent, BentoGridSettings>('bento_grid')
  const sectionRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'overview', sectionRef)

  // A tile's illustration lives on the same entry as its words, found by the
  // slot the layout reserved for it.
  const tileImage = (slot: number) =>
    block?.content.tiles.find((tile) => tile.slot === slot)?.image || undefined
  const illustrations = block?.content.illustrations ?? { omnigrid: '', gamification: '' }

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

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      id={anchorId ?? 'overview'}
      ref={sectionRef}
      className="relative px-6 md:px-16 py-28 md:py-36"
    >
      {/* Section ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bento-header mb-16">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="font-display text-display-xl font-black text-tertiary-ink mt-4 mb-5">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/45 text-body-md md:text-body-lg max-w-xl leading-relaxed">
            {content.description}
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-primary-500/50 to-transparent mt-8" />
        </div>

        {/* Bento Grid */}
        {/* Illustrations are addressed by the same keys as the copy: a slot
            number for the tiles, a name for the two standalone panels. */}
        <div
          ref={gridRef}
          className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 ${settings.glowBorder ? 'bento-glow' : ''}`}
        >
          {/* Row 1: NexusRoute (2col) + Perf Audit (1col) */}
          <BentoProjectTile project={BENTO_PROJECTS[0]!} index={0} className="md:col-span-2" />
          <BentoMicroTile index={MICRO_TILES[0]!.index} icon={MICRO_TILES[0]!.icon} illustration={tileImage(MICRO_TILES[0]!.index)} />

          {/* Row 2: Type-Safe (1col) + MerchForge (2col) */}
          <BentoMicroTile index={MICRO_TILES[1]!.index} icon={MICRO_TILES[1]!.icon} illustration={tileImage(MICRO_TILES[1]!.index)} />
          <BentoProjectTile project={BENTO_PROJECTS[1]!} index={1} className="md:col-span-2" />

          {/* Row 3: Impact Dashboard (2col) + UX Predict (1col) */}
          <BentoImpactDashboard />
          <BentoMicroTile index={MICRO_TILES[2]!.index} icon={MICRO_TILES[2]!.icon} illustration={tileImage(MICRO_TILES[2]!.index)} />

          {/* Row 4: FilterGraph (full width) */}
          <BentoProjectTile project={BENTO_PROJECTS[2]!} index={2} className="md:col-span-3" />

          {/* Row 5: Cache Hit-Rate + illustration (1col stacked) + OmniGrid (2col) */}
          <div className="flex flex-col gap-3 md:gap-4">
            <BentoMicroTile index={MICRO_TILES[4]!.index} icon={MICRO_TILES[4]!.icon} />
            {illustrations.omnigrid && <BentoIllustration src={illustrations.omnigrid} alt="OmniGrid illustration" />}
          </div>
          <OmniGridBentoTile className="md:col-span-2" />

          {/* Row 6: ProofVerification (2col) + ProofEconomy (1col) */}
          <ProofVerificationTile className="md:col-span-2" />
          <ProofEconomyTile />

          {/* Row 7: AI Liveness + illustration (1col stacked) + ProofGamification (2col) */}
          <div className="flex flex-col gap-3 md:gap-4">
            <BentoMicroTile index={MICRO_TILES[3]!.index} icon={MICRO_TILES[3]!.icon} />
            {illustrations.gamification && <BentoIllustration src={illustrations.gamification} alt="Gamification illustration" />}
          </div>
          <ProofGamificationTile className="md:col-span-2" />
        </div>

        {/* Marquee */}
        <BentoMarquee />
      </div>
    </section>
  )
}
