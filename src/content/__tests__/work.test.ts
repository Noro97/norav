import { describe, expect, it } from 'vitest'
import type { Snapshot } from '@norav/content-schema'
import { workCards } from '../work'

const page = (slug: string, content: Record<string, unknown> | null) => ({
  slug,
  seo: {},
  blocks: content ? [{ id: slug, type: 'logistics', anchorId: null, content, settings: {} }] : [],
})

const snapshot = {
  pages: [
    page('demos/nexusroute', {
      title: 'NexusRoute',
      description: 'A logistics map.',
      techStack: [{ name: 'Leaflet' }, { name: 'GeoJSON' }],
    }),
    page('demos/empty', null),
    page('demos/untitled', { title: '  ', description: 'No name.' }),
  ],
} as unknown as Snapshot

describe('workCards', () => {
  it('reads a card from the first section of the page it opens', () => {
    expect(workCards(snapshot, ['demos/nexusroute'])).toEqual([
      { page: 'demos/nexusroute', title: 'NexusRoute', description: 'A logistics map.', stack: ['Leaflet', 'GeoJSON'] },
    ])
  })

  it('leaves out a page that is not published, is empty, or has no title', () => {
    const cards = workCards(snapshot, ['work/nova-prism', 'demos/empty', 'demos/untitled', 'demos/nexusroute'])
    expect(cards.map((card) => card.page)).toEqual(['demos/nexusroute'])
  })

  it('keeps the order the list gives', () => {
    const two = { pages: [...snapshot.pages, page('demos/omnigrid', { title: 'OmniGrid' })] } as unknown as Snapshot
    expect(workCards(two, ['demos/omnigrid', 'demos/nexusroute']).map((card) => card.title)).toEqual([
      'OmniGrid',
      'NexusRoute',
    ])
  })
})
