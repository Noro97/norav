import { useBlock } from '@/content/ContentProvider'
import { useCaseStudyLabel } from '@/content/case-studies'
import type { CaseStudyContent, CaseStudySettings } from '@norav/content-schema'

/**
 * A demo's own words, until the demo mounts. It's what a prerendered page carries for
 * a widget that only exists in a browser, so the address has real text before any
 * JavaScript runs. Top-aligned and a screen tall, so the demo arriving moves little.
 */
export function WidgetPlaceholder({ type }: { type: string }) {
  const block = useBlock<CaseStudyContent, CaseStudySettings>(type)
  const sectionLabel = useCaseStudyLabel(type, block?.content.sectionLabel ?? '')
  if (!block) return null
  const { content } = block

  return (
    <section className="relative min-h-screen px-gutter-x py-24">
      <div className="relative z-10 w-full max-w-content mx-auto">
        <span className="label-mono">{sectionLabel}</span>
        <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">{content.title}</h2>
        <p className="text-body-large text-tertiary-ink/50 max-w-2xl mt-4">{content.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {content.techStack.map((tag) => (
            <span key={tag.name} className="case-study-pill text-caption font-mono text-tertiary-ink/45">
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
