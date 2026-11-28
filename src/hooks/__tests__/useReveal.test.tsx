import { useRef } from 'react'
import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STAGGER_MS, useReveal } from '@/hooks/useReveal'

/**
 * jsdom has no layout, so every element reports a top of 0 and the hook would
 * see the whole page as above the fold. The tests place elements themselves,
 * and drive the observer by hand.
 */
type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void
let observed: Element[] = []
let fire: Callback = () => {}

class FakeObserver {
  constructor(cb: Callback) {
    fire = cb
  }
  observe(el: Element) {
    observed.push(el)
  }
  unobserve(el: Element) {
    observed = observed.filter((o) => o !== el)
  }
  disconnect() {
    observed = []
  }
}

function Section({ selector }: { selector?: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, selector)
  return (
    <section ref={ref} data-testid="root">
      <div className="card" data-testid="a" />
      <div className="card" data-testid="b" />
    </section>
  )
}

describe('useReveal', () => {
  beforeEach(() => {
    observed = []
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })
  afterEach(() => vi.restoreAllMocks())

  it('leaves an element already in view visible and unobserved', () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 100, bottom: 200, left: 0, right: 0, width: 0, height: 100, x: 0, y: 100, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section />)
      const root = getByTestId('root')
      expect(root.classList.contains('reveal')).toBe(true)
      expect(root.classList.contains('reveal--pending')).toBe(false)
      expect(observed).toHaveLength(0)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('marks a below-fold element pending, then reveals it when it intersects', () => {
    // Place before mount: jsdom lets us patch the prototype for this test.
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section />)
      const root = getByTestId('root')
      expect(root.classList.contains('reveal')).toBe(true)
      expect(root.classList.contains('reveal--pending')).toBe(true)
      expect(observed).toContain(root)
      act(() => fire([{ target: root, isIntersecting: true }]))
      expect(root.classList.contains('reveal--pending')).toBe(false)
      expect(observed).not.toContain(root)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('targets the selector\'s matches instead of the root when one is given', () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section selector=".card" />)
      expect(getByTestId('root').classList.contains('reveal')).toBe(false)
      expect(getByTestId('a').classList.contains('reveal--pending')).toBe(true)
      expect(getByTestId('b').classList.contains('reveal--pending')).toBe(true)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('cascades elements that arrive together, then lets go of the delay', () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section selector=".card" />)
      const [a, b] = [getByTestId('a'), getByTestId('b')]
      act(() => fire([{ target: a, isIntersecting: true }, { target: b, isIntersecting: true }]))
      expect(a.style.transitionDelay).toBe('')
      expect(b.style.transitionDelay).toBe(`${STAGGER_MS}ms`)
      // Kept past the entrance, it would hold up the card's own hover transitions.
      act(() => b.dispatchEvent(new Event('transitionend')))
      expect(b.style.transitionDelay).toBe('')
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('does nothing when the visitor asked for less motion', () => {
    const originalMatch = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'), media: query, onchange: null,
      addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    })) as typeof window.matchMedia
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section />)
      expect(getByTestId('root').classList.contains('reveal--pending')).toBe(false)
      expect(observed).toHaveLength(0)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
      window.matchMedia = originalMatch
    }
  })
})
