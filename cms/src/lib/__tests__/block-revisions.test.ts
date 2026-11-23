import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/** A section's earlier texts, written by the real save route on a real Postgres. */
const pg = vi.hoisted(() => ({ db: null as PGlite | null }))
const requireUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => {
  const query = async (sql: string, params?: unknown[]) => (await pg.db!.query(sql, params)).rows
  return { query, queryOne: async (sql: string, params?: unknown[]) => (await query(sql, params))[0] }
})
vi.mock('@/lib/auth', () => ({ requireUser, clientIp: () => '127.0.0.1' }))

const MIGRATIONS = join(process.cwd(), '..', 'db', 'migrations')
const SNAPSHOT = JSON.parse(readFileSync(join(process.cwd(), '..', 'src', 'content', 'snapshot.en.json'), 'utf8'))
const HERO = SNAPSHOT.pages.find((page: { slug: string }) => page.slug === 'home').blocks[0].content

const { PATCH: save } = await import('@/app/api/admin/blocks/[id]/route')
const { GET: revisions } = await import('@/app/api/admin/blocks/[id]/revisions/route')

const sql = async <T = Record<string, unknown>>(text: string, params?: unknown[]) =>
  (await pg.db!.query<T>(text, params)).rows
const at = (id: string) => ({ params: Promise.resolve({ id }) })
const list = async (id: string, query: string) => {
  const response = await revisions(new Request(`https://cms.test/api/admin/blocks/${id}/revisions${query}`), at(id))
  return { status: response.status, body: await response.json() }
}

let heroId: string

beforeAll(async () => {
  pg.db = new PGlite()
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await pg.db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'))
  }
  const [owner] = await sql<{ id: string }>(
    `insert into admin_users (email, password_hash) values ('owner@test', 'x') returning id`,
  )
  requireUser.mockResolvedValue({ user: { id: owner!.id } })
  const [page] = await sql<{ id: string }>(`insert into pages (slug, status) values ('home', 'published') returning id`)
  const [block] = await sql<{ id: string }>(
    `insert into blocks (page_id, type, position) values ($1, 'hero', 1000) returning id`,
    [page!.id],
  )
  heroId = block!.id
  await sql(`insert into block_translations (block_id, locale, content, status) values ($1, 'en', $2, 'ready')`, [
    heroId,
    JSON.stringify({ ...HERO, sub: 'First.' }),
  ])

  for (const [version, sub] of [[1, 'Second.'], [2, 'Third.']] as const) {
    const response = await save(
      new Request(`https://cms.test/api/admin/blocks/${heroId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, translations: [{ locale: 'en', content: { ...HERO, sub } }] }),
      }),
      at(heroId),
    )
    expect(response.status).toBe(200)
  }
})

afterAll(async () => {
  await pg.db?.close()
})

describe('GET blocks/:id/revisions', () => {
  it('lists the texts each save replaced, newest first, with who replaced them', async () => {
    const { status, body } = await list(heroId, '?locale=en')
    expect(status).toBe(200)
    expect(body.data.revisions.map((r: { content: { sub: string } }) => r.content.sub)).toEqual(['Second.', 'First.'])
    expect(body.data.revisions[0]).toMatchObject({ replacedBy: 'owner@test' })
  })

  it('keeps languages apart', async () => {
    expect((await list(heroId, '?locale=ru')).body.data.revisions).toEqual([])
  })

  it('asks which language', async () => {
    expect((await list(heroId, '')).status).toBe(422)
    expect((await list(heroId, '?locale=de')).status).toBe(422)
  })

  it('answers a section that does not exist with 404', async () => {
    expect((await list('00000000-0000-4000-8000-000000000000', '?locale=en')).status).toBe(404)
  })

  it('refuses anyone who is not signed in', async () => {
    const refused = new Response(null, { status: 401 })
    requireUser.mockResolvedValueOnce({ response: refused })
    expect(await revisions(new Request('https://cms.test/x?locale=en'), at(heroId))).toBe(refused)
  })
})
