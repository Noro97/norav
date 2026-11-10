import { useMemo } from 'react'
import { Link } from 'react-router'
import { useBlock, useContent } from '@/content/ContentProvider'
import { hrefFor } from '@/content/routing'
import { workCards } from '@/content/work'
import type { BlockComponentProps } from '@/content/blocks'
import type { WorkIndexContent, WorkIndexSettings } from '@norav/content-schema'

/**
 * Case studies or live demos, as an index: one row per page, the title on the
 * left and what it is on the right, ruled like a table of contents rather than
 * dealt out as cards. The whole row is the link.
 */
export function WorkIndex({ blockId, first }: BlockComponentProps) {
  const block = useBlock<WorkIndexContent, WorkIndexSettings>('work_index', blockId)
  const { snapshot, locale } = useContent()
  const items = block?.content.items
  const cards = useMemo(() => workCards(snapshot, (items ?? []).map((item) => item.page)), [snapshot, items])
  // A list whose pages are all unpublished is a heading over nothing.
  if (!block || cards.length === 0) return null
  const { content } = block
  const Heading = first ? 'h1' : 'h2'
  const CardHeading = first ? 'h2' : 'h3'

  return (
    <section className={`relative px-gutter-x ${first ? 'pt-36 md:pt-44' : 'pt-20 md:pt-28'} pb-8`}>
      <div className="w-full max-w-content mx-auto">
        <div className="max-w-3xl">
          {content.sectionLabel && <p className="label-mono">{content.sectionLabel}</p>}
          <Heading
            className={`font-display font-black text-tertiary-ink mt-3 text-balance ${first ? 'text-heading-xlarge' : 'text-heading-large'}`}
          >
            {content.title}
          </Heading>
          {content.intro && (
            <p className="mt-4 text-body-regular text-tertiary-ink/70 max-w-[60ch] leading-relaxed">{content.intro}</p>
          )}
        </div>

        <ul className="mt-10 border-t border-tertiary-ink/15">
          {cards.map((card) => (
            <li
              key={card.page}
              className="group relative grid gap-3 border-b border-tertiary-ink/15 py-7 md:grid-cols-12 md:gap-8 md:py-9"
            >
              <div className="md:col-span-4">
                {content.cardLabel && <p className="text-caption text-tertiary-ink/55">{content.cardLabel}</p>}
                <CardHeading className="mt-1 font-display text-heading-small font-black text-tertiary-ink break-words">
                  {/* The row's one link: its box covers the row, so the whole
                      row answers a click, and a screen reader hears the title. */}
                  <Link
                    to={hrefFor(card.page, locale)}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {card.title}
                  </Link>
                </CardHeading>
              </div>
              <div className="md:col-span-8">
                {card.description && (
                  <p className="text-body-regular text-tertiary-ink/70 max-w-[62ch] leading-relaxed break-words">{card.description}</p>
                )}
                {card.stack.length > 0 && (
                  <p className="mt-3 text-caption text-tertiary-ink/55">{card.stack.join(' · ')}</p>
                )}
                <p
                  aria-hidden="true"
                  className="mt-4 text-body-small font-semibold text-primary-400 transition-colors duration-150 group-hover:text-tertiary-ink"
                >
                  {content.ctaLabel}
                </p>
              </div>
              {/* The focus ring goes round the row the link covers, not the title. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-3 inset-y-1 rounded-lg opacity-0 outline outline-2 outline-primary-400 group-has-[:focus-visible]:opacity-100"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
