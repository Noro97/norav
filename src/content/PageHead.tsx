import { useEffect } from 'react'
import type { Locale, SnapshotPage } from '@norav/content-schema'
import { useContent } from './ContentProvider'
import { DEFAULT_LOCALE, hrefFor, otherLocale } from './routing'

const SITE = 'https://norav.dev'

/** The card a page falls back to when it carries no image of its own. */
const DEFAULT_OG_IMAGE = `${SITE}/assets/img/logo-new.svg`

interface Seo {
  title?: string
  description?: string
  ogImage?: string
}

export interface ResolvedSeo {
  title?: string
  description?: string
  /** Always absolute: a crawler has no document to resolve a path against. */
  image: string
}

/**
 * What a page says about itself, in one language.
 *
 * Unlike block content, a page's seo is not resolved per locale by the publish
 * step — it arrives as { en: {...}, ru: {...} } in both snapshots. English is
 * the fallback rather than an empty head.
 *
 * A page whose seo has not been filled in falls back to what its first block
 * already says. A case study's title and description are written once, as its
 * own copy; copying them into the page's seo would be a second place to keep
 * them right, and a page with no title at all is the one outcome worth
 * avoiding on pages that exist to be found.
 */
export function resolveSeo(page: SnapshotPage | undefined, locale: Locale): ResolvedSeo {
  const byLocale = (page?.seo ?? {}) as Record<string, Seo | undefined>
  const written = byLocale[locale] ?? byLocale[DEFAULT_LOCALE] ?? {}
  const first = page?.blocks[0]?.content as { title?: string; description?: string } | undefined
  const image = written.ogImage

  return {
    title: written.title ?? first?.title,
    description: written.description ?? first?.description,
    image: !image ? DEFAULT_OG_IMAGE : image.startsWith('http') ? image : `${SITE}${image}`,
  }
}

/**
 * The page's title and description, and the address of the same page in the
 * other language.
 *
 * React 19 hoists meta and link out of wherever they are rendered into the
 * head, so this needs no helmet library — the tags belong to the page component
 * that knows which page it is.
 *
 * hreflang is the whole reason the language sits in the path: without separate
 * addresses there is nothing to point at, and half the content stays invisible
 * to a search engine.
 */
export function PageHead({ slug }: { slug: string }) {
  const { snapshot, locale } = useContent()
  const page = snapshot.pages.find((candidate) => candidate.slug === slug)
  const seo = resolveSeo(page, locale)

  // Not hoistable: <html lang> is an attribute on an element React does not
  // render. A screen reader picks its voice from it, so leaving it at "en" on a
  // Russian page is the one head detail a reader actually hears.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Nor is <title>, for a different reason: index.html already carries one, as
  // the fallback a reader sees before React runs. Hoisting appends a second
  // rather than replacing the first, and a browser — like a crawler — reads the
  // first one it finds. Rendering <title> here therefore wrote a tag nothing
  // read, and every page in the site answered to the home page's title. So the
  // existing tag is rewritten instead of a new one being added beside it.
  useEffect(() => {
    if (seo.title) document.title = seo.title
  }, [seo.title])

  const other = otherLocale(locale)
  const here = `${SITE}${hrefFor(slug, locale)}`
  const there = `${SITE}${hrefFor(slug, other)}`
  // What a search engine offers a reader whose language is neither. English is
  // the default the site answers on without a prefix, so it is the fallback.
  const fallback = `${SITE}${hrefFor(slug, DEFAULT_LOCALE)}`

  return (
    <>
      {seo.description && <meta name="description" content={seo.description} />}
      <link rel="canonical" href={here} />
      <link rel="alternate" hrefLang={locale} href={here} />
      <link rel="alternate" hrefLang={other} href={there} />
      <link rel="alternate" hrefLang="x-default" href={fallback} />
      <meta property="og:url" content={here} />
      <meta property="og:site_name" content="Norayr Avetisyan" />
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      <meta property="og:image" content={seo.image} />
      {/* The card's shape is in index.html; what it says belongs to the page. */}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && <meta name="twitter:description" content={seo.description} />}
      <meta name="twitter:image" content={seo.image} />
    </>
  )
}
