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
      className="relative px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-4">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-tertiary-ink/40 text-body-regular max-w-xl mb-12">{content.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {content.quotes.map((quote, index) => (
            <EffectCard
              key={index}
              effect={settings.cardEffect}
              className="quote-card group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-6 flex flex-col gap-5 transition-all duration-300 hover:border-primary-500/20"
            >
              <span aria-hidden="true" className="font-display text-heading-medium text-primary-500/40">
                &ldquo;
              </span>
              <blockquote className="text-tertiary-ink/70 text-body-small leading-relaxed flex-1">
                {quote.quote}
              </blockquote>
              <figcaption className="mt-auto">
                <span className="block text-tertiary-ink font-semibold text-body-small">{quote.author}</span>
                {quote.role && (
                  <span className="block font-mono text-caption text-tertiary-ink/40 mt-0.5">{quote.role}</span>
                )}
              </figcaption>
            </EffectCard>
          ))}
        </div>
      </div>
    </section>
  )
}
