import { describe, expect, it } from 'vitest'
import { ROOT_SLUG, SLUG } from '../pages'

const accepts = (slug: string) => SLUG.test(slug)

describe('page slugs', () => {
  it('accepts what the site can serve', () => {
    // The site maps the path straight onto the slug, so these are URLs.
    expect(accepts('home')).toBe(true)
    expect(accepts('work')).toBe(true)
    expect(accepts('work/merch')).toBe(true)
    expect(accepts('case-studies/ai-merch-forge')).toBe(true)
  })

  it('refuses a leading or trailing slash', () => {
    // The site adds neither, so one here would produce a double slash or a
    // path that never matches.
    expect(accepts('/work')).toBe(false)
    expect(accepts('work/')).toBe(false)
    expect(accepts('work//merch')).toBe(false)
  })

  it('refuses what would need escaping in a URL', () => {
    expect(accepts('work merch')).toBe(false)
    expect(accepts('работа')).toBe(false)
    expect(accepts('work?merch')).toBe(false)
    expect(accepts('Work')).toBe(false)
  })

  it('refuses a hyphen with nothing on one side of it', () => {
    expect(accepts('-work')).toBe(false)
    expect(accepts('work-')).toBe(false)
    expect(accepts('work--merch')).toBe(false)
  })

  it('names the page the site serves at its root', () => {
    // routing.ts on the site side treats this exact slug as "/". The two must
    // agree, and this is the assertion that says so.
    expect(ROOT_SLUG).toBe('home')
    expect(accepts(ROOT_SLUG)).toBe(true)
  })
})
