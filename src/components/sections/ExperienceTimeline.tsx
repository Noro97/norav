import { Link } from 'react-router'
import { useBlock, useCollection } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { ExperienceBlockContent, ExperienceContent, ExperienceData, ExperienceSettings } from '@norav/content-schema'

/** A published row: the non-localized columns composed with the translated ones. */
type ExperienceRow = ExperienceData & ExperienceContent

/** A route stays in the app; anything else is an ordinary link. */
function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    'inline-block mt-8 text-body-small font-semibold text-primary-400 underline-offset-4 hover:underline'
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
 * The roles, newest first, as a ruled list: the dates in their own column so
 * the eye can run down them, and the work beside them.
 *
 * Compact is the home page's version: one line per role and a link to the
 * rest. The full one, on About, adds every approved number and the stack.
 */
export function ExperienceTimeline({ blockId }: BlockComponentProps) {
  const block = useBlock<ExperienceBlockContent, ExperienceSettings>('experience', blockId)
  const roles = useCollection<ExperienceRow>('experience')
  if (!block || roles.length === 0) return null
  const { content, settings } = block
  const compact = settings.compact === true

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

        <ol className="mt-10 border-t border-tertiary-ink/15">
          {roles.map(({ id, data: role }) => (
            <li key={id} className="grid gap-2 border-b border-tertiary-ink/15 py-6 md:grid-cols-12 md:gap-8 md:py-7">
              <div className="md:col-span-3">
                <p className="font-mono text-body-small text-tertiary-ink/70 tabular-nums">{role.period}</p>
                {!compact && role.type && <p className="mt-1 text-caption text-tertiary-ink/55">{role.type}</p>}
              </div>
              <div className="md:col-span-9">
                <h3 className="text-body-large font-semibold text-tertiary-ink">
                  {role.company}
                  <span className="font-normal text-tertiary-ink/70"> · {role.role}</span>
                </h3>
                {role.description && (
                  <p className="mt-2 text-body-regular text-tertiary-ink/70 max-w-[62ch] leading-relaxed">
                    {role.description}
                  </p>
                )}
                {!compact && role.achievements.length > 0 && (
                  <ul className="mt-4 space-y-2 max-w-[62ch]">
                    {role.achievements.map((achievement, index) => (
                      <li key={index} className="flex gap-3 text-body-small text-tertiary-ink/80 leading-relaxed">
                        <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-tertiary-ink/40" />
                        {achievement.text}
                      </li>
                    ))}
                  </ul>
                )}
                {!compact && role.stack.length > 0 && (
                  <p className="mt-4 text-caption text-tertiary-ink/55">{role.stack.map((tech) => tech.name).join(' · ')}</p>
                )}
              </div>
            </li>
          ))}
        </ol>

        {compact && content.linkLabel && settings.linkHref && (
          <MoreLink href={settings.linkHref}>{content.linkLabel}</MoreLink>
        )}
      </div>
    </section>
  )
}
