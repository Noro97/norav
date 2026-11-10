import { Fragment } from 'react'
import { Link } from 'react-router'
import { useBlock } from '@/content/ContentProvider'
import { toneOf } from '@/content/accent'
import type { HeroContent, HeroSettings } from '@norav/content-schema'

/** Segments are space-joined, except one that opens with punctuation. */
function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/** The hero published before S5: a name for the H1 and a tagline under it. */
interface PreviousHero {
  subtitle?: string
  name?: { first: { highlight: string; rest: string }; last: { highlight: string; rest: string } }
  tagline?: HeroContent['headline']
}

/**
 * The hero as the current shape, from whichever shape was published.
 *
 * The code ships a few minutes before the copy it was written for, and in that
 * window the published hero is the old one. It reads as the old hero did, set
 * in the new layout, rather than as an empty heading. The follow-up to S5
 * removes this once the new copy is live.
 */
function current(content: HeroContent & PreviousHero): HeroContent {
  if (content.headline) return content
  const { first, last } = content.name ?? { first: { highlight: '', rest: '' }, last: { highlight: '', rest: '' } }
  return {
    eyebrow: content.subtitle ?? '',
    headline: [{ text: `${first.highlight}${first.rest} ${last.highlight}${last.rest}`.trim(), accent: 'main' }],
    sub: (content.tagline ?? []).map((run) => run.text).join(' ').replace(/ ([.,;:!?])/g, '$1'),
    primaryLabel: '',
    primaryHref: '',
    secondaryLabel: '',
    secondaryHref: '',
    availability: '',
  }
}

/** A route stays in the app; anything else is an ordinary link. */
function Action({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith('/') ? (
    <Link to={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

/**
 * The first screen, and the LCP element, so nothing in it moves or waits.
 *
 * A screener should get who, at what level, what proof and how to reach me
 * without scrolling: the name and role, the thesis as the one H1, a line of
 * proof with its sources, two ways forward, and whether I'm available.
 */
export function HeroSection() {
  const hero = useBlock<HeroContent & PreviousHero, HeroSettings>('hero')
  if (!hero) return null
  const content = current(hero.content)

  return (
    <section className="relative px-gutter-x pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="w-full max-w-content mx-auto">
        <p className="text-body-regular text-tertiary-ink/70 max-w-3xl">{content.eyebrow}</p>

        <h1 className="font-display text-heading-display font-black text-tertiary-ink mt-6 max-w-[16ch] text-balance leading-[0.98] tracking-[-0.02em]">
          {content.headline.map((run, index) =>
            toneOf(run.accent) === 'highlight' ? (
              // Set apart on its own line, in the quieter tone, rather than in
              // the accent: the thesis is one sentence, and the colour is spent
              // on the button below.
              <Fragment key={index}>
                {/* The space keeps the words apart for a screen reader; the line break is visual. */}
                {index > 0 ? ' ' : ''}
                <span className="block text-tertiary-ink/55">{run.text}</span>
              </Fragment>
            ) : (
              <Fragment key={index}>
                {index > 0 && needsLeadingSpace(run.text) ? ' ' : ''}
                {run.text}
              </Fragment>
            ),
          )}
        </h1>

        {content.sub && (
          <p className="mt-8 text-body-large text-tertiary-ink/70 max-w-[60ch] leading-relaxed">{content.sub}</p>
        )}

        {(content.primaryLabel || content.secondaryLabel) && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {content.primaryLabel && (
              <Action
                href={content.primaryHref}
                className="press inline-flex items-center rounded-full bg-primary-500 px-6 py-3 text-body-small font-semibold text-primary-fg transition-colors duration-150 hover:bg-primary-600"
              >
                {content.primaryLabel}
              </Action>
            )}
            {content.secondaryLabel && content.secondaryHref && (
              <Action
                href={content.secondaryHref}
                className="press inline-flex items-center rounded-full border border-tertiary-ink/20 px-6 py-3 text-body-small font-semibold text-tertiary-ink transition-colors duration-150 hover:border-tertiary-ink/50"
              >
                {content.secondaryLabel}
              </Action>
            )}
          </div>
        )}

        {content.availability && (
          <p className="mt-8 flex items-start gap-2.5 text-body-small text-tertiary-ink/70">
            <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-status-success" />
            {content.availability}
          </p>
        )}
      </div>
    </section>
  )
}
