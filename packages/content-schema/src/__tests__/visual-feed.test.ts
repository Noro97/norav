import { describe, expect, it } from 'vitest'
import { getBlockDefinition, validateBlockContent } from '../blocks'

describe('the visual feed', () => {
  const definition = getBlockDefinition('kit_visual_feed')!

  it('still validates the feed it arrived with — a picture and a caption are optional', () => {
    expect(validateBlockContent('kit_visual_feed', definition.defaults.content).ok).toBe(true)
  })

  it('takes a picture and a caption per tile', () => {
    const content = definition.defaults.content as { tiles: unknown[] }
    const result = validateBlockContent('kit_visual_feed', {
      ...content,
      tiles: [{ color: '#011c3d', likes: '', age: '', image: '/assets/illustrations/omnigrid-grid.svg', caption: 'OmniGrid' }],
    })
    expect(result.ok).toBe(true)
    expect((result as { data: { tiles: { image: string }[] } }).data.tiles[0]?.image).toBe('/assets/illustrations/omnigrid-grid.svg')
  })
})
