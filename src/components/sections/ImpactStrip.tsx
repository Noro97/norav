import { useBlock } from '@/content/ContentProvider'
import type { ImpactStripContent, ImpactStripSettings } from '@norav/content-schema'

/**
 * The numbers, final from the first frame. A screenshot, a shared link and a
 * recruiter skimming the page all see this, and 80% of a true number is a false one.
 */
export function ImpactStrip() {
  const block = useBlock<ImpactStripContent, ImpactStripSettings>('impact_strip')
  if (!block) return null
  const { content } = block

  return (
    <section className="relative px-gutter-x py-16" aria-label={content.label}>
      <div className="relative z-10 w-full max-w-content mx-auto">
        <div className="rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl px-6 py-10 md:py-12">
          <p className="text-center label-mono mb-8">{content.label}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-2">
                <span className="font-display text-heading-large font-black text-tertiary-ink tabular-nums">
                  {stat.prefix}
                  {stat.value}
                  {stat.suffix}
                </span>
                <span className="type-label text-tertiary-ink/40">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
