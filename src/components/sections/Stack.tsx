import { useBlock } from '@/content/ContentProvider'
import { useProfile } from '@/content/useProfile'
import type { BlockComponentProps } from '@/content/blocks'
import type { StackContent, StackSettings } from '@norav/content-schema'

/**
 * The tools I work with, from the profile's skills: the same list the
 * terminal's `ask` answers from, so the two can't drift apart.
 */
export function Stack({ blockId }: BlockComponentProps) {
  const block = useBlock<StackContent, StackSettings>('stack', blockId)
  const { skills } = useProfile()
  if (!block || skills.length === 0) return null
  const { content } = block

  return (
    <section className="relative px-gutter-x py-20 md:py-28">
      <div className="w-full max-w-content mx-auto">
        <div className="max-w-3xl">
          {content.sectionLabel && <p className="label-mono">{content.sectionLabel}</p>}
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">{content.title}</h2>
          {content.description && (
            <p className="mt-4 text-body-regular text-tertiary-ink/70 max-w-[60ch]">{content.description}</p>
          )}
        </div>

        <dl className="mt-10 border-t border-tertiary-ink/15">
          {skills.map((group) => (
            <div key={group.group} className="grid gap-2 border-b border-tertiary-ink/15 py-6 md:grid-cols-12 md:gap-8">
              <dt className="md:col-span-4 text-body-regular font-semibold text-tertiary-ink">{group.group}</dt>
              <dd className="md:col-span-8 text-body-regular text-tertiary-ink/70 leading-relaxed">{group.items}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
