import { describe, expect, it } from 'vitest'
import type { Snapshot } from '@norav/content-schema'
import { postAt, postsOf } from '../posts'

const snapshot = {
  version: 1,
  publishedAt: '2026-10-02T08:00:00.000Z',
  checksum: '',
  locale: 'ru',
  settings: {},
  pages: [],
  collections: {
    posts: [
      {
        id: '1',
        slug: 'content-pipelines',
        data: { title: 'Content pipelines', bodyHtml: '<p>Hi</p>', lang: 'en', tags: [], readingMinutes: 1 },
      },
    ],
  },
} as unknown as Snapshot

describe('posts', () => {
  it('reads the collection the publish step writes', () => {
    expect(postsOf(snapshot).map((post) => [post.slug, post.title, post.lang])).toEqual([
      ['content-pipelines', 'Content pipelines', 'en'],
    ])
  })

  it('answers /writing/<slug> and nothing else', () => {
    expect(postAt(snapshot, 'writing/content-pipelines')?.title).toBe('Content pipelines')
    expect(postAt(snapshot, 'writing')).toBeUndefined()
    expect(postAt(snapshot, 'writing/missing')).toBeUndefined()
    expect(postAt(snapshot, 'writing/content-pipelines/extra')).toBeUndefined()
    expect(postAt(snapshot, 'work/content-pipelines')).toBeUndefined()
  })

  it('treats a snapshot published before posts existed as having none', () => {
    expect(postsOf({ ...snapshot, collections: {} } as Snapshot)).toEqual([])
  })
})
