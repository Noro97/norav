import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { useContent } from '@/content/ContentProvider'
import { PageHead, SITE } from '@/content/PageHead'
import { useProfile } from '@/content/useProfile'
import { hrefFor } from '@/content/routing'
import { postDate, postSeo, WRITING_SLUG, type Post } from '@/content/posts'

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
  const { name } = useProfile()
  const slug = `${WRITING_SLUG}/${post.slug}`

  return (
    // The same column as every section: the gutter outside, the content width
    // inside — so a post starts at the same left edge as the rest of the site.
    <article className="post-page px-gutter-x pt-32 pb-24" lang={post.lang}>
      <div className="mx-auto w-full max-w-content">
        <PageHead
          slug={slug}
          seo={postSeo(post, name, SITE)}
        />

        <Link to={hrefFor(WRITING_SLUG, locale)} className="label-mono text-tertiary-ink/60 hover:text-primary-400">
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
