import { describe, expect, it } from 'vitest'
import { activeNavItem, resolveTarget } from '../navigation'

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

  it('keeps the chosen page even when its old section moved elsewhere', () => {
    // A page is the whole address: the menu does not send a reader somewhere
    // the editor did not pick because a section it once scrolled to moved.
    expect(resolveTarget(pages, 'home', 'skills', index)).toBe('home')
  })

  it('follows the section only when the chosen page is empty or gone', () => {
    const withEmpty = [...pages, { slug: 'automation', blocks: [] }]
    expect(resolveTarget(withEmpty, 'automation', 'skills', index)).toBe('skills')
    expect(resolveTarget(pages, 'retired', 'skills', index)).toBe('skills')
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

describe('activeNavItem', () => {
  const item = (id: string, page: string | null) => ({
    id,
    label: id,
    href: page ? `/${page}` : 'https://example.com',
    page,
    external: page === null,
  })
  const items = [
    item('home', 'home'),
    item('overview', 'work'),
    item('projects', 'work'),
    item('writing', 'writing'),
    item('cv', null),
  ]

  it('lights the item whose page this is', () => {
    expect(activeNavItem(items, 'writing')?.id).toBe('writing')
  })

  it('lights the nearest page above a nested one', () => {
    expect(activeNavItem(items, 'writing/content-pipelines')?.id).toBe('writing')
    expect(activeNavItem(items, 'work/merch')?.id).toBe('overview')
  })

  it('lights Home only at home, never as the parent of everything', () => {
    expect(activeNavItem(items, 'home')?.id).toBe('home')
    expect(activeNavItem(items, 'about')).toBeUndefined()
  })

  it('lights one item when two lead to the same page', () => {
    expect(activeNavItem(items, 'work')?.id).toBe('overview')
  })
})
