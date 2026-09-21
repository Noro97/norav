import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { BentoVideoPlaceholder } from './BentoVideoPlaceholder'
import type { BentoProject } from './bento.data'

interface BentoProjectTileProps {
  project: BentoProject
  className?: string
  index: number
}

export function BentoProjectTile({ project, className = '', index }: BentoProjectTileProps) {
  const block = useBlock<BentoGridContent>('bento_grid')
  // Copy is addressed by project id, so the mosaic's layout and its words
  // can move independently.
  const copy = block?.content.projects.find((candidate) => candidate.project === project.id)
  // The illustration is addressed the same way the words are. Empty draws
  // none, which is how the Proof tiles have always looked.
  const illustration = copy?.image ?? ''
  const tileRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [inViewport, setInViewport] = useState(false)

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  useEffect(() => {
    if (!tileRef.current || !project.videoSrc) return
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry!.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(tileRef.current)
    return () => observer.disconnect()
  }, [project.videoSrc])

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current && inViewport) {
      videoRef.current.play().catch(() => {})
      videoRef.current.style.opacity = '0.15'
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.style.opacity = '0'
      setTimeout(() => videoRef.current?.pause(), 300)
    }
  }

  const handleScrollTo = useCallback(() => {
    document.getElementById(project.targetSectionId)?.scrollIntoView({ behavior: 'smooth' })
  }, [project.targetSectionId])

  const caseNum = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={tileRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bento-tile group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-primary-500/20 hover:shadow-[0_0_60px_-12px_color-mix(in_srgb,_var(--color-primary-500)_15%,_transparent)] ${className}`}
    >
      {/* Abstract gradient mesh — unique per tile via hue rotation */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at ${index === 0 ? '20% 30%' : index === 1 ? '80% 20%' : '50% 80%'}, color-mix(in srgb, var(--color-primary-500) 60%, transparent) 0%, transparent 50%), radial-gradient(ellipse at ${index === 0 ? '80% 70%' : index === 1 ? '20% 80%' : '90% 20%'}, color-mix(in srgb, var(--color-primary-700) 30%, transparent) 0%, transparent 60%)`,
        }}
      />

      {/* Animated canvas placeholder (activates on hover) */}
      <BentoVideoPlaceholder variant={project.variant} active={isHovered} />

      {project.videoSrc && inViewport && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-400 pointer-events-none"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        >
          <source src={project.videoSrc.webm} type="video/webm" />
          <source src={project.videoSrc.mp4} type="video/mp4" />
        </video>
      )}

      {/* Illustration — right side */}
      {illustration && (
        <img
          src={illustration}
          alt=""
          loading="lazy"
          className="absolute right-0 top-0 h-full w-1/2 object-contain object-right opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none hidden md:block"
        />
      )}

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

      <motion.div className="relative p-6 md:p-8" style={{ y }}>
        {/* Case study number — large watermark */}
        <div className="absolute top-4 right-6 md:right-8 font-mono text-[72px] md:text-[96px] font-black leading-none text-primary-500/10 select-none pointer-events-none tracking-tighter">
          {caseNum}
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="type-label text-primary-500">
            Case Study {caseNum}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-tertiary-ink/[0.06] to-transparent" />
        </div>

        {/* Title */}
        <h3 className="font-display text-display-sm font-black text-tertiary-ink mb-3 group-hover:text-primary-50 transition-colors duration-300">
          {copy?.title ?? ''}
        </h3>

        {/* Description */}
        <p className="text-body-sm text-tertiary-ink/60 leading-relaxed mb-6 max-w-lg">
          {copy?.description ?? ''}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-body-xs font-mono text-tertiary-ink/50 bg-tertiary-ink/[0.04] border border-tertiary-ink/[0.08] rounded-md tracking-wide"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <MagneticButton
          onClick={handleScrollTo}
          aria-label={`${copy?.cta ?? ''} — ${copy?.title ?? ''}`}
          className="type-label inline-flex items-center gap-2.5 text-primary-400/80 group/btn hover:text-primary-300 transition-colors duration-300"
        >
          <span className="relative">
            {copy?.cta ?? ''}
            <span className="absolute -bottom-px left-0 w-0 h-px bg-primary-500/50 group-hover/btn:w-full transition-all duration-300" />
          </span>
          <ArrowUpRight
            size={12}
            className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300"
          />
        </MagneticButton>
      </motion.div>

      {/* Bottom edge glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/0 to-transparent group-hover:via-primary-500/30 transition-all duration-700" />
    </div>
  )
}
