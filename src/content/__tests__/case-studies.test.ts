import { describe, expect, it } from 'vitest'
import { withoutNumber } from '../case-studies'

describe('withoutNumber', () => {
  it('takes a trailing number off', () => {
    expect(withoutNumber('Case Study 01')).toBe('Case Study')
    expect(withoutNumber('Кейс 3')).toBe('Кейс')
  })

  it('leaves a number that is part of the phrase', () => {
    expect(withoutNumber('Selected Work · 2024 — 2026')).toBe('Selected Work · 2024 —')
    expect(withoutNumber('Case Study')).toBe('Case Study')
  })
})
