import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/** A page's own link-preview image, from the settings dialog's save to the published snapshot. */
const pg = vi.hoisted(() => ({ db: null as PGlite | null }))
const requireUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => {
  const query = async (sql: string, params?: unknown[]) => (await pg.db!.query(sql, params)).rows
  return { query, queryOne: async (sql: string, params?: unknown[]) => (await query(sql, params))[0] }
})
vi.mock('@/lib/auth', () => ({ requireUser, clientIp: () => '127.0.0.1' }))

const MIGRATIONS = join(process.cwd(), '..', 'db', 'migrations')
const { PATCH } = await import('@/app/api/admin/pages/[...slug]/route')
const { buildPublication } = await import('../publish')

const sql = async <T = Record<string, unknown>>(text: string, params?: unknown[]) =>
  (await pg.db!.query<T>(text, params)).rows

const saveSeo = async (en: Record<string, string>) => {
  const response = await PATCH(
    new Request('https://cms.test/api/admin/pages/work', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seo: { en: { title: 'Work', ...en } } }),
    }),
    { params: Promise.resolve({ slug: ['work'] }) },
  )
  return { status: response.status, body: await response.json() }
}

const file = async (mime: string, name: string) =>
  (
    await sql<{ id: string }>(
      `insert into media (storage_key, url, mime) values ($1, $2, $3) returning id`,
      [name, `https://store.test/${name}`, mime],
    )
  )[0]!.id

beforeAll(async () => {
  pg.db = new PGlite()
  for (const migration of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await pg.db.exec(readFileSync(join(MIGRATIONS, migration), 'utf8'))
  }
  const [owner] = await sql<{ id: string }>(`insert into admin_users (email, password_hash) values ('o@test', 'x') returning id`)
  requireUser.mockResolvedValue({ user: { id: owner!.id } })
  await sql(`insert into pages (slug, status) values ('work', 'published') on conflict (slug) do nothing`)
})

afterAll(async () => {
  await pg.db?.close()
})

describe('a page’s share image', () => {
  it('takes a path in the site, an https address or a library file', async () => {
    expect((await saveSeo({ ogImage: '/og/work.png' })).status).toBe(200)
    expect((await saveSeo({ ogImage: 'https://store.test/card.jpg?v=2' })).status).toBe(200)
    expect((await saveSeo({ ogImage: 'https://norav.dev' })).status).toBe(200)
    expect((await saveSeo({ ogImage: `media:${await file('image/png', 'card.png')}` })).status).toBe(200)
  })

  it('refuses what link previews drop, before anything is saved', async () => {
    for (const ogImage of ['/og/work.svg', 'https://store.test/card.webp', 'og/work.png', 'http://store.test/a.png']) {
      const { status, body } = await saveSeo({ ogImage })
      expect(status, ogImage).toBe(422)
      expect(body.error.fields[0].path).toBe('seo.en.ogImage')
    }
    const svg = await file('image/svg+xml', 'logo.svg')
    expect((await saveSeo({ ogImage: `media:${svg}` })).status).toBe(422)
    expect((await saveSeo({ ogImage: 'media:00000000-0000-4000-8000-000000000000' })).status).toBe(422)
  })

  it('publishes as the file’s URL, with its alt text', async () => {
    const id = await file('image/jpeg', 'work-card.jpg')
    expect((await saveSeo({ ogImage: `media:${id}`, ogImageAlt: 'The work index' })).status).toBe(200)

    const built = await buildPublication()
    if (!built.ok) throw new Error(JSON.stringify(built.problems))
    const work = built.payload.locales.en.pages.find((page) => page.slug === 'work')
    expect(work?.seo).toMatchObject({
      en: { ogImage: 'https://store.test/work-card.jpg', ogImageAlt: 'The work index' },
    })
  })

  it('refuses to publish when the file has left the library since', async () => {
    await sql(`update media set deleted_at = now() where storage_key = 'work-card.jpg'`)
    const built = await buildPublication()
    expect(built.ok).toBe(false)
    if (!built.ok) {
      expect(built.problems).toContainEqual(
        expect.objectContaining({ page: 'work', block: '(search listing)', path: 'en.ogImage' }),
      )
    }
  })
})
