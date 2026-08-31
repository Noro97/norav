import { describe, expect, it } from 'vitest'
import { toneOf } from '../accent'

describe('toneOf', () => {
  it('passes the two current tones through', () => {
    expect(toneOf('main')).toBe('main')
    expect(toneOf('highlight')).toBe('highlight')
  })

  it('keeps highlights visible in snapshots published before the rename', () => {
    // The bundle renders the last publication until the next one lands. If
    // `crimson` fell through to the default, every accented phrase on the live
    // site would quietly lose its colour for the length of that gap.
    expect(toneOf('crimson')).toBe('highlight')
    expect(toneOf('none')).toBe('main')
    expect(toneOf('bright')).toBe('main')
  })

  it('falls back to the paragraph tone for anything it does not know', () => {
    expect(toneOf('chartreuse')).toBe('main')
    expect(toneOf('')).toBe('main')
  })
})
