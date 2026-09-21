import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { pullContent, type Queryable } from '../pull-content'

/**
 * Two ephemeral databases — one playing production, one playing the laptop —
 * so the copy can be watched end to end without a Neon connection string.
 */
const MIGRATIONS = join(process.cwd(), '..', 'db', 'migrations')

async function migrated(): Promise<{ db: PGlite; q: Queryable }> {
  const db = new PGlite()
  await db.exec(`create table if not exists schema_migrations (
    version text primary key, applied_at timestamptz not null default now())`)
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'))
    await db.query('insert into schema_migrations (version) values ($1)', [file])
  }
  const q: Queryable = {
    async query(sql, params) {
      const result = await db.query(sql, params)
      return result.rows as never[]
    },
  }
  return { db, q }
}

async function count(q: Queryable, table: string): Promise<number> {
  const [row] = await q.query<{ n: string }>(`select count(*)::text as n from ${table}`)
  return Number(row!.n)
}

let source: PGlite
let target: PGlite
let live: Queryable
let local: Queryable
let liveAuthor: string

beforeAll(async () => {
  ;({ db: source, q: live } = await migrated())
  ;({ db: target, q: local } = await migrated())

  // Production: one editor, one page with a block in two languages, the
  // history that produced it, and two publications.
  const [author] = await live.query<{ id: string }>(
    `insert into admin_users (email, password_hash) values ('editor@live', 'argon2$secret') returning id`,
  )
  liveAuthor = author!.id
  const [page] = await live.query<{ id: string }>(
    `insert into pages (slug, status) values ('home', 'published') returning id`,
  )
  const [block] = await live.query<{ id: string }>(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 1, 'hero') returning id`,
    [page!.id],
  )
  await live.query(
    `insert into block_translations (block_id, locale, content, status) values
       ($1, 'en', '{"title":"Hello"}', 'ready'), ($1, 'ru', '{"title":"Привет"}', 'ready')`,
    [block!.id],
  )
  await live.query(`insert into settings (key, value) values ('theme', '{"accent":"#B51A2B"}')`)
  // A jsonb *array* alongside the jsonb objects: the one shape a driver can
  // confuse with a Postgres array on the way back in.
  await live.query(
    `insert into media (storage_key, url, mime, alt, variants) values
       ('cv.pdf', 'https://blob.example/cv.pdf', 'application/pdf', '{"en":"CV"}', '[{"w":320}]')`,
  )
  await live.query(
    `insert into revisions (entity_type, entity_id, locale, data, author_id) values ('block', $1, 'en', '{"title":"Hello"}', $2)`,
    [block!.id, liveAuthor],
  )
  await live.query(
    `insert into publications (payload, locales, checksum, author_id) values
       ('{"v":1}', '{en,ru}', 'aaa', $1), ('{"v":2}', '{en,ru}', 'bbb', $1)`,
    [liveAuthor],
  )
  await live.query(
    `insert into audit_log (actor_id, action, entity_type, entity_id) values
       ($1, 'block.update', 'block', $2), ($1, 'publish', null, null)`,
    [liveAuthor, block!.id],
  )
  await live.query(
    `insert into audit_log (actor_id, action, ip) values (null, 'auth.login.failed', '203.0.113.7')`,
  )

  // The laptop: its own login, and content of its own that has drifted.
  await local.query(
    `insert into admin_users (email, password_hash) values ('me@laptop', 'argon2$mine')`,
  )
  const [stale] = await local.query<{ id: string }>(
    `insert into pages (slug, status) values ('experiments', 'draft') returning id`,
  )
  await local.query(
    `insert into blocks (page_id, type, position) values ($1, 'hero', 1)`,
    [stale!.id],
  )
  for (let i = 0; i < 5; i++) {
    await local.query(
      `insert into publications (payload, locales, checksum) values ('{}', '{en}', 'local-${i}')`,
    )
  }
})

afterAll(async () => {
  await source.close()
  await target.close()
})

describe('pullContent', () => {
  it('refuses when the two databases are not on the same migration', async () => {
    await local.query(`insert into schema_migrations (version) values ('9999_from_the_future.sql')`)
    await expect(pullContent(live, local)).rejects.toThrow(/migration/i)
    await local.query(`delete from schema_migrations where version = '9999_from_the_future.sql'`)
  })

  it('replaces the local content with what is live', async () => {
    // The migrations seed pages, entries and a block of their own, so the
    // right number is whatever production has — not a number written here.
    const before = await count(live, 'pages')
    const report = await pullContent(live, local)

    const slugs = async (q: Queryable) =>
      (await q.query<{ slug: string }>('select slug from pages order by slug')).map((r) => r.slug)
    expect(await slugs(local)).toEqual(await slugs(live))
    expect(await slugs(local)).toContain('home')
    expect(await slugs(local)).not.toContain('experiments')

    for (const table of ['blocks', 'block_translations', 'entries', 'entry_translations', 'settings', 'media', 'revisions', 'publications'] as const) {
      expect(await count(local, table), table).toBe(await count(live, table))
    }
    expect(await count(local, 'block_translations')).toBe(2)
    expect(await count(local, 'publications')).toBe(2)

    expect(report.pages).toBe(before)
    expect(report.publications).toBe(2)
  })

  it('carries jsonb values across whatever their shape', async () => {
    const [media] = await local.query<{ alt: unknown; variants: unknown }>('select alt, variants from media')
    expect(media!.alt).toEqual({ en: 'CV' })
    expect(media!.variants).toEqual([{ w: 320 }])
    const [pub] = await local.query<{ locales: unknown }>('select locales from publications order by version limit 1')
    expect(pub!.locales).toEqual(['en', 'ru'])
  })

  it('leaves the laptop login alone and copies none of production\'s', async () => {
    const users = await local.query<{ email: string }>('select email from admin_users')
    expect(users.map((u) => u.email)).toEqual(['me@laptop'])
  })

  it('drops the attribution rather than the rows it hangs on', async () => {
    const [rev] = await local.query<{ author_id: string | null }>('select author_id from revisions')
    expect(rev!.author_id).toBeNull()
    const pubs = await local.query<{ author_id: string | null }>('select author_id from publications')
    expect(pubs.every((p) => p.author_id === null)).toBe(true)
  })

  it('brings the content audit trail and not the sign-in attempts', async () => {
    const rows = await local.query<{ action: string }>('select action from audit_log order by id')
    expect(rows.map((r) => r.action)).toEqual(['block.update', 'publish'])
  })

  it('keeps the publication numbering continuous after the copy', async () => {
    // The five local publications went up to 5; production's two were 1 and
    // 2. The next local publish must be 3, not a collision with 1 and not a
    // jump to 6 that the site would mistake for something newer than live.
    const [next] = await local.query<{ version: string }>(
      `insert into publications (payload, locales, checksum) values ('{}', '{en}', 'after') returning version::text`,
    )
    expect(next!.version).toBe('3')
    await local.query(`delete from publications where checksum = 'after'`)
  })

  it('is idempotent — a second pull is a no-op', async () => {
    await pullContent(live, local)
    expect(await count(local, 'pages')).toBe(await count(live, 'pages'))
    expect(await count(local, 'publications')).toBe(2)
    expect(await count(local, 'admin_users')).toBe(1)
  })
})
