import { useEffect } from 'react'
import { useLocation } from 'react-router'

/**
 * Scrolls to the anchor in the address after arriving from another page.
 *
 * Within a page the nav scrolls on click and never touches the URL. Across
 * pages it follows a link to `/work/merch#proof`, and the section is not in the
 * document when the browser would normally handle the hash — the block is a lazy
 * chunk that has not loaded. So this waits for the element to appear rather than
 * scrolling once and missing.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const id = hash.slice(1)
    let frame = 0
    // Two seconds is long enough for a chunk on a slow connection and short
    // enough that a stale anchor stops fighting a reader who has scrolled away.
    const deadline = Date.now() + 2000

    const look = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView()
        return
      }
      if (Date.now() < deadline) frame = requestAnimationFrame(look)
    }
    frame = requestAnimationFrame(look)

    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
}
