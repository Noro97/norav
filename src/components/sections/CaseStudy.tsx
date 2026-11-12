import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import type { BlockComponentProps } from '@/content/blocks'
import type { CaseStudyStoryContent } from '@norav/content-schema'

/** A labelled part of the story. No text is no label either. */
function Part({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <section className="story-part">
      <h2 className="label-mono">{label}</h2>
      <p className="mt-3 max-w-2xl whitespace-pre-line text-body-regular leading-relaxed text-tertiary-ink/70">{text}</p>
    </section>
  )
}

type Figure = CaseStudyStoryContent['figures'][number]

// Phone footage sits three to a row from md up; a landscape capture takes the row.
function CaseStudyFigure({ figure }: { figure: Figure }) {
  return (
    <figure className={`story-part ${figure.portrait ? '' : 'md:col-span-3'}`}>
      {figure.video ? (
        <VideoPlayer
          src={figure.video}
          poster={figure.image}
          alt={figure.alt}
          portrait={figure.portrait}
          autoplay={figure.autoplay}
        />
      ) : (
        <img
          src={figure.image}
          alt={figure.alt}
          loading="lazy"
          decoding="async"
          className={`w-full rounded-2xl border border-tertiary-ink/[0.08] ${
            figure.portrait ? 'mx-auto max-h-[80vh] object-contain' : ''
          }`}
        />
      )}
      {figure.caption && <figcaption className="mt-3 text-caption text-tertiary-ink/60">{figure.caption}</figcaption>}
    </figure>
  )
}

/**
 * One case study, top to bottom: context, the problem, the footage, the decisions,
 * what came of it, and what you'd do differently.
 *
 * Every part hides when it has nothing in it, and a study with nothing written
 * renders nothing at all. Repeatable, so it reads its own row by id.
 */
export function CaseStudy({ blockId, first }: BlockComponentProps) {
  const block = useBlock<CaseStudyStoryContent>('case_study', blockId)
  const { t } = useTranslation('projects')
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef, '.story-part')

  if (!block) return null
  const { sectionLabel, title, description, techStack, context, problem, figures, decisions, outcome, metrics, retro, links } =
    block.content

  const written = [title, description, context, problem, outcome, retro].some(Boolean)
  const listed = [techStack, figures, decisions, metrics, links].some((rows) => rows.length > 0)
  if (!written && !listed) return null

  const hasHeader = sectionLabel || title || description || techStack.length > 0
  // The page's H1 when the study opens the page; under a demo, the demo holds it.
  const Heading = first ? 'h1' : 'h2'

  return (
    // Opening the page, it clears the fixed menu as the other first sections do.
    // Under a demo, the demo's own padding is the gap.
    <article ref={sectionRef} className={`relative px-gutter-x pb-24 ${first ? 'pt-36 md:pt-44' : ''}`}>
      <div className="relative z-10 mx-auto w-full max-w-content space-y-14">
        {hasHeader && (
          <header>
            {sectionLabel && <span className="label-mono">{sectionLabel}</span>}
            {title && (
              <Heading className="mt-3 break-words font-display text-heading-large font-black text-tertiary-ink">{title}</Heading>
            )}
            {description && (
              <p className="mt-4 max-w-2xl text-body-large leading-relaxed text-tertiary-ink/70">{description}</p>
            )}
            {techStack.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <li
                    key={index}
                    className="max-w-full break-words rounded-full border border-tertiary-ink/[0.1] px-3 py-1 font-mono text-caption text-tertiary-ink/70"
                  >
                    {tech.name}
                  </li>
                ))}
              </ul>
            )}
          </header>
        )}

        <Part label={t('caseStudy.context')} text={context} />
        <Part label={t('caseStudy.problem')} text={problem} />

        {figures.length > 0 && (
          <div className="grid gap-10 md:grid-cols-3">
            {figures.map((figure, index) => (
              <CaseStudyFigure key={index} figure={figure} />
            ))}
          </div>
        )}

        {decisions.length > 0 && (
          <section className="story-part">
            <h2 className="label-mono">{t('caseStudy.decisions')}</h2>
            <ol className="mt-3">
              {decisions.map((decision, index) => (
                <li key={index} className="flex gap-5 border-t border-tertiary-ink/[0.08] py-7 last:border-b md:gap-8">
                  <span className="label-mono shrink-0 pt-1 tabular-nums text-primary-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-words text-body-regular font-semibold text-tertiary-ink md:text-body-large">
                      {decision.title}
                    </h3>
                    <p className="mt-2 max-w-[68ch] whitespace-pre-line text-body-small leading-relaxed text-tertiary-ink/70 md:text-body-regular">
                      {decision.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <Part label={t('caseStudy.outcome')} text={outcome} />

        {metrics.length > 0 && (
          <dl className="story-part grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((metric, index) => (
              // The term comes first, as a description list needs; the value shows first.
              <div key={index} className="flex min-w-0 flex-col-reverse justify-end rounded-2xl border border-tertiary-ink/[0.08] px-5 py-6">
                <dt className="mt-2 text-caption leading-snug text-tertiary-ink/70">{metric.label}</dt>
                <dd className="break-words font-mono text-heading-medium tabular-nums text-primary-400">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Part label={t('caseStudy.retro')} text={retro} />

        {links.length > 0 && (
          <ul className="story-part flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-body-regular text-primary-400 underline underline-offset-4 hover:text-primary-300"
                  {...(/^https?:\/\//.test(link.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
