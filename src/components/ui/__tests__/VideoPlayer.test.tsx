import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { VideoPlayer } from '../VideoPlayer'

let reducedMotion = false
vi.mock('@/hooks/useReducedMotion', () => ({ useReducedMotion: () => reducedMotion }))

/** Puts the player on or off screen. */
let intersect: (isIntersecting: boolean) => void

const play = vi.fn(() => Promise.resolve())
const pause = vi.fn()

const props = { src: '/clip.mp4', poster: '/poster.png', alt: 'A set of reps' }
const videoOf = (container: HTMLElement) => container.querySelector('video')

beforeAll(async () => {
  await import('@/i18n')
})

beforeEach(() => {
  reducedMotion = false
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = (isIntersecting) =>
          act(() => callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver))
      }
      observe() {}
      disconnect() {}
    },
  )
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(pause)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  play.mockClear()
  pause.mockClear()
})

describe('VideoPlayer', () => {
  it('loads nothing but the poster until someone presses play', () => {
    const { container } = render(<VideoPlayer {...props} />)

    expect(videoOf(container)).toBeNull()
    expect(container.querySelector('img')).toHaveAttribute('src', '/poster.png')
    expect(container.querySelector('img')).toHaveAttribute('loading', 'lazy')

    intersect(true)
    expect(videoOf(container)).toBeNull()
  })

  it('starts with sound and controls when pressed', () => {
    const { container } = render(<VideoPlayer {...props} />)

    fireEvent.click(screen.getByRole('button', { name: /A set of reps/ }))

    const video = videoOf(container)!
    expect(video).toHaveAttribute('src', '/clip.mp4')
    expect(video).toHaveAttribute('poster', '/poster.png')
    expect(video).toHaveAttribute('controls')
    expect(video.autoplay).toBe(true)
    expect(video.muted).toBe(false)
    expect(video.loop).toBe(false)
  })

  it('hands focus to the player that replaced the button, so a keyboard user keeps their place', () => {
    const { container } = render(<VideoPlayer {...props} />)

    const button = screen.getByRole('button', { name: /A set of reps/ })
    button.focus()
    fireEvent.click(button)

    expect(document.activeElement).toBe(videoOf(container))
  })

  it('keeps focus when an autoplay clip replaces the button a keyboard user is on', () => {
    const { container } = render(<VideoPlayer {...props} autoplay />)

    screen.getByRole('button', { name: /A set of reps/ }).focus()
    intersect(true)

    expect(document.activeElement).toBe(videoOf(container))
  })

  it('leaves focus alone when an autoplay clip starts while the visitor is elsewhere', () => {
    render(<VideoPlayer {...props} autoplay />)
    intersect(true)
    expect(document.activeElement).toBe(document.body)
  })

  it('leaves an autoplay clip alone while it is off screen', () => {
    const { container } = render(<VideoPlayer {...props} autoplay />)
    expect(videoOf(container)).toBeNull()
    expect(play).not.toHaveBeenCalled()
  })

  it('plays an autoplay clip silently once it nears the screen, and stops when it leaves', () => {
    const { container } = render(<VideoPlayer {...props} autoplay />)

    intersect(true)
    const video = videoOf(container)!
    expect(video.muted).toBe(true)
    expect(video.loop).toBe(true)
    expect(play).toHaveBeenCalledTimes(1)

    intersect(false)
    expect(pause).toHaveBeenCalled()
    expect(videoOf(container)).not.toBeNull()
  })

  it('does not autoplay under reduced motion: it waits for a click like any other', () => {
    reducedMotion = true
    const { container } = render(<VideoPlayer {...props} autoplay />)

    intersect(true)
    expect(videoOf(container)).toBeNull()
    expect(play).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /A set of reps/ }))
    expect(videoOf(container)!.autoplay).toBe(true)
  })

  it('leaves a pressed clip to the visitor when it scrolls away', () => {
    const { container } = render(<VideoPlayer {...props} autoplay />)

    fireEvent.click(screen.getByRole('button', { name: /A set of reps/ }))
    pause.mockClear()
    intersect(true)
    intersect(false)

    expect(videoOf(container)).not.toBeNull()
    expect(pause).not.toHaveBeenCalled()
  })

  it('reserves its frame before anything loads', () => {
    const { container, rerender } = render(<VideoPlayer {...props} />)
    expect(container.firstElementChild).toHaveClass('aspect-video')
    rerender(<VideoPlayer {...props} portrait />)
    expect(container.firstElementChild).toHaveClass('aspect-[9/16]')
  })
})
