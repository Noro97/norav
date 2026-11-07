import type { Locale, Snapshot } from '@norav/content-schema'

/**
 * Posts, as the publish step writes them: the `posts` collection, newest first.
 *
 * A post is copy the CMS has already resolved — images are URLs, the body is
 * HTML sanitized on save to what the editor's toolbar can make — so the site
 * reads it and renders it, with nothing to look up.
 */
export interface Post {
  slug: string
  title: string
  excerpt: string
  bodyHtml: string
  cover: string
  tags: string[]
  publishedAt: string
  readingMinutes: number
  seo: { title?: string; description?: string }
  /** The language the copy is in — English under /ru until one is written. */
  lang: Locale
}

/** Where posts live: /writing/<slug>, under the Writing page. */
export const WRITING_SLUG = 'writing'

/** What a post says about itself in the head, with the site's name when it says nothing. */
export function postSeo(post: Post, siteName: string, site: string) {
  const image = post.cover ? (/^https?:\/\//.test(post.cover) ? post.cover : `${site}${post.cover}`) : undefined
  return {
    title: post.seo.title || `${post.title} — ${siteName}`,
    description: post.seo.description || post.excerpt,
    image,
  }
}

export function postsOf(snapshot: Snapshot): Post[] {
  return (snapshot.collections.posts ?? []).map((entry) => ({
    ...(entry.data as Omit<Post, 'slug'>),
    slug: entry.slug,
  }))
}

/** The post an address names, if `slug` is `writing/<post>`. */
export function postAt(snapshot: Snapshot, slug: string): Post | undefined {
  const [section, name, ...rest] = slug.split('/')
  if (section !== WRITING_SLUG || !name || rest.length > 0) return undefined
  return postsOf(snapshot).find((post) => post.slug === name)
}

export function postDate(iso: string, locale: Locale, style: 'short' | 'long' = 'long'): string {
  return new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: style === 'long' ? 'numeric' : undefined,
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}
