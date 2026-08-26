import { describe, expect, it } from 'vitest'
import { isLocale, mergeLocale, SOURCE_LOCALE } from '../locales'

describe('mergeLocale', () => {
  it('overlays translated leaves onto the source', () => {
    expect(mergeLocale({ title: 'Experience', label: 'Career' }, { title: 'Опыт' })).toEqual({
      title: 'Опыт',
      label: 'Career',
    })
  })

  it('falls back to the source for empty and missing values', () => {
    expect(mergeLocale({ a: 'source', b: 'source' }, { a: '', b: undefined })).toEqual({
      a: 'source',
      b: 'source',
    })
  })

  it('merges arrays element-wise and keeps the source length', () => {
    const source = ['one', 'two', 'three']
    expect(mergeLocale(source, ['один'])).toEqual(['один', 'two', 'three'])
    // A longer translation cannot add rows: structure belongs to the source locale.
    expect(mergeLocale(source, ['1', '2', '3', '4'])).toEqual(['1', '2', '3'])
  })

  it('keeps the source shape when the translation has a different one', () => {
    expect(mergeLocale({ nested: { a: 1 } }, { nested: 'oops' })).toEqual({ nested: { a: 1 } })
    expect(mergeLocale(['a'], 'not-an-array')).toEqual(['a'])
  })

  it('does not let a translation introduce unknown keys', () => {
    expect(mergeLocale({ a: 'x' }, { a: 'y', injected: 'z' })).toEqual({ a: 'y' })
  })

  it('recognises supported locales only', () => {
    expect(isLocale(SOURCE_LOCALE)).toBe(true)
    expect(isLocale('ru')).toBe(true)
    expect(isLocale('de')).toBe(false)
  })
})
