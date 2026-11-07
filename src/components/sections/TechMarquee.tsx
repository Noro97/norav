import { useBlock } from '@/content/ContentProvider'
import type { TechMarqueeContent, TechMarqueeSettings } from '@norav/content-schema'

/** The tools, as a still list. S5 replaces this block with the tool stack on /about. */
export function TechMarquee() {
  const block = useBlock<TechMarqueeContent, TechMarqueeSettings>('tech_marquee')

  if (!block) return null
  const { content } = block
  const names = content.items.map((item) => item.name)

  return (
    <section
      className="relative py-10"
      aria-label={content.label}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
      <p className="text-center label-mono mb-6">{content.label}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6 max-w-content mx-auto">
        {names.map((tech, i) => (
          <span
            key={i}
            className="font-display text-body-large font-semibold text-tertiary-ink/25 hover:text-tertiary-ink/50 transition-colors duration-300 tracking-tight"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-tertiary-ink/[0.06] to-transparent" />
    </section>
  )
}
