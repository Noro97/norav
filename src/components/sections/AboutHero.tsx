import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlock } from '@/content/ContentProvider'
import { useProfile } from '@/content/useProfile'
import { toneOf } from '@/content/accent'
import type { BlockComponentProps } from '@/content/blocks'
import type { AboutContent, AboutSettings } from '@norav/content-schema'

function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/**
 * Copies the address, as an extra beside the link that sends to it. Says so when
 * it worked, and says nothing when the browser refuses: the address is on the
 * screen either way.
 */
function CopyAddress({ address }: { address: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(address)
          .then(() => setCopied(true))
          .catch(() => {})
      }}
      className="text-body-small text-tertiary-ink/70 underline decoration-tertiary-ink/30 underline-offset-4 hover:text-tertiary-ink hover:decoration-tertiary-ink"
    >
      <span aria-live="polite">{copied ? t('contact.copied') : t('contact.copy')}</span>
    </button>
  )
}

/**
 * Who I am, with the photo beside it. The name is the page's H1, and the photo
 * is what LCP waits for on a phone, so it is sized for its box and asked for at
 * once rather than lazily.
 */
export function AboutHero({ blockId }: BlockComponentProps) {
  const block = useBlock<AboutContent, AboutSettings>('about', blockId)
  const profile = useProfile()
  if (!block) return null
  const { content, settings } = block
  const email = content.socials.find((link) => link.href.startsWith('mailto:'))
  const elsewhere = content.socials.filter((link) => link !== email)
  const address = email?.href.replace(/^mailto:/, '') ?? ''

  return (
    <section className="relative px-gutter-x pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="w-full max-w-content mx-auto grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="relative overflow-hidden rounded-2xl border border-tertiary-ink/10 aspect-[3/4] max-w-[340px]">
            <img
              src={settings.photo}
              alt={profile.name}
              width={680}
              height={902}
              decoding="async"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {settings.showStatusBadge && content.statusLabel && (
              <p className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-tertiary-bg/85 px-3 py-1.5 text-caption text-tertiary-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-status-success" />
                {content.statusLabel}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 max-w-3xl">
          {content.sectionLabel && <p className="label-mono">{content.sectionLabel}</p>}
          <h1 className="font-display text-heading-xlarge font-black text-tertiary-ink mt-3">{content.name}</h1>
          <p className="mt-3 text-body-large text-tertiary-ink/70">{content.role}</p>

          <div className="mt-8 space-y-5 text-body-large text-tertiary-ink/80 leading-relaxed max-w-[62ch]">
            <p className="text-tertiary-ink">
              {content.bio.lead.map((run, index) => (
                <Fragment key={index}>
                  {index > 0 && needsLeadingSpace(run.text) ? ' ' : ''}
                  <span className={toneOf(run.accent) === 'highlight' ? 'text-primary-400' : undefined}>{run.text}</span>
                </Fragment>
              ))}
            </p>
            {content.bio.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-body-regular text-tertiary-ink/70">
                {paragraph.text}
              </p>
            ))}
          </div>

          {content.facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-1 gap-x-8 border-t border-tertiary-ink/15 sm:grid-cols-2">
              {content.facts.map((fact) => (
                <div key={fact.label} className="border-b border-tertiary-ink/15 py-4">
                  <dt className="text-caption text-tertiary-ink/55">{fact.label}</dt>
                  <dd className="mt-1 text-body-regular text-tertiary-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            {content.cvLabel && (
              <a
                href={settings.cvHref}
                className="press inline-flex items-center rounded-full bg-primary-500 px-6 py-3 text-body-small font-semibold text-primary-fg transition-colors duration-150 hover:bg-primary-600"
              >
                {content.cvLabel}
              </a>
            )}
            {email && (
              <a
                href={email.href}
                className="break-all text-body-small font-semibold text-tertiary-ink underline decoration-tertiary-ink/30 underline-offset-4 hover:decoration-tertiary-ink"
              >
                {address}
              </a>
            )}
            {email && <CopyAddress address={address} />}
          </div>

          {elsewhere.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {elsewhere.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-small text-tertiary-ink/70 underline decoration-tertiary-ink/30 underline-offset-4 hover:text-tertiary-ink hover:decoration-tertiary-ink"
                  >
                    {link.label}
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
