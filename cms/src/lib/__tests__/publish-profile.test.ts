import { DEFAULT_PROFILE } from '@norav/content-schema'
import { describe, expect, it } from 'vitest'
import { profileProblems } from '../publish'

describe('a profile at publish', () => {
  it('passes when valid', () => {
    expect(profileProblems(DEFAULT_PROFILE)).toEqual([])
  })

  it('does not stop a database that has none, as production has none until 0032', () => {
    expect(profileProblems(undefined)).toEqual([])
  })

  it('is refused when it would break the metadata, naming the field', () => {
    expect(profileProblems({ ...DEFAULT_PROFILE, name: '' })).toEqual([
      expect.objectContaining({ page: '(site settings)', block: 'profile', path: 'name' }),
    ])
  })
})
