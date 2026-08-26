import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock, useCollection } from '@/content/ContentProvider'
import type { ExperienceBlockContent, ExperienceContent, ExperienceData } from '@norav/content-schema'

/** A published row: the non-localized columns composed with the translated ones. */
type ExperienceRow = ExperienceData & ExperienceContent

function InteractiveImageCard({ src, alt }: { src: string; alt: string }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg)')
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  const frameRef = useRef(0)
  const latest = useRef({ x: 0.5, y: 0.5 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    latest.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
    // One re-render per frame instead of one per mousemove event.
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      const { x, y } = latest.current
      setTransform(`perspective(800px) rotateX(${(y - 0.5) * -16}deg) rotateY(${(x - 0.5) * 16}deg) scale3d(1.03,1.03,1.03)`)
      setGlare({ x: x * 100, y: y * 100, opacity: 0.15 })
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)')
    setGlare({ x: 50, y: 50, opacity: 0 })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-shadow duration-500 hover:shadow-[0_0_40px_-8px_rgba(181,26,43,0.2)] will-change-transform"
      style={{ transform, transition: 'transform 0.15s ease-out' }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      {/* Glare overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        }}
      />
      {/* Edge highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/[0.08]" />
    </div>
  )
}

export function ExperienceTimeline({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<ExperienceBlockContent, { showImages: boolean }>('experience')
  const roles = useCollection<ExperienceRow>('experience')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'experience', sectionRef)

  useGSAP(() => {
    const section = sectionRef.current!
    const timelineFill = section.querySelector('.timeline-line-fill')
    if (timelineFill) {
      gsap.fromTo(timelineFill,
        { scaleY: 0 },
        { scaleY: 1, transformOrigin: 'top', ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom 40%', scrub: 1 } }
      )
    }

    const cards = section.querySelectorAll('.exp-card')
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
        { opacity: 1, x: 0, duration: 0.7,
          scrollTrigger: { trigger: card, start: 'top 90%' } }
      )
    })

    const illustrations = section.querySelectorAll('.exp-illustration')
    illustrations.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, x: i % 2 === 0 ? 40 : -40, scale: 0.92 },
        { opacity: 1, x: 0, scale: 1, duration: 0.8, delay: 0.2,
          scrollTrigger: { trigger: el, start: 'top 90%' } }
      )
    })
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      id={anchorId ?? 'experience'}
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4" data-cursor="text">
          {content.title}
        </h2>
        <p className="text-white/40 text-base max-w-xl mb-16" data-cursor="text">
          {content.description}
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/5">
            <div className="timeline-line-fill absolute inset-0 bg-gradient-to-b from-crimson-500/60 via-crimson-500/20 to-transparent" />
          </div>

          {/* Cards */}
          <div className="space-y-12 md:space-y-16">
            {roles.map((role, i) => {
              const exp = role.data
              const isLeft = i % 2 === 0
              const company = exp.company

              return (
                <div
                  key={role.id}
                  className={`exp-card relative flex flex-col md:flex-row ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-start gap-8 md:gap-0`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-crimson-500 border-2 border-[#0a0a1a] z-10 mt-6 shadow-[0_0_8px_rgba(181,26,43,0.5)]" />

                  {/* Content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${
                      isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'
                    }`}
                  >
                    <div className="glass-card p-6 hover:translate-y-[-2px] transition-transform">
                      {/* Header */}
                      <div className={`flex items-start gap-3 mb-4 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        {/* Company logo placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center shrink-0">
                          <span className="font-mono text-xs text-crimson-400 font-bold">
                            {company.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base">{exp.role}</h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-mono text-xs text-crimson-400">{company}</span>
                            <span className="text-white/35">·</span>
                            <span className="font-mono text-xs text-white/45">{exp.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Period badge */}
                      <div className={`mb-3 ${isLeft ? 'md:text-right' : ''}`}>
                        <span className="inline-block px-2 py-0.5 bg-white/5 rounded font-mono text-xs text-white/40 tracking-wider">
                          {exp.period}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-white/40 text-sm leading-relaxed mb-4 ${isLeft ? 'md:text-right' : ''}`} data-cursor="text">
                        {exp.description}
                      </p>

                      {/* Achievements */}
                      <ul className="space-y-1.5 mb-4">
                        {exp.achievements.map((achievement, j) => (
                          <li key={j} className={`flex gap-2 text-xs text-white/50 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                            <span className="text-crimson-500 shrink-0 mt-0.5">▸</span>
                            <span>{achievement.text}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech stack */}
                      <div className={`flex flex-wrap gap-1.5 ${isLeft ? 'md:justify-end' : ''}`}>
                        {exp.stack.map((tech) => (
                          <span
                            key={tech.name}
                            className="px-2 py-0.5 text-xs font-mono text-white/45 bg-white/3 border border-white/5 rounded"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive illustration */}
                  {settings.showImages && exp.image && (
                    <div
                      className={`exp-illustration hidden md:flex md:w-1/2 items-center ${
                        isLeft ? 'md:pl-12' : 'md:pr-12'
                      }`}
                    >
                      <InteractiveImageCard src={exp.image} alt={`${company} illustration`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
