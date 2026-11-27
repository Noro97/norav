import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate'
import { useRouterLinks } from '@/hooks/useRouterLinks'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { BlockRenderer } from '@/content/BlockRenderer'
import { PageHead } from '@/content/PageHead'
import { NotFound } from '@/components/NotFound'
import { readPath, SITE_SLUG } from '@/content/routing'
import { useContent } from '@/content/ContentProvider'
import { postAt } from '@/content/posts'
import { PostPage } from '@/components/posts/PostPage'

/** Where the skip link lands: the page's own content, past the menu. */
export const MAIN_ID = 'main'

function App() {
  const { slug } = readPath(useLocation().pathname)
  const { snapshot, isPreview } = useContent()
  const { t } = useTranslation('common')
  // A page with nothing on it is not a page. Hiding its last section in the CMS
  // leaves the row in the database and the slug in the snapshot, and rendering
  // that gives a reader a header above an empty screen — which reads as broken
  // rather than as an address that has nothing behind it.
  //
  // Except in preview, where the reader is the person who just made the page
  // and needs to see that it exists and is empty, rather than a 404 that looks
  // like the address was wrong.
  const page = snapshot.pages.find((candidate) => candidate.slug === slug)
  const exists = page !== undefined && (page.blocks.length > 0 || isPreview)
  // A post is not a page in the CMS: /writing/<slug> is answered from the
  // `posts` collection, under the Writing page it belongs to.
  const post = page ? undefined : postAt(snapshot, slug)
  useScrollToTopOnNavigate()

  const mainRef = useRef<HTMLElement>(null)
  const chromeRef = useRef<HTMLDivElement>(null)
  useRouterLinks(mainRef)
  useRouterLinks(chromeRef)

  return (
    <>
      <a href={`#${MAIN_ID}`} className="skip-link">
        {t('a11y.skip')}
      </a>
      <Navigation />
      <ScrollProgress />

      {/* Sections, their order and their visibility all come from the CMS —
          and so does the set of pages. A slug the CMS has not published is a
          404, not an empty page under a working header. */}
      <main ref={mainRef} id={MAIN_ID} tabIndex={-1} className="relative z-10 outline-none">
        {exists ? (
          <>
            <PageHead slug={slug} />
            <BlockRenderer slug={slug} />
          </>
        ) : post ? (
          <PostPage key={post.slug} post={post} />
        ) : (
          <NotFound />
        )}
      </main>

      {/* The page called `site` is the chrome every page ends with: the footer,
          and the terminal behind it. Outside <main>, so the footer is the page's
          footer rather than part of its content. */}
      <div ref={chromeRef} className="relative z-10">
        {(exists || post) && slug !== SITE_SLUG && <BlockRenderer slug={SITE_SLUG} />}
      </div>
    </>
  )
}

export default App
