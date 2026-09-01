import { Suspense } from 'react'
import { BLOCK_COMPONENTS } from './blocks'
import { useContent } from './ContentProvider'

const SectionLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-5 h-5 border-2 border-crimson-500/20 border-t-crimson-500 rounded-full animate-spin" />
  </div>
)

/**
 * Renders the page in the order the CMS published it.
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

  return (
    <>
      {page.blocks.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type]

        if (!Component) {
          if (import.meta.env.DEV) {
            console.warn(`[content] no component for block type "${block.type}" — skipping.`)
          }
          return null
        }

        return (
          <Suspense key={block.id} fallback={<SectionLoader />}>
            <Component anchorId={block.anchorId} />
          </Suspense>
        )
      })}
    </>
  )
}
