import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useCollection, useContent } from '@/content/ContentProvider'
import { useAppStore } from '@/store/useAppStore'
import { PageHead, SITE } from '@/content/PageHead'
import { hrefFor } from '@/content/routing'
import { postDate, WRITING_SLUG, type Post } from '@/content/posts'

/**
 * One post, at /writing/<slug>.
 *
 * Deliberately plain: the site's content column and type, and nothing
 * moving. The body is HTML the CMS sanitized on save to what
 * its editor can make — headings, emphasis, lists, quotes, links, code and
 * images — so it is rendered as it arrives rather than parsed again here.
 */
export function PostPage({ post }: { post: Post }) {
  const { t } = useTranslation('common')
  const { locale } = useContent()
  const slug = `${WRITING_SLUG}/${post.slug}`
  // A post has no sections for the menu to follow as it scrolls, so it says
  // where it belongs: under whichever menu item leads to the Writing page.
  const menu = useCollection<{ page: string; anchor: string }>('navigation')
  const writingAnchor = menu.find((row) => row.data.page === WRITING_SLUG)?.data.anchor
  useEffect(() => {
    if (writingAnchor) useAppStore.getState().setActiveSection(writingAnchor)
  }, [writingAnchor])

  const image = post.cover ? (/^https?:\/\//.test(post.cover) ? post.cover : `${SITE}${post.cover}`) : undefined

  return (
    // The same column as every section: the gutter outside, the content width
    // inside — so a post starts at the same left edge as the rest of the site.
    <article className="post-page px-gutter-x pt-32 pb-24" lang={post.lang}>
      <div className="mx-auto w-full max-w-content">
        <PageHead
          slug={slug}
          seo={{
            title: post.seo.title || `${post.title} — Norayr Avetisyan`,
            description: post.seo.description || post.excerpt,
            image,
          }}
        />

        <Link to={hrefFor(WRITING_SLUG, locale)} className="label-mono text-tertiary-ink/60 hover:text-primary-500">
          ← {t('writing.back')}
        </Link>

        <header className="mt-8 mb-10">
          <p className="label-mono text-tertiary-ink/50">
            <time dateTime={post.publishedAt}>{postDate(post.publishedAt, locale)}</time>
            <span aria-hidden="true"> · </span>
            {t('writing.minutes', { count: post.readingMinutes })}
          </p>
          <h1 className="mt-4 font-display text-heading-large font-black text-tertiary-ink">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-body-large text-tertiary-ink/70">{post.excerpt}</p>}
          {post.lang !== locale && (
            <p className="mt-4 text-caption text-tertiary-ink/50" lang={locale}>
              {t('writing.englishOnly')}
            </p>
          )}
        </header>

        {post.cover && <img className="post-cover" src={post.cover} alt="" />}

        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

        {post.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
            {post.tags.map((tag) => (
              <li key={tag} className="label-mono rounded border border-tertiary-line px-2 py-1 text-tertiary-ink/60">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
