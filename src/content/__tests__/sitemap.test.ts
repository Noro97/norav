import { describe, expect, it } from 'vitest'
// The generator is a build script rather than site code: it runs in `prebuild`,
// after the snapshot is baked and before vite sees it. Its address logic is
// tested here, next to the routing it has to agree with.
import { addressOf, buildSitemap, LOCALES } from '../../../scripts/generate-sitemap.mjs'
import { hrefFor } from '../routing'

const SITE = 'https://norav.dev'

const snapshot = {
  publishedAt: '2026-09-01T09:43:21.936Z',
  pages: [
    { slug: 'home', blocks: [{ type: 'hero' }] },
    { slug: 'about', blocks: [{ type: 'about' }] },
    { slug: 'work/merch', blocks: [{ type: 'merch' }] },
    { slug: 'work/proof', blocks: [] },
    { slug: 'site', blocks: [{ type: 'terminal_footer' }] },
  ],
}

describe('addressOf', () => {
  it('agrees with the site’s own routing', () => {
    // Two copies of one rule is the failure mode worth a test: the day someone
    // changes the language prefix, the sitemap must not go on publishing the
    // addresses it used to have.
    for (const slug of ['home', 'about', 'work/merch']) {
      for (const locale of LOCALES) {
        expect(addressOf(slug, locale)).toBe(hrefFor(slug, locale))
      }
    }
  })
})

describe('buildSitemap', () => {
  const xml = buildSitemap(snapshot, SITE)

  it('lists every page in every language', () => {
    expect(xml).toContain(`<loc>${SITE}/</loc>`)
    expect(xml).toContain(`<loc>${SITE}/ru</loc>`)
    expect(xml).toContain(`<loc>${SITE}/about</loc>`)
    expect(xml).toContain(`<loc>${SITE}/ru/about</loc>`)
    expect(xml).toContain(`<loc>${SITE}/work/merch</loc>`)
    expect(xml).toContain(`<loc>${SITE}/ru/work/merch</loc>`)
  })

  it('leaves out a page that has no sections', () => {
    // A published page with nothing on it renders as NotFound, so listing it
    // would be asking a search engine to index a 404.
    expect(xml).not.toContain('work/proof')
  })

  it('leaves out the site page', () => {
    // `site` is the chrome — its blocks render below every page. It answers at
    // /site, but as an address of its own it is a footer with no page above it.
    expect(xml).not.toContain('<loc>https://norav.dev/site</loc>')
  })

  it('points each address at its translation', () => {
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="en" href="${SITE}/about"/>`)
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="ru" href="${SITE}/ru/about"/>`)
    // x-default is what a search engine shows a reader whose language matches
    // neither — English, the language the site answers on without a prefix.
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/about"/>`)
  })

  it('dates the map from the publication it was built from', () => {
    expect(xml).toContain('<lastmod>2026-09-01</lastmod>')
    expect(xml).not.toContain('2026-03-31')
  })

  it('is one urlset', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml.match(/<urlset/g)).toHaveLength(1)
    expect(xml.match(/<url>/g)).toHaveLength(6)
  })
})
