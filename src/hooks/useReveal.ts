import { useEffect, type RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The one entrance the site has: a 300 ms fade and an 8 px rise, once, for
 * things that are below the fold when the page mounts. Things that come into
 * view together cascade, 60 ms apart.
 *
 * Everything starts visible. Only an element whose top edge is off the bottom
 * of the viewport is marked pending — so the first paint is never a blank
 * page waiting on a scroll trigger, which is what the old GSAP timelines
 * produced for four to eleven seconds after every navigation. An element
 * already in view is never touched at all.
 *
 * `selector` narrows the targets to the matching descendants (cards in a
 * grid); without it the ref's own element is the target. Under
 * `prefers-reduced-motion: reduce` the hook is inert: the stylesheet also
 * neutralises the classes, but not adding them is the cheaper guarantee.
 *
 * Two things a future caller needs to know. The classes are global with no
 * reference counting, so exactly one `useReveal` call may target any given
 * element — two overlapping calls step on each other's classList and corrupt
 * each other's cleanup. And `src/styles/portfolio-kit.css` defines its own
 * `.pf-kit .reveal` at higher specificity, which would neutralise
 * `reveal--pending` before it ever paints — calling this hook on an element
 * inside the imported kit's `.pf-kit` wrapper silently produces no entrance.
 */
export const REVEAL_CLASS = 'reveal'
export const PENDING_CLASS = 'reveal--pending'

/** Elements that come into view together arrive one after another, this far apart, at most four steps. */
export const STAGGER_MS = 60
const STAGGER_STEPS = 4

export function useReveal(ref: RefObject<HTMLElement | null>, selector?: string): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reducedMotion) return

    const targets = selector ? Array.from(root.querySelectorAll<HTMLElement>(selector)) : [root]
    const fold = window.innerHeight
    const below = targets.filter((el) => el.getBoundingClientRect().top > fold)

    targets.forEach((el) => el.classList.add(REVEAL_CLASS))
    if (below.length === 0) return () => targets.forEach((el) => el.classList.remove(REVEAL_CLASS))

    below.forEach((el) => el.classList.add(PENDING_CLASS))
    const observer = new IntersectionObserver(
      (entries) => {
        let step = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          // A row of cards entering at once reads as one block dropping in; a
          // short cascade reads as a row. The delay goes once the entrance ends,
          // so it never holds up the element's own hover transitions.
          const delay = Math.min(step++, STAGGER_STEPS) * STAGGER_MS
          if (delay > 0) {
            element.style.transitionDelay = `${delay}ms`
            element.addEventListener('transitionend', () => element.style.removeProperty('transition-delay'), { once: true })
          }
          element.classList.remove(PENDING_CLASS)
          observer.unobserve(element)
        }
      },
      // Fire a little before the element's top reaches the bottom edge, so the
      // rise is finishing as the reader arrives rather than starting then.
      { rootMargin: '0px 0px -10% 0px' },
    )
    below.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      targets.forEach((el) => {
        el.classList.remove(REVEAL_CLASS, PENDING_CLASS)
        el.style.removeProperty('transition-delay')
      })
    }
  }, [ref, selector, reducedMotion])
}
