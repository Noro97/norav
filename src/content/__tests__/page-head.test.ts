import { describe, expect, it } from 'vitest'
import type { SnapshotPage } from '@norav/content-schema'
import { resolveSeo } from '../PageHead'

const SITE = 'https://norav.dev'

const page = (seo: unknown, blocks: unknown[] = []): SnapshotPage =>
  ({ slug: 'work/merch', seo, blocks }) as SnapshotPage

describe('resolveSeo', () => {
  it('prefers what was written for this language', () => {
    const resolved = resolveSeo(
      page({ en: { title: 'English' }, ru: { title: 'Русский' } }),
      'ru',
    )
    expect(resolved.title).toBe('Русский')
  })

  it('falls back to English rather than to an empty head', () => {
    const resolved = resolveSeo(page({ en: { title: 'English', description: 'Written' } }), 'ru')
    expect(resolved.title).toBe('English')
    expect(resolved.description).toBe('Written')
  })

  it('falls back to what the first block already says', () => {
    // A case study's title is written once, as its own copy. Repeating it in
    // the page's seo would be a second place to keep right.
    const resolved = resolveSeo(
      page({}, [{ content: { title: 'MerchForge', description: 'AI merch designer.' } }]),
      'en',
    )
    expect(resolved.title).toBe('MerchForge')
    expect(resolved.description).toBe('AI merch designer.')
  })

  it('leaves a title undefined when nothing says one', () => {
    expect(resolveSeo(page({}), 'en').title).toBeUndefined()
    expect(resolveSeo(undefined, 'en').title).toBeUndefined()
  })

  it('gives every page a card image', () => {
    // og:image is no longer in index.html, so a page without one of its own
    // would otherwise share links with no image at all.
    expect(resolveSeo(page({}), 'en').image).toBe(`${SITE}/assets/img/logo-new.svg`)
  })

  it('makes a typed-in path absolute', () => {
    // A crawler has no document to resolve a relative path against; it drops it
    // and the card renders bare.
    expect(resolveSeo(page({ en: { ogImage: '/media/card.png' } }), 'en').image).toBe(
      `${SITE}/media/card.png`,
    )
  })

  it('leaves an absolute URL alone', () => {
    const blob = 'https://blob.vercel-storage.com/media/card.png'
    expect(resolveSeo(page({ en: { ogImage: blob } }), 'en').image).toBe(blob)
  })
})
