import { useBlock } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { KitFaqContent } from '@norav/content-schema'

/**
 * The questions a hiring manager asks first, all of them open.
 *
 * The imported kit drew these as an accordion that showed one answer at a time.
 * Six short answers read faster than six clicks, and a page that hides its
 * answers hides them from search and from Ctrl+F too. The block and its fields
 * are the kit's, so the CMS form is unchanged; only the drawing is the site's.
 */
export function Faq({ blockId }: BlockComponentProps) {
  const block = useBlock<KitFaqContent>('kit_faq', blockId)
  if (!block) return null
  const { content } = block
  const title = [content.title, content.titleAccent, content.titleTail]
    .filter(Boolean)
    .join(' ')
    .replace(/ ([.,;:!?])/g, '$1')

  return (
    <section className="relative px-gutter-x py-20 md:py-28">
      <div className="w-full max-w-content mx-auto">
        <div className="max-w-3xl">
          {content.headLabel && <p className="label-mono">{content.headLabel}</p>}
          {title && <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">{title}</h2>}
        </div>

        <dl className="mt-10 border-t border-tertiary-ink/15">
          {content.items.map((item, index) => (
            <div key={index} className="grid gap-3 border-b border-tertiary-ink/15 py-7 md:grid-cols-12 md:gap-8">
              <dt className="md:col-span-4 text-body-regular font-semibold text-tertiary-ink">{item.q}</dt>
              <dd className="md:col-span-8 text-body-regular text-tertiary-ink/70 leading-relaxed max-w-[62ch]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
