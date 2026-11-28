import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollProgress } from '../ScrollProgress'

describe('ScrollProgress', () => {
  let frames: FrameRequestCallback[] = []
  beforeEach(() => {
    frames = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => {})
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  const bar = (container: HTMLElement) => container.querySelector<HTMLElement>('.origin-left')!

  it('follows the scroll position, once a frame however many events arrive', () => {
    const { container } = render(<ScrollProgress />)
    expect(bar(container).style.transform).toBe('scaleX(0)')

    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(1)
    act(() => frames.shift()!(0))
    expect(bar(container).style.transform).toBe('scaleX(0.5)')
  })

  it('stops listening when it unmounts', () => {
    const { unmount } = render(<ScrollProgress />)
    unmount()
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(0)
  })
})
