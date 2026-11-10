import { useBlock } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { ContactCtaContent, ContactCtaSettings } from '@norav/content-schema'

/**
 * The ask. It closes the home page and is the whole of /contact, where its
 * title is the page's H1. Every way to reach me is a real link a keyboard can
 * reach: the address itself, not a button that copies it.
 */
export function ContactCTA({ blockId, first }: BlockComponentProps) {
  const block = useBlock<ContactCtaContent, ContactCtaSettings>('contact_cta', blockId)
  if (!block) return null
  const { content, settings } = block
  const Heading = first ? 'h1' : 'h2'

  return (
    <section className={`relative px-gutter-x ${first ? 'pt-36 md:pt-44 pb-24' : 'py-24 md:py-32'}`}>
      <div className={`w-full max-w-content mx-auto ${first ? '' : 'border-t border-tertiary-ink/15 pt-12 md:pt-16'}`}>
        <div className="max-w-3xl">
          {settings.showAvailability && content.availability && (
            <p className="flex items-center gap-2.5 text-body-small text-tertiary-ink/70">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-status-success" />
              {content.availability}
            </p>
          )}
          {content.label && <p className="label-mono mt-6">{content.label}</p>}
          <Heading
            className={`font-display font-black text-tertiary-ink mt-3 text-balance ${first ? 'text-heading-xlarge' : 'text-heading-large'}`}
          >
            {content.title}
          </Heading>
          {content.body && (
            <p className="mt-5 text-body-large text-tertiary-ink/70 max-w-[58ch] leading-relaxed">{content.body}</p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={`mailto:${settings.email}`}
              className="press inline-flex items-center rounded-full bg-primary-500 px-6 py-3 text-body-small font-semibold text-primary-fg transition-colors duration-150 hover:bg-primary-600"
            >
              {content.emailLabel}
            </a>
            {content.cvLabel && settings.cvHref && (
              <a
                href={settings.cvHref}
                className="text-body-small font-semibold text-tertiary-ink underline decoration-tertiary-ink/30 underline-offset-4 hover:decoration-tertiary-ink"
              >
                {content.cvLabel}
              </a>
            )}
          </div>
          <p className="mt-4 font-mono text-body-small text-tertiary-ink/70 break-all">
            <a href={`mailto:${settings.email}`} className="hover:text-tertiary-ink">
              {settings.email}
            </a>
          </p>

          {content.socials.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {content.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-small text-tertiary-ink/70 underline decoration-tertiary-ink/30 underline-offset-4 hover:text-tertiary-ink hover:decoration-tertiary-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
