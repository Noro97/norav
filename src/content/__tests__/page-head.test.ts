import { beforeEach, describe, expect, it } from 'vitest'
import type { SnapshotPage } from '@norav/content-schema'
import { applySeo, forgetShellDefaults, resolveSeo, SITE } from '../PageHead'

const page = (seo: unknown, blocks: unknown[] = []): SnapshotPage =>
  ({ slug: 'work/merch', seo, blocks }) as SnapshotPage

describe('resolveSeo', () => {
  it('prefers what was written for this language', () => {
    const resolved = resolveSeo(page({ en: { title: 'English' }, ru: { title: 'Русский' } }), 'ru')
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

  it('leaves a page that says nothing undefined', () => {
    // What fills these is the shell's own copy, in applySeo — not a constant
    // here that would be a second place to keep the site's defaults.
    const nothing = resolveSeo(page({}), 'en')
    expect(nothing.title).toBeUndefined()
    expect(nothing.description).toBeUndefined()
    expect(nothing.image).toBeUndefined()
    expect(resolveSeo(undefined, 'en').title).toBeUndefined()
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

  it('does not mistake a path for an absolute URL', () => {
    // "http" as the first four characters of a filename is not a scheme.
    expect(resolveSeo(page({ en: { ogImage: '/https-card.png' } }), 'en').image).toBe(
      `${SITE}/https-card.png`,
    )
    expect(resolveSeo(page({ en: { ogImage: 'httpcard.png' } }), 'en').image).toBe(
      `${SITE}httpcard.png`,
    )
  })
})

const SHELL_TITLE = 'Norayr Avetisyan — Senior Fullstack Engineer'
const SHELL_DESCRIPTION = 'What the shell says.'
const SHELL_IMAGE = `${SITE}/assets/img/logo-new.svg`

const content = (kind: 'name' | 'property', key: string) =>
  document.head.querySelector<HTMLMetaElement>(`meta[${kind}="${key}"]`)?.content

describe('applySeo', () => {
  beforeEach(() => {
    // A fresh shell, as index.html ships it.
    document.head.innerHTML = `
      <meta name="description" content="${SHELL_DESCRIPTION}" />
      <meta property="og:title" content="${SHELL_TITLE}" />
      <meta property="og:image" content="${SHELL_IMAGE}" />
      <meta name="twitter:title" content="${SHELL_TITLE}" />
    `
    document.title = SHELL_TITLE
    forgetShellDefaults()
  })

  it('writes the page’s own copy', () => {
    applySeo({ title: 'MerchForge', description: 'AI merch designer.' })

    expect(document.title).toBe('MerchForge')
    expect(content('property', 'og:title')).toBe('MerchForge')
    expect(content('name', 'twitter:title')).toBe('MerchForge')
    expect(content('name', 'description')).toBe('AI merch designer.')
  })

  it('rewrites the tag the shell carries instead of adding a second', () => {
    // The bug this replaced: React hoists a second tag into the head, and a
    // browser — like a crawler — reads the first one it finds, so every page
    // answered to the shell's title.
    applySeo({ title: 'MerchForge' })

    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('meta[name="twitter:title"]')).toHaveLength(1)
  })

  it('adds a tag the shell does not carry', () => {
    applySeo({ title: 'MerchForge', description: 'AI merch designer.' })
    expect(content('property', 'og:description')).toBe('AI merch designer.')
  })

  it('falls back to the shell for a page that says nothing', () => {
    applySeo({})

    expect(document.title).toBe(SHELL_TITLE)
    expect(content('property', 'og:image')).toBe(SHELL_IMAGE)
    expect(content('name', 'twitter:image')).toBe(SHELL_IMAGE)
  })

  it('does not leave the previous page’s title behind', () => {
    // Reading a case study and then following a link to a page with no title of
    // its own must not leave the case study's name in the tab.
    applySeo({ title: 'MerchForge', description: 'AI merch designer.' })
    applySeo({})

    expect(document.title).toBe(SHELL_TITLE)
    expect(content('property', 'og:title')).toBe(SHELL_TITLE)
    expect(content('name', 'description')).toBe(SHELL_DESCRIPTION)
  })
})
