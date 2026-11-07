import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { profileProblems } from '../publish'

const migration = readFileSync(
  resolve(__dirname, '../../../../db/migrations/0032_the_profile_facts_have_one_home.sql'),
  'utf8',
)
const PROFILE = JSON.parse(migration.match(/\$json\$([\s\S]*?)\$json\$/)![1]!)

describe('a profile at publish', () => {
  it('passes when valid', () => {
    expect(profileProblems(PROFILE)).toEqual([])
  })

  it('is refused when missing, because the site has nothing to fall back on', () => {
    expect(profileProblems(undefined)).toEqual([
      expect.objectContaining({ page: '(site settings)', block: 'profile' }),
    ])
  })

  it('is refused when it would break the metadata, naming the field', () => {
    expect(profileProblems({ ...PROFILE, name: '' })).toEqual([
      expect.objectContaining({ page: '(site settings)', block: 'profile', path: 'name' }),
    ])
  })
})
