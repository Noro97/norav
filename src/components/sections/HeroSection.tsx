import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useAppStore } from '@/store/useAppStore'
import { useBlock } from '@/content/ContentProvider'
import { toneOf, type Tone } from '@/content/accent'
import type { HeroContent, HeroSettings } from '@norav/content-schema'

/** How a tagline segment is painted. */
const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'text-crimson-400',
}

/** Segments are space-joined, except one that opens with punctuation. */
function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

export function HeroSection() {
  const hero = useBlock<HeroContent, HeroSettings>('hero')
  const containerRef = useRef<HTMLDivElement>(null)
  useSectionObserver(hero?.anchorId ?? 'hero', containerRef)
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

  // Every hook has run by here, so the block being absent — hidden in the CMS —
  // can short-circuit the render.
  if (!hero) return null
  const { content, settings } = hero

  const nameParts = [
    { text: content.name.first.highlight, crimson: true },
    { text: content.name.first.rest, crimson: false },
    { text: ' ', crimson: false, lineBreak: true },
    { text: content.name.last.highlight, crimson: true },
    { text: content.name.last.rest, crimson: false },
  ]

  // Stable global char index per name part (running cumulative length), so the
  // render doesn't mutate a shared counter while emitting spans — unsafe under
  // concurrent rendering.
  const charBaseOffsets: number[] = []
  nameParts.reduce((offset, part, i) => {
    charBaseOffsets[i] = offset
    return offset + part.text.length
  }, 0)

  return (
    <section
      id={hero.anchorId ?? 'hero'}
      ref={containerRef}
      // Transparent to the pointer, all of it. The mark is drawn on the canvas
      // behind this layer and overlaps the copy at narrow widths, so anything
      // here that answered the pointer would cover it. Nothing in the hero is
      // interactive — it is a headline and two lines of prose — and the cost is
      // that they cannot be selected, which buys the mark being the one thing
      // in the section you can click.
      className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pointer-events-none"
    >
      <div className="relative z-10 max-w-4xl mx-auto pt-[28vh]">
        <p
          ref={subtitleRef}
          className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase text-crimson-500 mb-6"
        >
          {content.subtitle}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.05em] leading-none mb-8 pr-[0.05em]" style={{ fontFamily: 'var(--font-family-display)' }}>
          {nameParts.map((part, partIdx) => {
            const elements = part.text.split('').map((char, i) => {
              const idx = (charBaseOffsets[partIdx] ?? 0) + i
              return (
                <span
                  key={idx}
                  ref={(el) => { if (el) charsRef.current[idx] = el }}
                  className={`inline-block opacity-0 translate-y-[40px]${part.crimson ? ' text-crimson-500' : ''}${'lineBreak' in part && part.lineBreak ? ' hidden min-[425px]:inline-block' : ''}`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })
            if ('lineBreak' in part && part.lineBreak) {
              return [...elements, <br key="name-br" className="min-[425px]:hidden" />]
            }
            return elements
          })}
        </h1>

        <p
          ref={taglineRef}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
        >
          {content.tagline.map((segment, index) => (
            <Fragment key={index}>
              {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
              <span className={TONE_CLASS[toneOf(segment.accent)]}>{segment.text}</span>
            </Fragment>
          ))}
        </p>
      </div>

      {/* Scroll hint */}
      {settings.showScrollHint && (
        <div
          ref={scrollHintRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-white/20">
            {content.scrollHint}
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-crimson-500/50 to-transparent animate-pulse" />
        </div>
      )}
    </section>
  )
}
