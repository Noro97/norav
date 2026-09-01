import { describe, expect, it } from 'vitest'
import { HOME_SLUG, hrefFor, otherLocale, readPath } from '../routing'

describe('readPath', () => {
  it('reads the root as the home page in English', () => {
    expect(readPath('/')).toEqual({ locale: 'en', slug: HOME_SLUG })
    expect(readPath('')).toEqual({ locale: 'en', slug: HOME_SLUG })
  })

  it('reads a nested slug', () => {
    expect(readPath('/work/merch')).toEqual({ locale: 'en', slug: 'work/merch' })
  })

  it('takes the language off the front', () => {
    expect(readPath('/ru')).toEqual({ locale: 'ru', slug: HOME_SLUG })
    expect(readPath('/ru/work/merch')).toEqual({ locale: 'ru', slug: 'work/merch' })
  })

  it('ignores a trailing slash', () => {
    expect(readPath('/work/merch/')).toEqual({ locale: 'en', slug: 'work/merch' })
    expect(readPath('/ru/')).toEqual({ locale: 'ru', slug: HOME_SLUG })
  })

  it('treats an unknown first segment as part of the slug', () => {
    // Otherwise a page the CMS calls "de" would be read as a language nobody
    // configured, and 404 instead of rendering.
    expect(readPath('/de/about')).toEqual({ locale: 'en', slug: 'de/about' })
  })
})

describe('hrefFor', () => {
  it('is the inverse of readPath', () => {
    for (const path of ['/', '/work/merch', '/ru', '/ru/work/merch']) {
      const address = readPath(path)
      expect(hrefFor(address.slug, address.locale)).toBe(path === '' ? '/' : path)
    }
  })

  it('leaves the default language unprefixed', () => {
    expect(hrefFor(HOME_SLUG, 'en')).toBe('/')
    expect(hrefFor('work/proof', 'en')).toBe('/work/proof')
  })

  it('prefixes the other one', () => {
    expect(hrefFor(HOME_SLUG, 'ru')).toBe('/ru')
    expect(hrefFor('work/proof', 'ru')).toBe('/ru/work/proof')
  })
})

describe('otherLocale', () => {
  it('swaps', () => {
    expect(otherLocale('en')).toBe('ru')
    expect(otherLocale('ru')).toBe('en')
  })
})
