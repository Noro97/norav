import { describe, expect, it } from 'vitest'
import { resolveTarget } from '../navigation'

const pages = [
  { slug: 'home', blocks: [{ anchorId: 'hero' }] },
  { slug: 'about', blocks: [{ anchorId: 'about' }, { anchorId: 'vibecoding' }] },
  { slug: 'skills', blocks: [{ anchorId: 'skills' }] },
  { slug: 'site', blocks: [{ anchorId: 'terminal' }] },
]
const index = new Map([
  ['hero', 'home'],
  ['about', 'about'],
  ['vibecoding', 'about'],
  ['skills', 'skills'],
  ['terminal', 'site'],
])

describe('resolveTarget', () => {
  it('uses the page the editor chose', () => {
    expect(resolveTarget(pages, 'about', 'about', index)).toBe('about')
  })

  it('does not let the anchor index override that choice', () => {
    // The bug this replaces: the index decided first, so every item with an
    // anchor ignored its Page field — which is every item.
    expect(resolveTarget(pages, 'about', 'vibecoding', index)).toBe('about')
  })

  it('follows the anchor when the chosen page no longer holds it', () => {
    // The section was moved in the CMS. Following it beats pointing at where it
    // used to be.
    expect(resolveTarget(pages, 'home', 'skills', index)).toBe('skills')
  })

  it('uses the page alone when the item names no section', () => {
    expect(resolveTarget(pages, 'skills', '', index)).toBe('skills')
  })

  it('falls back to the anchor when there is no page', () => {
    expect(resolveTarget(pages, '', 'terminal', index)).toBe('site')
  })

  it('lands on home when it can resolve neither', () => {
    expect(resolveTarget(pages, '', '', index)).toBe('home')
    expect(resolveTarget(pages, '', 'nowhere', index)).toBe('home')
  })
})
