import { useBlock } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { ImpactStripContent, ImpactStripSettings } from '@norav/content-schema'

/**
 * The numbers, final from the first frame, each with what it counts and where
 * it comes from. A screenshot, a shared link and a recruiter skimming the page
 * all see this, and a number without its source is a counter, not evidence.
 */
export function ImpactStrip({ blockId }: BlockComponentProps) {
  const block = useBlock<ImpactStripContent, ImpactStripSettings>('impact_strip', blockId)
  if (!block) return null
  const { content } = block

  return (
    <section className="relative px-gutter-x pb-20 md:pb-28" aria-label={content.label || undefined}>
      <div className="w-full max-w-content mx-auto">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-tertiary-ink/15">
          {content.stats.map((stat, index) => (
            <li key={index} className="flex flex-col gap-2 border-b border-tertiary-ink/15 py-6 sm:pr-8 lg:border-b-0 lg:py-8">
              <p className="font-display text-heading-large font-black text-tertiary-ink tabular-nums leading-none">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </p>
              <p className="text-body-small text-tertiary-ink/80 leading-snug max-w-[28ch]">{stat.label}</p>
              {stat.source && <p className="text-caption text-tertiary-ink/55">{stat.source}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
