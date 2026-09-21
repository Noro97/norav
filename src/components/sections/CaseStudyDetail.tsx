import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useBlock } from '@/content/ContentProvider'
import type { CaseStudyDetailContent } from '@norav/content-schema'

interface Props {
  anchorId?: string | null
  /**
   * Which study's decisions to read. The five case studies each have a type of
   * their own — a type names exactly one block on this site — so the component
   * is told which one it is rather than working it out.
   */
  type: string
}

/**
 * The reasoning under a case study's demo: what was decided, why, and what came
 * of it.
 *
 * Every part is optional and none of it has a placeholder. A study nobody has
 * written about yet renders nothing at all — not a heading over three dashes —
 * which is what lets the five be filled one at a time without the unfinished
 * ones looking broken.
 */
export function CaseStudyDetail({ anchorId, type }: Props) {
  const block = useBlock<CaseStudyDetailContent>(type)
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const items = sectionRef.current?.querySelectorAll('.detail-item')
      if (!items?.length) return
      gsap.fromTo(
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )
    },
    { scope: sectionRef, dependencies: [block] }
  )

  if (!block) return null
  const { sectionLabel, title, intro, decisions, metrics } = block.content

  // Nothing written is not an empty section with a heading over it — it is no
  // section. The demo above already stands on its own.
  if (!title && !intro && decisions.length === 0 && metrics.length === 0) return null

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {sectionLabel && <span className="label-mono">{sectionLabel}</span>}
        {title && (
          <h2 className="font-display text-display-lg font-black text-tertiary-ink mt-3 mb-4">
            {title}
          </h2>
        )}
        {intro && <p className="text-tertiary-ink/40 text-body-md max-w-2xl leading-relaxed">{intro}</p>}

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="detail-item rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl px-5 py-6"
              >
                <div className="font-mono text-display-md text-primary-400 tabular-nums">
                  {metric.value}
                </div>
                <div className="text-tertiary-ink/40 text-body-xs mt-2 leading-snug">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {decisions.length > 0 && (
          <ol className="mt-12 space-y-px">
            {decisions.map((decision, index) => (
              <li
                key={index}
                className="detail-item group relative border-t border-tertiary-ink/[0.06] py-7 transition-colors duration-300 hover:border-primary-500/20 last:border-b"
              >
                <div className="flex gap-5 md:gap-8">
                  <span className="label-mono shrink-0 pt-1 text-primary-400/50 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-tertiary-ink font-semibold text-body-md md:text-body-lg">
                      {decision.title}
                    </h3>
                    <p className="text-tertiary-ink/40 text-body-sm md:text-body-md leading-relaxed mt-2">
                      {decision.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

/**
 * One per study, so `BLOCK_COMPONENTS` can name them the way it names every
 * other section and the lazy import stays a plain named export.
 */
export const LogisticsDetail = (props: { anchorId?: string | null }) => (
  <CaseStudyDetail {...props} type="logistics_detail" />
)
export const MerchDetail = (props: { anchorId?: string | null }) => (
  <CaseStudyDetail {...props} type="merch_detail" />
)
export const EcommerceDetail = (props: { anchorId?: string | null }) => (
  <CaseStudyDetail {...props} type="ecommerce_detail" />
)
export const OmniGridDetail = (props: { anchorId?: string | null }) => (
  <CaseStudyDetail {...props} type="omnigrid_detail" />
)
export const ProofDetail = (props: { anchorId?: string | null }) => (
  <CaseStudyDetail {...props} type="proof_detail" />
)
