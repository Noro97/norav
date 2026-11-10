import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useContent } from '@/content/ContentProvider'
import { HOME_SLUG, hrefFor } from '@/content/routing'

/**
 * An address the CMS has not published.
 *
 * It sits inside the same shell as every page — the header — because the site
 * is still there; it is this one address that is not. A bare page would
 * read as something broken rather than as a wrong turn.
 */
export function NotFound() {
  const { t } = useTranslation('common')
  const { locale } = useContent()

  return (
    <section className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="label-mono">404</span>
      <h1 className="font-display text-heading-large font-black text-tertiary-ink">
        {t('notFound.title')}
      </h1>
      <p className="text-tertiary-ink/55 text-body-regular max-w-md">{t('notFound.body')}</p>
      <Link
        to={hrefFor(HOME_SLUG, locale)}
        className="mt-2 px-4 py-2 text-caption font-mono rounded border border-secondary-500 bg-secondary-500/10 text-secondary-400 transition-colors hover:bg-secondary-500/20"
      >
        {t('notFound.home')}
      </Link>
    </section>
  )
}
