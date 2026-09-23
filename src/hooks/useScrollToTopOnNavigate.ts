import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * A new page starts at its top; going back returns to where the reader was.
 *
 * The router keeps the window where it was, so following a link from the
 * bottom of one page landed at the bottom of the next. So a link — a push or a
 * replace — scrolls to the top. Back and forward are a POP, and there the
 * browser's own scroll restoration puts the reader back where they left, which
 * is what the back button promises.
 *
 * Instant, not smooth: the page is smooth-scrolled (index.css), but a reader
 * who has just arrived has nowhere to have come from. Only the path counts —
 * the preview token rides in the hash, and changing it is not a new page.
 */
export function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  useEffect(() => {
    if (type !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, type])
}
