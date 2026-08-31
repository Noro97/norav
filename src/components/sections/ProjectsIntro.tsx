import { Fragment } from 'react'
import { ContainerScroll } from '@warmbros/warmbros-components'
import { useBlock } from '@/content/ContentProvider'
import { toneOf, type Tone } from '@/content/accent'
import type { ProjectsIntroContent, ProjectsIntroSettings } from '@norav/content-schema'

const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'italic text-crimson-500',
}

function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/**
 * Scroll-reveal band that opens the case studies. The copy used to be inline in
 * App.tsx — English only, invisible to i18n — and now comes from the CMS.
 */
export function ProjectsIntro({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<ProjectsIntroContent, ProjectsIntroSettings>('projects_intro')
  if (!block) return null

  const { content, settings } = block

  return (
    <section id={anchorId ?? 'projects-intro'} className="relative">
      <ContainerScroll
        titleComponent={
          <>
            <p className="label-mono">{content.label}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
              {content.heading.map((segment, index) => (
                <Fragment key={index}>
                  {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
                  <span className={TONE_CLASS[toneOf(segment.accent)]}>{segment.text}</span>
                  {segment.lineBreakAfter && <br />}
                </Fragment>
              ))}
            </h2>
            <p className="text-white/40 text-base max-w-xl mx-auto">{content.body}</p>
          </>
        }
      >
        <img
          src={settings.image}
          alt={content.imageAlt}
          width={1800}
          height={1029}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </ContainerScroll>
    </section>
  )
}
