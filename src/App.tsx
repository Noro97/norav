import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useHashScroll } from '@/hooks/useHashScroll'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { BlockRenderer } from '@/content/BlockRenderer'
import { PageHead } from '@/content/PageHead'
import { NotFound } from '@/components/NotFound'
import { readPath } from '@/content/routing'
import { useContent } from '@/content/ContentProvider'

function App() {
  const { slug } = readPath(useLocation().pathname)
  const { snapshot, isPreview } = useContent()
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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const setIsMobile = useAppStore((s) => s.setIsMobile)

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  useScrollTracking()
  useHashScroll()

  const mainRef = useRef<HTMLElement>(null)

  // Refresh ScrollTrigger when lazy sections change page height — the progress
  // bar is still measured by it.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    let timerId: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(timerId)
      timerId = setTimeout(() => ScrollTrigger.refresh(), 300)
    })
    observer.observe(main)

    return () => {
      observer.disconnect()
      clearTimeout(timerId)
    }
  }, [])

  return (
    <>
      <Navigation />
      <ScrollProgress />

      {/* Sections, their order and their visibility all come from the CMS —
          and so does the set of pages. A slug the CMS has not published is a
          404, not an empty page under a working header. */}
      <main ref={mainRef} className="relative z-10">
        {exists ? (
          <>
            <PageHead slug={slug} />
            <BlockRenderer slug={slug} />
          </>
        ) : (
          <NotFound />
        )}
      </main>
    </>
  )
}

export default App
