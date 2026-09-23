import type { KitWritingContent } from '@norav/content-schema'
import { useContent } from '@/content/ContentProvider'
import { hrefFor } from '@/content/routing'
import { postDate, postsOf, WRITING_SLUG } from '@/content/posts'

/** How many posts the Writing section shows. */
const SHOWN = 3

/** Said where the cards would be while nothing is published. */
const EMPTY = {
  en: 'Nothing published yet — the first notes are being written.',
  ru: 'Пока ничего не опубликовано — первые заметки уже пишутся.',
} as const

/**
 * The Writing section's cards: the newest published posts, each linking to
 * its page.
 *
 * Only real posts. The block still carries the three hand-written cards 0020
 * seeded to lay the page out, and showing those on the live site read as
 * articles that did not exist — so with no posts the section says so instead.
 */
export function useWritingPosts(
  content: KitWritingContent,
): KitWritingContent & { emptyText?: string } {
  const { snapshot, locale } = useContent()
  const posts = postsOf(snapshot)
  if (!content) return content

  return {
    ...content,
    emptyText: EMPTY[locale],
    posts: posts.slice(0, SHOWN).map((post) => ({
      date: postDate(post.publishedAt, locale, 'short'),
      reads: locale === 'ru' ? `${post.readingMinutes} мин` : `${post.readingMinutes} min`,
      title: post.title,
      excerpt: post.excerpt,
      href: hrefFor(`${WRITING_SLUG}/${post.slug}`, locale),
    })),
  }
}
