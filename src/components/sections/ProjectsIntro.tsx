import { Fragment } from 'react'
import { ContainerScroll } from '@warmbros/warmbros-components'
import { useBlock } from '@/content/ContentProvider'
import type { ProjectsIntroContent, ProjectsIntroSettings } from '@norav/content-schema'

const ACCENT_CLASS: Record<string, string> = {
  none: '',
  crimson: 'italic text-crimson-500',
  bright: 'text-white',
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
            <p className="label-editorial tracking-[0.3em] text-xs mb-4">{content.label}</p>
            <h2
              className="font-display font-semibold text-white tracking-[-0.02em] leading-[1.05]"
              style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', margin: 0 }}
            >
              {content.heading.map((segment, index) => (
                <Fragment key={index}>
                  {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
                  <span className={ACCENT_CLASS[segment.accent] ?? ''}>{segment.text}</span>
                  {segment.lineBreakAfter && <br />}
                </Fragment>
              ))}
            </h2>
            <p className="mt-6 text-[#DAD4D4]/70 text-base max-w-xl mx-auto leading-relaxed">
              {content.body}
            </p>
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
