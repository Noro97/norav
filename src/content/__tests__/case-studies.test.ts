import { describe, expect, it } from 'vitest'
import { numberedLabel, withoutNumber } from '../case-studies'

const page = (...types: string[]) => types.map((type) => ({ type }))

// The page as published: an intro, then the five case studies, then the rest.
const all = page(
  'hero',
  'projects_intro',
  'logistics',
  'merch',
  'ecommerce',
  'omnigrid',
  'proof',
  'contact_cta',
)

describe('numberedLabel', () => {
  it('numbers the case studies in the order they appear', () => {
    expect(numberedLabel(all, 'logistics', 'Case Study')).toBe('Case Study 01')
    expect(numberedLabel(all, 'merch', 'Case Study')).toBe('Case Study 02')
    expect(numberedLabel(all, 'proof', 'Case Study')).toBe('Case Study 05')
  })

  it('renumbers when one is hidden', () => {
    // The bug: hiding the first left the second still calling itself 02, with
    // no 01 anywhere above it. Hidden sections never reach the snapshot.
    const hidden = all.filter((block) => block.type !== 'logistics')
    expect(numberedLabel(hidden, 'merch', 'Case Study')).toBe('Case Study 01')
    expect(numberedLabel(hidden, 'proof', 'Case Study')).toBe('Case Study 04')
  })

  it('counts only case studies, not every section above them', () => {
    expect(numberedLabel(all, 'logistics', 'Case Study')).not.toBe('Case Study 03')
  })

  it('replaces a number already in the label instead of appending one', () => {
    // Every snapshot published so far has the number typed into the copy.
    expect(numberedLabel(all, 'merch', 'Case Study 02')).toBe('Case Study 02')
    const hidden = all.filter((block) => block.type !== 'logistics')
    expect(numberedLabel(hidden, 'merch', 'Case Study 02')).toBe('Case Study 01')
  })

  it('leaves a section that is not a case study alone', () => {
    expect(numberedLabel(all, 'contact_cta', 'Get in touch')).toBe('Get in touch')
  })

  it('works in any language', () => {
    expect(numberedLabel(all, 'ecommerce', 'Кейс 03')).toBe('Кейс 03')
  })
})

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

// After the split each case study sits alone on its own page, so anything that
// counted within a page would number all five of them 01.
const split = [
  { slug: 'home', blocks: page('hero', 'projects_intro', 'contact_cta') },
  { slug: 'work/logistics', blocks: page('logistics') },
  { slug: 'work/merch', blocks: page('merch') },
  { slug: 'work/proof', blocks: page('proof') },
]

describe('numbering once the case studies are on separate pages', () => {
  it('counts across pages, in page order', () => {
    const everything = split.flatMap((p) => p.blocks)
    expect(numberedLabel(everything, 'logistics', 'Case Study')).toBe('Case Study 01')
    expect(numberedLabel(everything, 'merch', 'Case Study')).toBe('Case Study 02')
    expect(numberedLabel(everything, 'proof', 'Case Study')).toBe('Case Study 03')
  })

  it('still renumbers when one page is unpublished', () => {
    const without = split.filter((p) => p.slug !== 'work/logistics').flatMap((p) => p.blocks)
    expect(numberedLabel(without, 'merch', 'Case Study')).toBe('Case Study 01')
  })
})
