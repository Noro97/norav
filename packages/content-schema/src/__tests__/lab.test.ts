import { describe, expect, it } from 'vitest'
import { labTeaserBlock, validateBlockContent, validateBlockSettings } from '../blocks'
import { labCollection, listCollectionDefinitions, validateEntryContent, validateEntryData } from '../collections'

const row = { href: '/lab/#thermal', poster: '/assets/lab/thermal-v1.webp', clip: '' }

describe('lab collection', () => {
  it('accepts its own defaults, so a new row can be created and saved', () => {
    expect(validateEntryData('lab', labCollection.defaults.data)).toMatchObject({ ok: true })
    expect(validateEntryContent('lab', labCollection.defaults.content)).toMatchObject({ ok: true })
  })

  it('is listed for the admin, with a form for every field it stores', () => {
    const lab = listCollectionDefinitions().find((definition) => definition.key === 'lab')
    expect(lab?.titleField).toBe('title')
    expect(lab?.form.map((field) => field.field).sort()).toEqual(['clip', 'href', 'line', 'poster', 'title'])
  })

  it('leads only into the Lab or to a full address', () => {
    expect(validateEntryData('lab', row)).toMatchObject({ ok: true })
    expect(validateEntryData('lab', { ...row, href: 'https://norav.dev/lab/#globe' })).toMatchObject({ ok: true })
    // A page of this site belongs in the menu, not here.
    const local = validateEntryData('lab', { ...row, href: '/work' })
    expect(local.ok).toBe(false)
    if (!local.ok) expect(local.issues[0]?.path).toBe('href')
    expect(validateEntryData('lab', { ...row, href: '' })).toMatchObject({ ok: false })
  })

  it('needs a title and its one line', () => {
    expect(validateEntryContent('lab', { title: 'Optic Lab', line: 'A camera on the bench.' })).toMatchObject({ ok: true })
    expect(validateEntryContent('lab', { title: '', line: 'A camera on the bench.' })).toMatchObject({ ok: false })
    expect(validateEntryContent('lab', { title: 'Optic Lab', line: 'x'.repeat(161) })).toMatchObject({ ok: false })
  })

  it('keeps the link and the media out of translation', () => {
    const shared = labCollection.form.filter((field) => field.localized === false).map((field) => field.field)
    expect(shared.sort()).toEqual(['clip', 'href', 'poster'])
    const clip = labCollection.form.find((field) => field.field === 'clip')
    expect(clip?.accept).toBe('video')
  })
})

describe('lab_teaser block', () => {
  it('accepts its own defaults', () => {
    expect(validateBlockContent('lab_teaser', labTeaserBlock.defaults.content)).toMatchObject({ ok: true })
    expect(validateBlockSettings('lab_teaser', labTeaserBlock.defaults.settings)).toMatchObject({ ok: true })
  })

  it('shows between one and six exhibits, as a whole number', () => {
    for (const count of [0, 7, 2.5]) {
      expect(validateBlockSettings('lab_teaser', { count, linkHref: '/lab/' })).toMatchObject({ ok: false })
    }
    expect(validateBlockSettings('lab_teaser', { count: 6, linkHref: '/lab/' })).toMatchObject({ ok: true })
  })

  it('needs its link text, because the link is the way into the Lab', () => {
    const content = { ...labTeaserBlock.defaults.content, linkLabel: '' }
    expect(validateBlockContent('lab_teaser', content)).toMatchObject({ ok: false })
  })

  it('appears once per page and points the editor at the collection', () => {
    expect(labTeaserBlock.singleton).toBe(true)
    expect(labTeaserBlock.form.find((field) => field.control === 'collection')?.collection).toBe('lab')
  })
})
