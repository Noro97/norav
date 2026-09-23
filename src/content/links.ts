import type { Locale } from '@norav/content-schema'
import { hrefFor } from './routing'

/** A field that holds a link: `href`, `ctaHref`, `primaryHref`… */
const LINK_FIELD = /href$/i

/**
 * Turns the links in a block's content into routes.
 *
 * Content written while the site was one long page links to sections by hash —
 * a "Get in touch" button with `#contact`. Those sections are pages now, and
 * nothing on the site answers to a hash any more, so `#contact` becomes the
 * route of the page holding the `contact` section. A path to a published page
 * gains the language prefix, so `/contact` on the Russian site is `/ru/contact`.
 * Everything else — a full URL, a file, mail — is left exactly as written.
 */
export function resolveContentLinks<T>(
  content: T,
  anchorPages: ReadonlyMap<string, string>,
  pageSlugs: ReadonlySet<string>,
  locale: Locale,
): T {
  const link = (value: string): string => {
    if (value.startsWith('#') && value.length > 1) {
      const page = anchorPages.get(value.slice(1))
      return page ? hrefFor(page, locale) : value
    }
    if (value.startsWith('/') && !value.startsWith('//')) {
      const slug = value.slice(1).replace(/\/$/, '')
      if (pageSlugs.has(slug)) return hrefFor(slug, locale)
    }
    return value
  }

  const walk = (node: unknown, key?: string): unknown => {
    if (typeof node === 'string') return key && LINK_FIELD.test(key) ? link(node) : node
    if (Array.isArray(node)) return node.map((item) => walk(item))
    if (node && typeof node === 'object') {
      return Object.fromEntries(
        Object.entries(node as Record<string, unknown>).map(([k, v]) => [k, walk(v, k)]),
      )
    }
    return node
  }

  return walk(content) as T
}
