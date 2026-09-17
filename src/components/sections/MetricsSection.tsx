import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useBlock } from '@/content/ContentProvider'
import { CountUp } from '@/components/ui/effects/CountUp'
import type { MetricsContent, MetricsSettings } from '@norav/content-schema'

export function MetricsSection({ anchorId, blockId }: { anchorId?: string | null; blockId?: string }) {
  const block = useBlock<MetricsContent, MetricsSettings>('metrics', blockId)
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const items = sectionRef.current!.querySelectorAll('.metric-item')
    if (!items.length) return
    gsap.fromTo(
      items,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      }
    )
  }, { scope: sectionRef })

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-gutter-x py-20"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-4">
          {content.title}
        </h2>
        {content.description && (
          <p className="text-tertiary-ink/40 text-body-regular max-w-xl mb-12">{content.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
          {content.metrics.map((metric, index) => (
            <div key={index} className="metric-item flex flex-col items-center text-center gap-2">
              <span className="font-display text-heading-large font-black text-tertiary-ink">
                {settings.countUp ? (
                  <CountUp target={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                ) : (
                  `${metric.prefix}${metric.value}${metric.suffix}`
                )}
              </span>
              <span className="type-label text-tertiary-ink/40">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
