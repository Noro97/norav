import { useEffect } from 'react'
import { useContent } from './ContentProvider'
import { hrefFor, otherLocale } from './routing'

const SITE = 'https://norav.dev'

interface Seo {
  title?: string
  description?: string
  ogImage?: string
}

/**
 * The page's title and description, and the address of the same page in the
 * other language.
 *
 * React 19 hoists title, meta and link out of wherever they are rendered into
 * the head, so this needs no helmet library and no effect — the tags belong to
 * the page component that knows which page it is.
 *
 * hreflang is the whole reason the language sits in the path: without separate
 * addresses there is nothing to point at, and half the content stays invisible
 * to a search engine.
 */
export function PageHead({ slug }: { slug: string }) {
  const { snapshot, locale } = useContent()

  // Not hoistable: <html lang> is an attribute on an element React does not
  // render. A screen reader picks its voice from it, so leaving it at "en" on a
  // Russian page is the one head detail a reader actually hears.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  const page = snapshot.pages.find((candidate) => candidate.slug === slug)
  // Unlike block content, a page's seo is not resolved per locale by the publish
  // step — it arrives as { en: {...}, ru: {...} } in both snapshots. English is
  // the fallback rather than an empty head.
  const byLocale = (page?.seo ?? {}) as Record<string, Seo | undefined>
  const written = byLocale[locale] ?? byLocale.en ?? {}

  // A page whose seo has not been filled in falls back to what its first block
  // already says. A case study's title and description are written once, as its
  // own copy; copying them into the page's seo would be a second place to keep
  // them right, and a page with no title at all is the one outcome worth
  // avoiding on pages that exist to be found.
  const first = page?.blocks[0]?.content as { title?: string; description?: string } | undefined
  const seo: Seo = {
    title: written.title ?? first?.title,
    description: written.description ?? first?.description,
    ogImage: written.ogImage,
  }

  const other = otherLocale(locale)
  const here = `${SITE}${hrefFor(slug, locale)}`
  const there = `${SITE}${hrefFor(slug, other)}`

  return (
    <>
      {seo.title && <title>{seo.title}</title>}
      {seo.description && <meta name="description" content={seo.description} />}
      <link rel="canonical" href={here} />
      <link rel="alternate" hrefLang={locale} href={here} />
      <link rel="alternate" hrefLang={other} href={there} />
      <meta property="og:url" content={here} />
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}
    </>
  )
}
