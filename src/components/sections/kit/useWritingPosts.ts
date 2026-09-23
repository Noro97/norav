import type { KitWritingContent } from '@norav/content-schema'
import { useContent } from '@/content/ContentProvider'
import { hrefFor } from '@/content/routing'
import { postDate, postsOf, WRITING_SLUG } from '@/content/posts'

/** How many posts the Writing section shows. */
const SHOWN = 3

/**
 * The Writing section's cards, from real posts once there are any.
 *
 * The section was built with three hand-written cards, which 0020 seeded as
 * placeholders. Once a post is published those give way to the newest ones,
 * each linking to its page; until then the section shows what the block says,
 * so the page can still be laid out and previewed.
 */
export function useWritingPosts(content: KitWritingContent): KitWritingContent {
  const { snapshot, locale } = useContent()
  const posts = postsOf(snapshot)
  if (!content || posts.length === 0) return content

  return {
    ...content,
    posts: posts.slice(0, SHOWN).map((post) => ({
      date: postDate(post.publishedAt, locale, 'short'),
      reads: locale === 'ru' ? `${post.readingMinutes} мин` : `${post.readingMinutes} min`,
      title: post.title,
      excerpt: post.excerpt,
      href: hrefFor(`${WRITING_SLUG}/${post.slug}`, locale),
    })),
  }
}
