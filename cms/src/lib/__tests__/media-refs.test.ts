import { describe, expect, it } from 'vitest'
import { mediaDisplaySrc, mediaRefId, resolveMediaRefs, toMediaRef } from '../media-refs'

const ID = '3a4985e1-f895-419c-8025-9d8bd9ad5095'
const GONE = '00000000-0000-4000-8000-000000000000'
const URLS = new Map([[ID, 'https://blob.example/media/crown.svg']])

describe('media references', () => {
  it('round-trips an id, and ignores anything that is not exactly a reference', () => {
    expect(mediaRefId(toMediaRef(ID))).toBe(ID)
    expect(mediaRefId(`media:${ID}?v=2`)).toBeNull()
    expect(mediaRefId('https://blob.example/media/crown.svg')).toBeNull()
    expect(mediaRefId('/assets/illustrations/omnigrid.svg')).toBeNull()
    expect(mediaRefId(42)).toBeNull()
  })

  it('shows a reference through the admin redirect and a path as itself', () => {
    expect(mediaDisplaySrc(toMediaRef(ID))).toBe(`/api/admin/media/${ID}/file`)
    expect(mediaDisplaySrc('/assets/img/me.jpg')).toBe('/assets/img/me.jpg')
  })

  it('resolves references wherever they sit, and leaves every other value alone', () => {
    const content = {
      title: 'Impact',
      badges: [{ image: toMediaRef(ID), rarity: 'rare' }, { image: '/assets/legacy.svg', rarity: 'epic' }],
      count: 3,
    }
    expect(resolveMediaRefs(content, URLS)).toEqual({
      value: {
        title: 'Impact',
        badges: [
          { image: 'https://blob.example/media/crown.svg', rarity: 'rare' },
          { image: '/assets/legacy.svg', rarity: 'epic' },
        ],
        count: 3,
      },
      missing: [],
    })
  })

  it('reports a reference to a file that is gone, with the path to it', () => {
    const { missing } = resolveMediaRefs({ tiles: [{}, { image: toMediaRef(GONE) }] }, URLS)
    expect(missing).toEqual([{ path: 'tiles.1.image', id: GONE }])
  })
})
