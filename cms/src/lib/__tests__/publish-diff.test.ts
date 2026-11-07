import { describe, expect, it } from 'vitest'
import { diffPublications } from '../publish-diff'

describe('what a publish would change', () => {
  it('finds nothing in identical content', () => {
    const content = { pages: [{ slug: 'about', blocks: [{ type: 'about', title: 'Hi' }] }] }
    expect(diffPublications(content, structuredClone(content))).toEqual([])
  })

  it('ignores what changes on every publish', () => {
    expect(
      diffPublications({ version: 26, publishedAt: 'a', checksum: 'b' }, { version: 27, publishedAt: 'c', checksum: 'd' }),
    ).toEqual([])
    expect(
      diffPublications(
        { locales: { en: { version: 26, publishedAt: 'a', checksum: 'b' } } },
        { locales: { en: { version: 27, publishedAt: 'c', checksum: 'd' } } },
      ),
    ).toEqual([])
  })

  it('keeps a field called version inside the content', () => {
    expect(diffPublications({ page: { version: 1 } }, { page: { version: 2 } })).toEqual([
      { path: 'page.version', before: 1, after: 2 },
    ])
  })

  it('names the exact field that changed', () => {
    const before = { pages: [{ blocks: [{ title: 'Old' }] }] }
    const after = { pages: [{ blocks: [{ title: 'New' }] }] }
    expect(diffPublications(before, after)).toEqual([{ path: 'pages[0].blocks[0].title', before: 'Old', after: 'New' }])
  })

  it('reports what appears and disappears', () => {
    expect(diffPublications({ a: 1 }, { b: 2 })).toEqual([
      { path: 'a', before: 1, after: undefined },
      { path: 'b', before: undefined, after: 2 },
    ])
    expect(diffPublications({ list: [1, 2] }, { list: [1] })).toEqual([{ path: 'list[1]', before: 2, after: undefined }])
  })
})
