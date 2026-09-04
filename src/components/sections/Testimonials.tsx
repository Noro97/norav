import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useBlock } from '@/content/ContentProvider'
import { EffectCard } from '@/components/ui/effects/EffectCard'
import type { TestimonialsContent, TestimonialsSettings } from '@norav/content-schema'

export function Testimonials({ anchorId, blockId }: { anchorId?: string | null; blockId?: string }) {
  const block = useBlock<TestimonialsContent, TestimonialsSettings>('testimonials', blockId)
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const cards = sectionRef.current!.querySelectorAll('.quote-card')
    if (!cards.length) return
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      }
    )
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-white/40 text-base max-w-xl mb-12">{content.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.quotes.map((quote, index) => (
            <EffectCard
              key={index}
              effect={settings.cardEffect}
              className="quote-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-6 flex flex-col gap-5 transition-all duration-300 hover:border-crimson-500/20"
            >
              <span aria-hidden="true" className="font-display text-4xl leading-none text-crimson-500/40">
                &ldquo;
              </span>
              <blockquote className="text-white/70 text-sm leading-relaxed flex-1">
                {quote.quote}
              </blockquote>
              <figcaption className="mt-auto">
                <span className="block text-white font-semibold text-sm">{quote.author}</span>
                {quote.role && (
                  <span className="block font-mono text-xs text-white/40 mt-0.5">{quote.role}</span>
                )}
              </figcaption>
            </EffectCard>
          ))}
        </div>
      </div>
    </section>
  )
}
