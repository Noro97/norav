import { describe, expect, it } from 'vitest'
import { contentUrl } from '../ContentProvider'

describe('contentUrl', () => {
  const manifest = { version: 36, checksum: 'abc123' }

  it('names the document by its checksum as well as its version', () => {
    // A version number is only unique within one database. A laptop that
    // recreates its embedded database counts from one again, so "v=36" comes
    // round twice with different content — and the browser, told the first
    // was immutable, keeps serving it. The checksum is what actually changes.
    expect(contentUrl('http://localhost:3300', 'en', manifest)).toBe(
      'http://localhost:3300/api/public/content?locale=en&v=36&c=abc123',
    )
  })

  it('gives each locale its own address', () => {
    expect(contentUrl('https://cms.norav.dev', 'ru', manifest)).toContain('locale=ru&')
  })
})
