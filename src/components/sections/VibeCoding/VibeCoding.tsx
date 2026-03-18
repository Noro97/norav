import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useInView } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import { TerminalGhosting } from './TerminalGhosting'
import { VibeSlider } from './VibeSlider'

export function VibeCoding() {
  const { t } = useTranslation('vibecoding')
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  useSectionObserver('vibecoding', sectionRef)

  const isInView = useInView(sectionRef, { once: false, amount: 0.2 })

  // GSAP scroll-triggered entrance
  useGSAP(() => {
    const header = sectionRef.current!.querySelector('.vc-header')
    if (header) {
      gsap.fromTo(
        header.children,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 80%' },
        }
      )
    }

    const content = contentRef.current
    if (content) {
      gsap.fromTo(
        content.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: content, start: 'top 80%' },
        }
      )
    }
  }, { scope: sectionRef })

  return (
    <section
      id="vibecoding"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-28 md:py-36 overflow-hidden"
    >
      {/* Terminal ghosting background */}
      <TerminalGhosting active={isInView} />

      {/* Soft fade edges for ghosting — transparent so page body shows through */}
      <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-background/60 to-transparent pointer-events-none z-1" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background/60 to-transparent pointer-events-none z-1" />

      {/* Section ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-crimson-500/[0.03] blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="vc-header mb-16">
          <span className="label-mono">{t('sectionLabel')}</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mt-4 mb-5">
            {t('title')}
          </h2>
          <p className="text-white/35 text-base md:text-lg max-w-xl leading-relaxed">
            {t('body')}
          </p>
          <div className="h-px w-24 bg-gradient-to-r from-crimson-500/50 to-transparent mt-8" />
        </div>

        {/* Two-column layout */}
        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Manifesto content */}
          <div className="flex flex-col gap-10">
            {/* Micro-copy */}
            <blockquote className="pl-5 border-l-2 border-crimson-500/40">
              <p className="font-mono text-sm md:text-base text-white/50 italic leading-relaxed">
                {t('microCopy')}
              </p>
            </blockquote>

            {/* Systems synced */}
            <div>
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-[0.2em] block mb-3">
                {t('systemsSynced')}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'TON / Web3', color: 'border-sky-500/30 text-sky-400/70' },
                  { label: 'Gemini AI', color: 'border-violet-500/30 text-violet-400/70' },
                  { label: 'Supabase', color: 'border-emerald-500/30 text-emerald-400/70' },
                ].map((tech) => (
                  <span
                    key={tech.label}
                    className={`font-mono text-xs px-3 py-1.5 rounded-lg border bg-white/[0.02] ${tech.color}`}
                  >
                    {tech.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '92%', label: t('stats.coverage') },
                { value: '27', label: t('stats.migrations') },
                { value: '3', label: t('stats.systems') },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-white/80 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[9px] text-white/25 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Vibe Slider */}
          <VibeSlider />
        </div>
      </div>
    </section>
  )
}
