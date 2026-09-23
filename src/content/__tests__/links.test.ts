import { describe, expect, it } from 'vitest'
import { resolveContentLinks } from '../links'

const anchorPages = new Map([
  ['contact', 'contact'],
  ['overview', 'work'],
  ['hero', 'home'],
])
const pages = new Set(['home', 'contact', 'work', 'writing'])

describe('resolveContentLinks', () => {
  it('turns a link to a section into the route of its page, in the reader’s language', () => {
    const content = { primaryHref: '#contact', ctaHref: '#overview', items: [{ href: '#hero' }] }
    expect(resolveContentLinks(content, anchorPages, pages, 'en')).toEqual({
      primaryHref: '/contact',
      ctaHref: '/work',
      items: [{ href: '/' }],
    })
    expect(resolveContentLinks(content, anchorPages, pages, 'ru').primaryHref).toBe('/ru/contact')
  })

  it('gives a path to a published page the language prefix', () => {
    expect(resolveContentLinks({ href: '/writing' }, anchorPages, pages, 'ru').href).toBe('/ru/writing')
  })

  it('leaves everything that is not a link to this site alone', () => {
    const content = {
      href: 'https://github.com/Noro97',
      cvHref: '/Norayr_Avetisyan_CV.pdf',
      mailHref: 'mailto:hi@norav.dev',
      unknown: { href: '#nowhere' },
      // Not a link field: a colour is a hash too.
      accent: '#9AE316',
      title: '#contact is not a link here',
    }
    expect(resolveContentLinks(content, anchorPages, pages, 'ru')).toEqual(content)
  })
})
