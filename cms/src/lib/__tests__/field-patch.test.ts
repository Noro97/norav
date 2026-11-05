import { describe, expect, it } from 'vitest'
import { edits } from '../../../scripts/truth-patch.data'
import { patchFields, publishedDifferences, type PublishedDocument } from '../field-patch'

describe('patchFields', () => {
  const doc = { role: 'Old', stats: [{ value: 6 }], items: [{ name: 'Keep' }, { name: 'Drop' }] }

  it('writes a field that still holds the expected value', () => {
    const result = patchFields(doc, [{ path: 'stats.0.value', from: 6, to: 8 }])
    expect(result.document.stats[0]!.value).toBe(8)
    expect(result).toMatchObject({ applied: 1, alreadyDone: 0, moved: [] })
  })

  it('reports a field someone changed since, and leaves it alone', () => {
    const result = patchFields(doc, [{ path: 'role', from: 'Older', to: 'New' }])
    expect(result.document.role).toBe('Old')
    expect(result.moved).toEqual([{ path: 'role', expected: 'Older', found: 'Old' }])
  })

  it('skips a field that already holds the new value, so a rerun is safe', () => {
    const result = patchFields(doc, [{ path: 'role', from: 'Older', to: 'Old' }])
    expect(result).toMatchObject({ applied: 0, alreadyDone: 1, moved: [] })
  })

  it('removes a row by name, and treats a missing row as done', () => {
    const first = patchFields(doc, [{ removeRow: 'items', name: 'Drop' }])
    expect(first.document.items).toEqual([{ name: 'Keep' }])
    expect(first.applied).toBe(1)
    expect(patchFields(first.document, [{ removeRow: 'items', name: 'Drop' }]).alreadyDone).toBe(1)
  })

  it('reports a removal when the list is not there', () => {
    expect(patchFields(doc, [{ removeRow: 'missing', name: 'Drop' }]).moved).toHaveLength(1)
  })

  it('does not change the document it was given', () => {
    patchFields(doc, [{ path: 'role', from: 'Old', to: 'New' }, { removeRow: 'items', name: 'Drop' }])
    expect(doc.role).toBe('Old')
    expect(doc.items).toHaveLength(2)
  })
})

describe('publishedDifferences', () => {
  const published = (role: string, extra: object = {}): PublishedDocument => ({
    pages: [{ slug: 'about', seo: {}, blocks: [{ type: 'about', content: { role, ...extra }, settings: {} }] }],
    collections: { experience: [{ slug: 'proof-app', data: { period: 'x' } }] },
    settings: { theme: { tokens: {} } },
  })

  it('finds nothing in identical documents', () => {
    expect(publishedDifferences(published('a'), published('a'))).toEqual([])
  })

  it('names a changed field by page and block', () => {
    expect(publishedDifferences(published('a'), published('b'))).toEqual(['about/about.role'])
  })

  it('ignores what publishing normalises on its own', () => {
    const before = published('a', { mapFallback: 'https://example.test/map.webp' })
    const after = { ...published('a', { proof: '', proofHref: '' }), settings: { theme: { tokens: { '--color-ink': '#ffffff' } } } }
    expect(publishedDifferences(before, after)).toEqual([])
  })
})

describe('the truth patch', () => {
  const BANNED =
    /98[.,]4|92 ?%|27 migrations|in production|\bshipped\b|web3|blockchain|\bstaff\b|frontend-focused|blazeit|\bn8n\b|zapier|langchain|vibe|[67]\+ years|42 ?kb|sub-?millisecond|google maps|advanced markers|ai-powered|virtual/i

  const replacements = edits.flatMap((edit) => {
    if ('to' in edit) return [String(edit.to)]
    if (edit.kind === 'entry-create') return [JSON.stringify(edit.data), JSON.stringify(edit.content)]
    return []
  })

  it('brings back no claim that facts.md rules out', () => {
    expect(replacements.length).toBeGreaterThan(90)
    expect(replacements.filter((text) => BANNED.test(text))).toEqual([])
  })

  it('never edits a field to what it already holds', () => {
    expect(edits.filter((edit) => 'to' in edit && 'from' in edit && edit.to === edit.from)).toEqual([])
  })

  it('addresses each field once', () => {
    const paths = edits.flatMap((edit) => {
      if (edit.kind === 'block' || edit.kind === 'block-setting') return [`${edit.page}/${edit.type}/${edit.kind}/${edit.path}`]
      if (edit.kind === 'seo') return [`${edit.page}/seo/${edit.path}`]
      if (edit.kind === 'entry') return [`${edit.collection}/${edit.slug}/${edit.path}`]
      return []
    })
    expect(new Set(paths).size).toBe(paths.length)
  })
})
