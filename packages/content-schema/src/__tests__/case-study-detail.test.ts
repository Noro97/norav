import { describe, expect, it } from 'vitest'
import { getBlockDefinition, isBlockType, validateBlockContent } from '../blocks'

/**
 * One type per case study rather than one type placed five times.
 *
 * `findBlock` searches the whole snapshot and returns the first block of a
 * type, because every type on this site names exactly one block wherever it
 * lives. Five copies of one type would render the first one's content five
 * times, so the five studies get five types from a single factory — the same
 * shape `defineCaseStudy` already gives their headers.
 */
const TYPES = [
  'logistics_detail',
  'merch_detail',
  'ecommerce_detail',
  'omnigrid_detail',
  'proof_detail',
] as const

describe('case study detail blocks', () => {
  it('registers one per case study', () => {
    for (const type of TYPES) {
      expect(isBlockType(type)).toBe(true)
    }
  })

  it('is a content block the CMS owns outright', () => {
    for (const type of TYPES) {
      const definition = getBlockDefinition(type)!
      // Tier 1: every prop comes from the CMS, so it has to offer controls.
      expect(definition.tier).toBe(1)
      expect(definition.form.length).toBeGreaterThan(0)
      // At most once on a page, like the header it sits under.
      expect(definition.singleton).toBe(true)
    }
  })

  it('starts empty, so a study nobody has written about yet renders nothing', () => {
    for (const type of TYPES) {
      const definition = getBlockDefinition(type)!
      const result = validateBlockContent(type, definition.defaults.content)
      expect(result.ok).toBe(true)

      const content = definition.defaults.content as {
        intro: string
        decisions: unknown[]
        metrics: unknown[]
      }
      expect(content.intro).toBe('')
      expect(content.decisions).toEqual([])
      expect(content.metrics).toEqual([])
    }
  })

  it('takes decisions and the numbers behind them', () => {
    const result = validateBlockContent('logistics_detail', {
      sectionLabel: 'Under the hood',
      title: 'Keeping 500 markers at 60 FPS',
      intro: 'The map redraws on every tick.',
      decisions: [
        { title: 'Advanced Markers over the default', body: 'The default marker mounts a DOM node each.' },
      ],
      metrics: [{ label: 'Scripting time', value: '−70%' }],
    })
    expect(result.ok).toBe(true)
  })

  it('caps both lists so a page cannot become a wall', () => {
    const many = (count: number) =>
      Array.from({ length: count }, (_, i) => ({ title: `t${i}`, body: `b${i}` }))

    expect(validateBlockContent('proof_detail', { decisions: many(6) }).ok).toBe(true)
    expect(validateBlockContent('proof_detail', { decisions: many(7) }).ok).toBe(false)
  })

  it('refuses a decision with a title and no substance', () => {
    // A heading with nothing under it reads as an unfinished page rather than
    // a short one. Leaving the row out entirely is the way to say less.
    const result = validateBlockContent('merch_detail', {
      decisions: [{ title: 'State lives in one place', body: '' }],
    })
    expect(result.ok).toBe(false)
  })
})
