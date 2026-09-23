import type { Transition } from 'framer-motion'

/**
 * The site's motion vocabulary, in the two knobs Apple designs springs with.
 *
 * `bounce` is one minus the damping ratio: 0 settles without overshoot, 0.2 is
 * the slight rebound of something that arrived with momentum. `visualDuration`
 * is Apple's "response" — how long the move visibly takes, not how long the
 * spring needs to come to rest. A spring has no fixed duration; that is the
 * point of it. Retargeted mid-flight it carries its velocity into the new
 * target instead of restarting, which is what lets an animation be grabbed.
 *
 * Overshoot only where a gesture earned it. A panel that faded in has no
 * momentum to spend; a card the reader flicked does.
 */
export const SPRING = {
  /** Critically damped, the house default — the modal, the nav pill, a snap. */
  settle: { type: 'spring', bounce: 0, visualDuration: 0.35 } satisfies Transition,
  /** Same character, quicker — for something answering the pointer directly. */
  follow: { type: 'spring', bounce: 0, visualDuration: 0.15 } satisfies Transition,
  /** After a flick: a little rebound, because the thing was thrown. */
  momentum: { type: 'spring', bounce: 0.2, visualDuration: 0.4 } satisfies Transition,
} as const

/** `useSpring` takes the same options without the `type` discriminator. */
export const SPRING_VALUE = {
  settle: { bounce: 0, visualDuration: 0.35 },
  follow: { bounce: 0, visualDuration: 0.15 },
  momentum: { bounce: 0.2, visualDuration: 0.4 },
} as const

/**
 * The point an interaction should grow out of. For a keyboard-activated click
 * `detail` is 0 and clientX/Y with it, so that case anchors to the middle of
 * the control instead of the top-left of the page.
 */
export function originOf(event: { clientX: number; clientY: number; detail: number; currentTarget: Element }): {
  x: number
  y: number
} {
  if (event.detail === 0) {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }
  return { x: event.clientX, y: event.clientY }
}
