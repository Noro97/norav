import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OmniGridWidget } from '../OmniGridWidget'

const useShipments = vi.hoisted(() => vi.fn())
vi.mock('../useShipments', () => ({ useShipments }))

vi.mock('@/content/ContentProvider', () => ({
  useBlock: () => ({
    content: { sectionLabel: '', title: 'OmniGrid', description: '', techStack: [], screenshots: [] },
    settings: { galleryStyle: 'grid' },
    anchorId: null,
  }),
}))
vi.mock('@/content/case-studies', () => ({ withoutNumber: () => '' }))

describe('OmniGridWidget', () => {
  afterEach(() => vi.restoreAllMocks())

  it('settles while the query has no data', () => {
    useShipments.mockReturnValue({ data: undefined, cacheStatus: 'FETCHING', dataUpdatedAt: 0 })
    // The render-time effect stops looping if two measurements round to the
    // same value. Making every one differ means the test can't pass by luck.
    let now = 0
    let step = 0
    vi.spyOn(performance, 'now').mockImplementation(() => (now += ++step))

    render(<OmniGridWidget />)

    expect(screen.getByText('0 rows')).toBeInTheDocument()
    // One call per render: the first, then one more to show the measured time.
    expect(useShipments).toHaveBeenCalledTimes(2)
  })
})
