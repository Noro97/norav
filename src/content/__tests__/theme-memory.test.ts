import { describe, expect, it, beforeEach } from 'vitest'
import { applyTheme, applyRememberedTheme } from '../theme'

const read = (name: string) => document.documentElement.style.getPropertyValue(name)

const settings = (accent: string) => ({
  theme: { tokens: { '--color-crimson-500': accent, '--color-background': '#000000' } },
})

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('style')
})

describe('remembering the palette', () => {
  it('applies a remembered palette that is newer than the bundle', () => {
    // What the network brought last visit, at version 13.
    applyTheme(settings('#222F6D'), 13)

    // A reload: the bundle paints what it was built with, then the memory wins.
    applyTheme(settings('#226D2B'))
    expect(read('--color-crimson-500')).toBe('#226D2B')
    applyRememberedTheme(9)
    expect(read('--color-crimson-500')).toBe('#222F6D')
  })

  it('ignores a remembered palette the bundle has caught up with', () => {
    // The whole safety of this: an older memory overriding a newer bundle would
    // flash in the opposite direction, which is worse for being unexpected.
    applyTheme(settings('#222F6D'), 9)
    applyTheme(settings('#226D2B'))
    applyRememberedTheme(13)
    expect(read('--color-crimson-500')).toBe('#226D2B')
  })

  it('remembers nothing when no version is given', () => {
    // How the preview path calls it: a draft must not outlive the preview.
    applyTheme(settings('#ff0000'))
    expect(window.localStorage.getItem('norav:theme')).toBeNull()
  })

  it('survives storage that cannot be read', () => {
    window.localStorage.setItem('norav:theme', 'not json')
    applyTheme(settings('#226D2B'))
    expect(() => applyRememberedTheme(1)).not.toThrow()
    expect(read('--color-crimson-500')).toBe('#226D2B')
  })
})
