import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { validateBlockContent, validateBlockSettings, validateEntryContent, validateEntryData } from '@norav/content-schema'

/**
 * What migration 0036 writes passes the schemas the CMS saves and publishes with.
 *
 * Collection rows aren't validated at publish, only when the admin saves them, so
 * a row the migration wrote wrong would publish and then fail the first time
 * someone edited it. The teaser would be refused at release, after the merge.
 */
const ROOT = resolve(__dirname, '../../..')
const SQL = readFileSync(join(ROOT, 'db/migrations/0036_the_lab_on_the_home_page.sql'), 'utf8')

const rows = [...SQL.matchAll(/\('lab', '([^']+)', +\d+, true, '(\{[^']*\})'::jsonb\)/g)].map(([, slug, data]) => ({
  slug: slug!,
  data: JSON.parse(data!) as Record<string, string>,
}))
const copy = [...SQL.matchAll(/\('([^']+)', +'(\{"title".*\})'\)/g)].map(([, slug, json]) => ({
  slug: slug!,
  content: JSON.parse(json!.replace(/''/g, "'")) as unknown,
}))
const teaserContent = JSON.parse(/\$json\$([\s\S]*?)\$json\$::jsonb/.exec(SQL)![1]!) as unknown
const teaserSettings = JSON.parse(/'(\{"count":[^']*\})'::jsonb/.exec(SQL)![1]!) as unknown

describe('the Lab in migration 0036', () => {
  it('writes a title and a line for every row it adds', () => {
    expect(rows.length).toBe(9)
    expect(copy.map((row) => row.slug)).toEqual(rows.map((row) => row.slug))
  })

  it.each(rows)('$slug passes the lab collection', ({ data }) => {
    expect(validateEntryData('lab', data)).toMatchObject({ ok: true })
    for (const path of [data.poster, data.clip].filter(Boolean)) expect(existsSync(join(ROOT, 'public', path!))).toBe(true)
  })

  it.each(copy)('$slug has copy that passes the lab collection', ({ content }) => {
    expect(validateEntryContent('lab', content)).toMatchObject({ ok: true })
  })

  it('writes a teaser that passes the lab_teaser block', () => {
    expect(validateBlockContent('lab_teaser', teaserContent)).toMatchObject({ ok: true })
    expect(validateBlockSettings('lab_teaser', teaserSettings)).toMatchObject({ ok: true })
  })
})
