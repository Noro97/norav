import { Suspense } from 'react'
import { BLOCK_COMPONENTS } from './blocks'
import { useContent } from './ContentProvider'
import { SectionLoader } from './SectionLoader'
import { SITE_SLUG } from './routing'

/**
 * Renders a page's sections in the order the CMS published it. The chrome page,
 * `site`, is rendered by the app after every page, outside <main>.
 *
 * Hidden sections never reach the snapshot, so they cost nothing here — not
 * even a chunk request. An unknown type is skipped with a warning instead of
 * throwing, so a CMS that is ahead of this deployment degrades to missing a
 * section rather than a blank page.
 */
export function BlockRenderer({ slug }: { slug: string }) {
 const { snapshot } = useContent()
 const page = snapshot.pages.find((candidate) => candidate.slug === slug)
 // A slug the CMS has not published. The caller decides what that looks like;
 // rendering nothing here would be a blank page with a working header, which
 // reads as a bug rather than as an address that does not exist.
 if (!page) return null

 if (page.blocks.length === 0) {
 // Only reachable in preview: a reader gets a 404 instead. The person
 // looking at this just made the page and needs to know it is theirs and
 // empty, not wonder whether the address was wrong.
 return (
      <section className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="label-mono">/{slug}</span>
        <p className="text-tertiary-ink/55 text-body-regular max-w-md">
          This page has no sections yet. Add one in the CMS, or move one here from another page.
        </p>
      </section>
    )
  }

 return (
    <>
      {page.blocks.map((block, index) => {
 const Component = BLOCK_COMPONENTS[block.type]

 if (!Component) {
 if (import.meta.env.DEV) {
            console.warn(`[content] no component for block type "${block.type}" — skipping.`)
          }
 return null
        }

 // `data-section` names the section for code on this page that needs to
 // reach it. It is not an id and never goes in the address: pages are
 // reached by route. The wrapper is `display: contents`, so it adds no box
 // and changes no layout.
 //
 // The section that opens a page carries its H1, whatever type it is: a
 // contact block is the heading of /contact and a section further down
 // the home page. The chrome page opens nothing.
 return (
          <div key={block.id} className="contents" data-section={block.anchorId ?? undefined}>
            <Suspense fallback={<SectionLoader />}>
              <Component blockId={block.id} first={index === 0 && slug !== SITE_SLUG} />
            </Suspense>
          </div>
        )
      })}
    </>
  )
}
