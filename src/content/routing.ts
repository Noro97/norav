import type { Locale } from '@norav/content-schema'

/**
 * The address bar is the source of truth for two things: which page, and which
 * language.
 *
 * `/work/merch` and `/ru/work/merch` are the same page in two languages. English
 * carries no prefix — it is the default, and a default that shows in every URL
 * is noise.
 *
 * Page slugs are matched against whatever the CMS published rather than a route
 * table kept in step with it: a page created in the admin is reachable the
 * moment it is published, and this file never has to hear about it.
 */
export const DEFAULT_LOCALE: Locale = 'en'
export const HOME_SLUG = 'home'

const PREFIXED: Locale[] = ['ru']

export interface Address {
  locale: Locale
  /** The page's slug, never empty — the site's root is the page called `home`. */
  slug: string
}

export function readPath(pathname: string): Address {
  const segments = pathname.split('/').filter(Boolean)
  const prefix = segments[0] as Locale | undefined
  const locale = prefix && PREFIXED.includes(prefix) ? prefix : DEFAULT_LOCALE
  const rest = locale === DEFAULT_LOCALE ? segments : segments.slice(1)

  return { locale, slug: rest.join('/') || HOME_SLUG }
}

/** The address of a page in a language. The inverse of readPath. */
export function hrefFor(slug: string, locale: Locale): string {
  const path = slug === HOME_SLUG ? '' : `/${slug}`
  return locale === DEFAULT_LOCALE ? path || '/' : `/${locale}${path}`
}

/** The same page in the other language, for the toggle and for hreflang. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'ru' : 'en'
}
