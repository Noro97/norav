import { Fragment } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useBlock, useContent } from '@/content/ContentProvider'
import { useCaseStudyLinks } from '@/content/case-studies'
import { hrefFor } from '@/content/routing'
import { toneOf, type Tone } from '@/content/accent'
import type { ProjectsIntroContent, ProjectsIntroSettings } from '@norav/content-schema'

const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'italic text-primary-400',
}

function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/**
 * The band that opens the case studies. The copy used to be inline in
 * App.tsx — English only, invisible to i18n — and now comes from the CMS.
 */
export function ProjectsIntro() {
  const block = useBlock<ProjectsIntroContent, ProjectsIntroSettings>('projects_intro')
  // Whatever case studies have a page of their own. Empty while they all still
  // sit below this band, which is exactly when a list of links would be wrong.
  const links = useCaseStudyLinks()
  const { locale } = useContent()
  if (!block) return null

  const { content, settings } = block

  return (
    <section className="relative">
      <div className="relative px-gutter-x pt-32 md:pt-40 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="label-mono">{content.label}</p>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-4">
            {content.heading.map((segment, index) => (
              <Fragment key={index}>
                {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
                <span className={TONE_CLASS[toneOf(segment.accent)]}>{segment.text}</span>
                {segment.lineBreakAfter && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="text-tertiary-ink/55 text-body-regular max-w-xl mx-auto">{content.body}</p>

          {content.viewAllLabel && (
            <div className="mt-6">
              <Link
                to={hrefFor('work', locale)}
                className="press type-label inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-tertiary-ink/[0.1] text-tertiary-ink/80 hover:text-tertiary-ink transition-colors duration-150"
              >
                {content.viewAllLabel}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto mt-10 md:mt-12 rounded-[30px] border-4 border-tertiary-ink/[0.2] bg-tertiary-ink/[0.04] p-2 md:p-6">
          <img
            src={settings.image}
            alt={content.imageAlt}
            width={1800}
            height={1029}
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="block w-full h-auto rounded-2xl"
          />
        </div>
      </div>

      {links.length > 0 && (
        <div className="relative px-gutter-x pb-24 -mt-8">
          <div className="w-full max-w-content mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((study) => (
              <Link
                key={study.slug}
                to={hrefFor(study.slug, locale)}
                className="group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-secondary-500/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="label-mono">{study.number}</span>
                  <ArrowUpRight
                    className="w-4 h-4 text-tertiary-ink/55 transition-colors group-hover:text-secondary-400"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="mt-3 font-display text-heading-small font-black text-tertiary-ink">{study.title}</h3>
                <p className="mt-2 text-tertiary-ink/55 text-body-small leading-relaxed line-clamp-3">
                  {study.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
