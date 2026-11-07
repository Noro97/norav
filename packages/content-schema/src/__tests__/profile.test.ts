import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PROFILE_FORM, profileSchema } from '../profile'
import { DEFAULT_PROFILE } from '../profile-defaults'

const migration = readFileSync(
  resolve(__dirname, '../../../../db/migrations/0032_the_profile_facts_have_one_home.sql'),
  'utf8',
)
const seeded = () => JSON.parse(migration.match(/\$json\$([\s\S]*?)\$json\$/)![1]!)

describe('the profile', () => {
  it('seeds a value the schema accepts', () => {
    expect(profileSchema.parse(seeded())).toEqual(seeded())
  })

  it('has the same value in migration 0032 and in the fallback the site uses until it runs', () => {
    expect(seeded()).toEqual(DEFAULT_PROFILE)
  })

  it('refuses what the site could not render', () => {
    expect(profileSchema.safeParse({ ...DEFAULT_PROFILE, name: '' }).success).toBe(false)
    expect(profileSchema.safeParse({ ...DEFAULT_PROFILE, email: 'not an address' }).success).toBe(false)
    expect(profileSchema.safeParse({ ...DEFAULT_PROFILE, links: { ...DEFAULT_PROFILE.links, github: 'Noro97' } }).success).toBe(false)
  })

  it('lets the optional link be empty', () => {
    const links = { ...DEFAULT_PROFILE.links, telegram: '' }
    expect(profileSchema.safeParse({ ...DEFAULT_PROFILE, links }).success).toBe(true)
  })

  it('has an input in its form for every field', () => {
    const inForm = PROFILE_FORM.map((field) => field.field).sort()
    expect(inForm).toEqual(Object.keys(profileSchema.shape).sort())
    const location = PROFILE_FORM.find((field) => field.field === 'location')!
    expect(location.fields!.map((field) => field.field).sort()).toEqual(
      Object.keys(profileSchema.shape.location.shape).sort(),
    )
  })
})
