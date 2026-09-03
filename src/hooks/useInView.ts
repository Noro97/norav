import { useEffect, useRef, useState, type RefObject } from 'react'

/** Whether the element is currently on screen — stays live, unlike a one-shot reveal trigger. */
export function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), {
      rootMargin: '200px',
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return [ref, inView]
}
