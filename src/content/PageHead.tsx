import { useEffect } from 'react'
import type { Locale, SnapshotPage } from '@norav/content-schema'
import { useContent } from './ContentProvider'
import { DEFAULT_LOCALE, hrefFor } from './routing'

/** Guarded against the sitemap generator's copy by a test. */
export const SITE = 'https://norav.dev'

interface Seo {
  title?: string
  description?: string
  ogImage?: string
  ogImageAlt?: string
}

export interface ResolvedSeo {
  title?: string
  description?: string
  /** Absolute when present: a crawler has no document to resolve a path against. */
  image?: string
  /** What the page's own image shows. Without one, the page's title says what the card is. */
  imageAlt?: string
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
 const title = written.title ?? first?.title

 return {
 title,
 description: written.description ?? first?.description,
 image: !image ? undefined : ABSOLUTE.test(image) ? image : `${SITE}${image}`,
 imageAlt: image ? written.ogImageAlt || title : undefined,
  }
}

const metaOf = (kind: 'name' | 'property', key: string) =>
  document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${key}"]`)

/**
 * What index.html says, read once before anything overwrites it.
 *
 * These are the site's defaults and the shell is their only source, so a page
 * that says nothing of its own falls back to them rather than to a constant
 * kept in step by hand. A prerendered page has its own values in those tags and
 * keeps the shell's in `data-shell`.
 */
let shell: { title: string; description: string; image: string; imageAlt: string } | null = null

function shellDefaults() {
 const defaultOf = (tag: HTMLElement | null, value: string) => tag?.dataset.shell ?? value
 const description = metaOf('name', 'description')
 const image = metaOf('property', 'og:image')
 const imageAlt = metaOf('property', 'og:image:alt')
 shell ??= {
 title: defaultOf(document.querySelector('title'), document.title),
 description: defaultOf(description, description?.content ?? ''),
 image: defaultOf(image, image?.content ?? ''),
 imageAlt: defaultOf(imageAlt, imageAlt?.content ?? ''),
  }
 return shell
}

/** The canonical address of a page. The prerender writes the same one into the HTML. */
function writeCanonical(href: string) {
 let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
 if (!tag) {
 tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }
  tag.href = href
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
 * Writes the page's own copy over the tags the document already carries.
 *
 * Rendering these as JSX appends rather than replaces — React 19 hoists a
 * second tag into the head, and a consumer that meets a duplicated tag reads
 * the first one it finds.
 *
 * A first load already has the right tags, from the prerender: Telegram, Slack,
 * LinkedIn, Facebook and X fetch the HTML and never execute it. This is what
 * keeps them right as the reader moves between pages.
 */
export function applySeo(seo: ResolvedSeo) {
 const fallback = shellDefaults()
 const title = seo.title ?? fallback.title
 const description = seo.description ?? fallback.description
 const image = seo.image ?? fallback.image
 // The shell's alt describes the shell's card, so a page with its own image never borrows it.
 const imageAlt = seo.image ? (seo.imageAlt ?? title) : fallback.imageAlt

 // A page that resolves no title of its own must land back on the site's,
 // never keep the title of the page the reader came from.
  document.title = title

  write('name', 'description', description)
  write('property', 'og:title', title)
  write('property', 'og:description', description)
  write('property', 'og:image', image)
  write('property', 'og:image:alt', imageAlt)
  write('name', 'twitter:title', title)
  write('name', 'twitter:description', description)
  write('name', 'twitter:image', image)
  write('name', 'twitter:image:alt', imageAlt)
}

/** Only for tests: forgets the shell copy read on the first write. */
export function forgetShellDefaults() {
 shell = null
}

/**
 * The page's address, and its own copy in the head.
 *
 * No hreflang while the site is English only: an alternate has to point at a
 * page that answers, and /ru redirects to English until it is retranslated.
 */
export function PageHead({ slug, seo }: { slug: string; seo?: ResolvedSeo }) {
 const { snapshot, locale } = useContent()
 const page = snapshot.pages.find((candidate) => candidate.slug === slug)
 // Destructured rather than kept as an object: resolveSeo builds a new one
 // every render, so the object is never a usable dependency and its three
 // values are what actually change. A post is not a page and brings its own.
 const { title, description, image, imageAlt } = seo ?? resolveSeo(page, locale)

 // Not hoistable: <html lang> is an attribute on an element React does not
 // render. A screen reader picks its voice from it, so leaving it at "en" on a
 // Russian page is the one head detail a reader actually hears.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    applySeo({ title, description, image, imageAlt })
  }, [title, description, image, imageAlt])

 const here = `${SITE}${hrefFor(slug, locale)}`

  useEffect(() => {
    writeCanonical(here)
    write('property', 'og:url', here)
  }, [here])

 return null
}
