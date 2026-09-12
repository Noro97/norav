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
 * Where a flick would come to rest on its own — the scroll-view deceleration
 * curve, so a release feels like a throw rather than a stop. Feed the result
 * to whatever picks the target (the nearest snap point, a clamp), then hand
 * the spring the same velocity so the seam between finger and animation
 * disappears.
 *
 * `velocity` in units per second; `decelerationRate` 0.998 is UIScrollView's
 * normal, 0.99 stops noticeably sooner.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/**
 * How far past a boundary a drag actually moves for how far the finger went —
 * the further past, the less it follows. `dimension` is the size of the thing
 * being dragged along that axis; the constant is UIScrollView's.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

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

/**
 * Velocity from the last few pointer samples rather than the last two — a
 * single frame is too noisy to hand to a spring. Samples older than the
 * window are dropped so a pause before release reads as a stop, not a throw.
 */
export class VelocityTracker {
  private samples: { t: number; v: number }[] = []

  constructor(private readonly windowMs = 100) {}

  reset(t: number, v: number): void {
    this.samples = [{ t, v }]
  }

  push(t: number, v: number): void {
    this.samples.push({ t, v })
    const cutoff = t - this.windowMs
    while (this.samples.length > 2 && this.samples[0]!.t < cutoff) this.samples.shift()
  }

  /** Units per second over the window; 0 when there is nothing to measure. */
  velocity(now: number): number {
    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    if (!first || !last || last === first) return 0
    // The finger held still before lifting: nothing to project.
    if (now - last.t > this.windowMs) return 0
    const dt = last.t - first.t
    return dt > 0 ? ((last.v - first.v) / dt) * 1000 : 0
  }
}
