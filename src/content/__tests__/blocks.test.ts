import { describe, expect, it } from 'vitest'
import { BLOCK_REGISTRY } from '@norav/content-schema'
import { BLOCK_COMPONENTS } from '../blocks'
import { BAKED_SNAPSHOTS, findBlock, findBlockById, HOME_SLUG } from '../index'

describe('the site can render what the CMS can publish', () => {
  it('has a component for every registered block type', () => {
    const missing = Object.keys(BLOCK_REGISTRY).filter((type) => !BLOCK_COMPONENTS[type])
    expect(missing).toEqual([])
  })

  it('does not map components the registry has never heard of', () => {
    const unknown = Object.keys(BLOCK_COMPONENTS).filter((type) => !(type in BLOCK_REGISTRY))
    expect(unknown).toEqual([])
  })
})

describe('the baked snapshots', () => {
  it('ship a home page for every locale', () => {
    for (const [locale, snapshot] of Object.entries(BAKED_SNAPSHOTS)) {
      const page = snapshot.pages.find((candidate) => candidate.slug === HOME_SLUG)
      expect(page, `${locale} has no "${HOME_SLUG}" page`).toBeDefined()
      expect(page!.blocks.length).toBeGreaterThan(0)
    }
  })

  it('agree on structure across locales — only the copy differs', () => {
    const en = BAKED_SNAPSHOTS.en.pages[0]?.blocks.map((block) => block.type)
    const ru = BAKED_SNAPSHOTS.ru.pages[0]?.blocks.map((block) => block.type)
    expect(ru).toEqual(en)
  })

  it('carries the hero the entry chunk renders eagerly', () => {
    expect(findBlock(BAKED_SNAPSHOTS.en, 'hero')).toBeDefined()
  })
})

describe('finding one block among several of a type', () => {
  const snapshot = {
    pages: [
      {
        slug: 'home',
        blocks: [
          { id: 'a', type: 'testimonials', anchorId: null, content: {}, settings: { cardEffect: 'spotlight' } },
          { id: 'b', type: 'testimonials', anchorId: null, content: {}, settings: { cardEffect: 'none' } },
        ],
      },
      { slug: 'work', blocks: [{ id: 'c', type: 'case_study', anchorId: null, content: {}, settings: {} }] },
    ],
  } as unknown as Parameters<typeof findBlock>[0]

  it('reads the row it was asked for, not the first of the type', () => {
    // Four galleries on a page used to render the first one four times over,
    // because a type was assumed to name exactly one block.
    expect(findBlockById(snapshot, 'b')?.settings).toEqual({ cardEffect: 'none' })
    expect(findBlock(snapshot, 'testimonials')?.id).toBe('a')
  })

  it('looks across pages, the way finding by type does', () => {
    expect(findBlockById(snapshot, 'c')?.type).toBe('case_study')
  })

  it('has no answer for an id that is not published', () => {
    expect(findBlockById(snapshot, 'gone')).toBeUndefined()
  })
})
