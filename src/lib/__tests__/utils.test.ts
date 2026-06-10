import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const isHidden = [].length > 0
    expect(cn('base', isHidden && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves Tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})
