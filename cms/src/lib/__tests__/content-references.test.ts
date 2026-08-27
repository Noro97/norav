import { describe, expect, it } from 'vitest'
import { replaceDeep, REFERENCE_SITES } from '../content-references'

const OLD = 'https://store/old.png'
const NEW = 'https://store/new.png'

describe('replaceDeep', () => {
  it('replaces a whole value, never a substring', () => {
    // Matching on substrings would rewrite '…/old.png?v=2' into something
    // broken, and worse, a longer URL that merely contains a shorter one.
    expect(replaceDeep(OLD, OLD, NEW)).toBe(NEW)
    expect(replaceDeep(`${OLD}?v=2`, OLD, NEW)).toBe(`${OLD}?v=2`)
  })

  it('reaches values nested in arrays of objects', () => {
    // The shape a bento block actually has: an array of tiles, each with its
    // own image, some of which are the file being replaced.
    const before = {
      tiles: [
        { slot: 0, image: OLD, title: 'One' },
        { slot: 1, image: 'https://store/other.png', title: 'Two' },
      ],
      illustrations: { omnigrid: OLD, gamification: '' },
    }
    expect(replaceDeep(before, OLD, NEW)).toEqual({
      tiles: [
        { slot: 0, image: NEW, title: 'One' },
        { slot: 1, image: 'https://store/other.png', title: 'Two' },
      ],
      illustrations: { omnigrid: NEW, gamification: '' },
    })
  })

  it('leaves everything that is not a string alone', () => {
    const before = { count: 4, on: true, missing: null, nested: [1, [2, [OLD]]] }
    expect(replaceDeep(before, OLD, NEW)).toEqual({
      count: 4,
      on: true,
      missing: null,
      nested: [1, [2, [NEW]]],
    })
  })
})

describe('REFERENCE_SITES', () => {
  it('covers both the source rows and their translations', () => {
    // A file can be named by a block's settings, an entry's data, or either
    // one's translated copy. Missing one is a silent half-migration.
    expect(REFERENCE_SITES.map((site) => site.table)).toEqual([
      'blocks',
      'block_translations',
      'entries',
      'entry_translations',
    ])
    expect(REFERENCE_SITES.filter((site) => site.translated)).toHaveLength(2)
  })
})
