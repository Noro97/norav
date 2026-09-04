import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Whether the element has been on screen at least once.
 *
 * The trigger for an effect that plays on arrival and then stays put — a
 * counter, a text reveal. Unlike `useInView` it never goes back to false, and
 * it disconnects the moment it fires, so nothing is watching a section a reader
 * has already scrolled past.
 *
 * `enabled: false` skips the observer entirely, for a caller whose start is
 * already gated by something else.
 */
export function useInViewOnce<T extends Element>(
  threshold = 0.3,
  enabled = true,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setSeen(true)
        observer.disconnect()
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, seen, threshold])

  return [ref, seen]
}
