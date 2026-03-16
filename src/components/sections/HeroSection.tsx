import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
  const { t } = useTranslation('hero')
  const containerRef = useRef<HTMLDivElement>(null)
  useSectionObserver('hero', containerRef)
  const charsRef = useRef<HTMLSpanElement[]>([])
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Animate character spans
      if (charsRef.current.length > 0) {
        tl.to(
          charsRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.03,
          },
          0.3
        )
      }

      tl.from(
        subtitleRef.current,
        { opacity: 0, y: 20, duration: 0.8 },
        0.8
      )

      tl.from(
        taglineRef.current,
        { opacity: 0, y: 20, duration: 0.8 },
        1.0
      )

      tl.from(
        scrollHintRef.current,
        { opacity: 0, duration: 1 },
        1.4
      )

      // Parallax on scroll
      gsap.to(containerRef.current, {
        yPercent: -20,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const heroName = t('name')

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <p
          ref={subtitleRef}
          className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-crimson-500 mb-6"
        >
          {t('subtitle')}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-none mb-8">
          {heroName.split('').map((char, i) => (
            <span
              key={i}
              ref={(el) => { if (el) charsRef.current[i] = el }}
              className="inline-block opacity-0 translate-y-[40px]"
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <p
          ref={taglineRef}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
        >
          {t('tagline.before')}{' '}
          <span className="text-crimson-400">{t('tagline.highlight1')}</span> {t('tagline.conjunction')}{' '}
          <span className="text-white/80">{t('tagline.highlight2')}</span>{t('tagline.after')}
        </p>
      </div>

      {/* Scroll hint */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/20">
          {t('scrollHint')}
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-crimson-500/50 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
