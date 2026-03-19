import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { BentoVideoPlaceholder } from './BentoVideoPlaceholder'
import type { BentoProject } from './bento.data'

const TILE_ILLUSTRATIONS: Record<string, string> = {
  nexusroute: '/assets/img/bento-nexusroute.png',
  merchforge: '/assets/img/bento-merchforge.png',
}

interface BentoProjectTileProps {
  project: BentoProject
  className?: string
  index: number
}

export function BentoProjectTile({ project, className = '', index }: BentoProjectTileProps) {
  const { t } = useTranslation('bento')
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
      data-cursor={project.videoSrc && inViewport ? 'play' : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bento-tile group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-crimson-500/20 hover:shadow-[0_0_60px_-12px_rgba(181,26,43,0.15)] ${className}`}
    >
      {/* Abstract gradient mesh — unique per tile via hue rotation */}
      <div
        className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at ${index === 0 ? '20% 30%' : index === 1 ? '80% 20%' : '50% 80%'}, rgba(181,26,43,0.6) 0%, transparent 50%), radial-gradient(ellipse at ${index === 0 ? '80% 70%' : index === 1 ? '20% 80%' : '90% 20%'}, rgba(100,20,40,0.3) 0%, transparent 60%)`,
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
      {TILE_ILLUSTRATIONS[project.id] && (
        <img
          src={TILE_ILLUSTRATIONS[project.id]}
          alt=""
          loading="lazy"
          className="absolute right-0 top-0 h-full w-1/2 object-contain object-right opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none hidden md:block"
        />
      )}

      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-crimson-500/40 to-transparent" />

      <motion.div className="relative p-6 md:p-8" style={{ y }}>
        {/* Case study number — large watermark */}
        <div className="absolute top-4 right-6 md:right-8 font-mono text-[72px] md:text-[96px] font-black leading-none text-crimson-500/10 select-none pointer-events-none tracking-tighter">
          {caseNum}
        </div>

        {/* Label */}
        <div className="flex items-center gap-3 mb-5">
          <span className="font-mono text-xs text-crimson-500 tracking-[0.25em] uppercase">
            Case Study {caseNum}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-3 group-hover:text-crimson-50 transition-colors duration-300">
          {t(project.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-lg">
          {t(project.descriptionKey)}
        </p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 text-xs font-mono text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-md tracking-wide"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTA */}
        <MagneticButton
          onClick={handleScrollTo}
          aria-label={`${t(project.ctaKey)} — ${t(project.titleKey)}`}
          className="inline-flex items-center gap-2.5 text-xs font-mono text-crimson-400/80 uppercase tracking-[0.15em] group/btn hover:text-crimson-300 transition-colors duration-300"
          data-cursor="link"
        >
          <span className="relative">
            {t(project.ctaKey)}
            <span className="absolute -bottom-px left-0 w-0 h-px bg-crimson-500/50 group-hover/btn:w-full transition-all duration-300" />
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300"
          >
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </MagneticButton>
      </motion.div>

      {/* Bottom edge glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson-500/0 to-transparent group-hover:via-crimson-500/30 transition-all duration-700" />
    </div>
  )
}
