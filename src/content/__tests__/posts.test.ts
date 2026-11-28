import { describe, expect, it } from 'vitest'
import type { Snapshot } from '@norav/content-schema'
import { postAt, postSeo, postsOf, type Post } from '../posts'

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

const post: Post = {
  slug: 'baked-content',
  title: 'Why this site bakes its content into the build',
  excerpt: 'What that bought, and what it costs.',
  bodyHtml: '<p>Text.</p>',
  cover: '',
  tags: [],
  publishedAt: '2026-11-28T12:00:00.000Z',
  readingMinutes: 5,
  seo: {},
  lang: 'en',
}

describe('postSeo', () => {
  it('gives a post with no cover a drawn card, with the post title on it', () => {
    expect(postSeo(post, 'Norayr Avetisyan', 'https://norav.dev')).toEqual({
      title: 'Why this site bakes its content into the build — Norayr Avetisyan',
      description: 'What that bought, and what it costs.',
      image: 'https://norav.dev/og/writing/baked-content.png',
      imageAlt: 'Why this site bakes its content into the build',
      card: '/og/writing/baked-content.png',
      cardTitle: 'Why this site bakes its content into the build',
    })
  })

  it('uses a cover when there is one, and draws nothing', () => {
    const seo = postSeo({ ...post, cover: '/assets/cover.webp' }, 'Norayr Avetisyan', 'https://norav.dev')
    expect(seo.image).toBe('https://norav.dev/assets/cover.webp')
    expect(seo.card).toBeUndefined()
  })

  it('prefers what the post says about itself', () => {
    const seo = postSeo({ ...post, seo: { title: 'Own title', description: 'Own description' } }, 'N', 'https://norav.dev')
    expect(seo.title).toBe('Own title')
    expect(seo.description).toBe('Own description')
  })
})
