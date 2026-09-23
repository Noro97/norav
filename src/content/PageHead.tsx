import { useEffect } from 'react'
import type { Locale, SnapshotPage } from '@norav/content-schema'
import { useContent } from './ContentProvider'
import { DEFAULT_LOCALE, hrefFor, otherLocale } from './routing'

/** Guarded against the sitemap generator's copy by a test. */
export const SITE = 'https://norav.dev'

interface Seo {
  title?: string
  description?: string
  ogImage?: string
}

export interface ResolvedSeo {
  title?: string
  description?: string
  /** Absolute when present: a crawler has no document to resolve a path against. */
  image?: string
}

const ABSOLUTE = /^https?:\/\//

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
 *
 * Anything still missing is left undefined here. What fills it is the shell's
 * own copy, which applySeo reads — index.html stays the only place the site's
 * default title and card are written down.
 */
export function resolveSeo(page: SnapshotPage | undefined, locale: Locale): ResolvedSeo {
 const byLocale = (page?.seo ?? {}) as Record<string, Seo | undefined>
 const written = byLocale[locale] ?? byLocale[DEFAULT_LOCALE] ?? {}
 const first = page?.blocks[0]?.content as { title?: string; description?: string } | undefined
 const image = written.ogImage

 return {
 title: written.title ?? first?.title,
 description: written.description ?? first?.description,
 image: !image ? undefined : ABSOLUTE.test(image) ? image : `${SITE}${image}`,
  }
}

const metaOf = (kind: 'name' | 'property', key: string) =>
  document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${key}"]`)

/**
 * What index.html says, read once before anything overwrites it.
 *
 * These are the site's defaults and the shell is their only source, so a page
 * that says nothing of its own falls back to them rather than to a constant
 * kept in step by hand.
 */
let shell: { title: string; description: string; image: string } | null = null

function shellDefaults() {
 shell ??= {
 title: document.title,
 description: metaOf('name', 'description')?.content ?? '',
 image: metaOf('property', 'og:image')?.content ?? '',
  }
 return shell
}

function write(kind: 'name' | 'property', key: string, value: string) {
 if (!value) return

 let tag = metaOf(kind, key)
 if (!tag) {
 tag = document.createElement('meta')
    tag.setAttribute(kind, key)
    document.head.appendChild(tag)
  }
  tag.content = value
}

/**
 * Writes the page's own copy over the tags index.html already carries.
 *
 * Rendering these as JSX appends rather than replaces — React 19 hoists a
 * second tag into the head, and a consumer that meets a duplicated tag reads
 * the first one it finds. That is how every address on the site came to answer
 * to the home page's title.
 *
 * The static tags stay for a second reason, which is why they are rewritten
 * rather than dropped: Telegram, Slack, LinkedIn, Facebook and X fetch the HTML
 * and never execute it. What index.html ships is the only card they will ever
 * see. This leaves them a floor and gives the crawlers that do run JavaScript
 * the page's own copy.
 */
export function applySeo(seo: ResolvedSeo) {
 const fallback = shellDefaults()
 const title = seo.title ?? fallback.title
 const description = seo.description ?? fallback.description
 const image = seo.image ?? fallback.image

 // A page that resolves no title of its own must land back on the site's,
 // never keep the title of the page the reader came from.
  document.title = title

  write('name', 'description', description)
  write('property', 'og:title', title)
  write('property', 'og:description', description)
  write('property', 'og:image', image)
  write('name', 'twitter:title', title)
  write('name', 'twitter:description', description)
  write('name', 'twitter:image', image)
}

/** Only for tests: forgets the shell copy read on the first write. */
export function forgetShellDefaults() {
 shell = null
}

/**
 * The page's address in both languages, and its own copy in the head.
 *
 * The tags that exist only per page — the canonical and the alternates — are
 * rendered, because React 19 hoists link and meta into the head and there is
 * nothing in the shell for them to collide with. The tags the shell already
 * carries are written instead of rendered; applySeo explains why.
 *
 * hreflang is the whole reason the language sits in the path: without separate
 * addresses there is nothing to point at, and half the content stays invisible
 * to a search engine.
 */
export function PageHead({ slug, seo }: { slug: string; seo?: ResolvedSeo }) {
 const { snapshot, locale } = useContent()
 const page = snapshot.pages.find((candidate) => candidate.slug === slug)
 // Destructured rather than kept as an object: resolveSeo builds a new one
 // every render, so the object is never a usable dependency and its three
 // values are what actually change. A post is not a page and brings its own.
 const { title, description, image } = seo ?? resolveSeo(page, locale)

 // Not hoistable: <html lang> is an attribute on an element React does not
 // render. A screen reader picks its voice from it, so leaving it at "en" on a
 // Russian page is the one head detail a reader actually hears.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    applySeo({ title, description, image })
  }, [title, description, image])

 const other = otherLocale(locale)
 const here = `${SITE}${hrefFor(slug, locale)}`
 const there = `${SITE}${hrefFor(slug, other)}`
 // What a search engine offers a reader whose language is neither. English is
 // the default the site answers on without a prefix, so it is the fallback.
 const fallback = `${SITE}${hrefFor(slug, DEFAULT_LOCALE)}`

 return (
    <>
      <link rel="canonical" href={here} />
      <link rel="alternate" hrefLang={locale} href={here} />
      <link rel="alternate" hrefLang={other} href={there} />
      <link rel="alternate" hrefLang="x-default" href={fallback} />
      <meta property="og:url" content={here} />
    </>
  )
}
