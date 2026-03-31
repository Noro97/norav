import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import { useAppStore } from '@/store/useAppStore'

export function HeroSection() {
  const { t } = useTranslation('hero')
  const containerRef = useRef<HTMLDivElement>(null)
  useSectionObserver('hero', containerRef)
  const charsRef = useRef<HTMLSpanElement[]>([])
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Animate character spans (gsap.to is safe — explicit end state)
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

    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.8
    )

    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      1.0
    )

    tl.fromTo(
      scrollHintRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 },
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
        scrub: 0.5,
      },
    })

    // Write scroll progress to store for HeroMonolith fade
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => useAppStore.getState().setHeroScrollProgress(self.progress),
    })
  }, { scope: containerRef })

  const handleClick = () => {
    const store = useAppStore.getState()
    if (!store.heroExploded) {
      store.setHeroExploded(true)
      store.triggerParticleBurst()
    }
  }

  const nameParts = [
    { text: t('firstName.highlight'), crimson: true },
    { text: t('firstName.rest'), crimson: false },
    { text: ' ', crimson: false },
    { text: t('lastName.highlight'), crimson: true },
    { text: t('lastName.rest'), crimson: false },
  ]

  let charIndex = 0

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="relative z-10 max-w-4xl mx-auto pt-[28vh]">
        <p
          ref={subtitleRef}
          className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-crimson-500 mb-6"
        >
          {t('subtitle')}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.05em] leading-none mb-8 pr-[0.05em]" style={{ fontFamily: 'var(--font-family-display)' }}>
          {nameParts.map((part) =>
            part.text.split('').map((char) => {
              const idx = charIndex++
              return (
                <span
                  key={idx}
                  ref={(el) => { if (el) charsRef.current[idx] = el }}
                  className={`inline-block opacity-0 translate-y-[40px]${part.crimson ? ' text-crimson-500' : ''}`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })
          )}
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
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/20">
          {t('scrollHint')}
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-crimson-500/50 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
