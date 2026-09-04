import { describe, expect, it } from 'vitest'
import { withDefaults } from '../content'

const DEFAULTS = {
  headLabel: 'What I do',
  title: 'Four ways',
  services: [{ n: '01', title: 'Sprints' }],
}

describe('withDefaults', () => {
  it('renders the imported copy when the CMS has nothing to say', () => {
    // A section outside the CMS — a test, or a block created before a field
    // existed — still has to draw something.
    expect(withDefaults(DEFAULTS, undefined)).toEqual(DEFAULTS)
    expect(withDefaults(DEFAULTS, {})).toEqual(DEFAULTS)
  })

  it('takes the edited value over the default', () => {
    const merged = withDefaults(DEFAULTS, { title: 'Three ways' })
    expect(merged.title).toBe('Three ways')
    expect(merged.headLabel).toBe('What I do')
  })

  it('treats a field cleared in the admin as unset', () => {
    // Clearing a heading in the form should not leave a bare gap where a
    // sentence was; the section falls back to what it shipped with.
    expect(withDefaults(DEFAULTS, { title: '' }).title).toBe('Four ways')
    expect(withDefaults(DEFAULTS, { title: '   ' }).title).toBe('Four ways')
  })

  it('lets a list be emptied', () => {
    // The opposite call from the one above, and deliberately so: merging the
    // default rows back in would make a row impossible to delete.
    expect(withDefaults(DEFAULTS, { services: [] }).services).toEqual([])
  })
})
