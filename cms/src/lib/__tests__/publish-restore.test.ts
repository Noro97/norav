import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * Restore, through the real routes, on a real Postgres: every migration applied
 * to an in-memory PGlite, and `lib/db` answering from it. Only the session is
 * faked.
 */
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

const { GET: list } = await import('@/app/api/admin/publications/route')
const { GET: preview } = await import('@/app/api/admin/publications/[version]/route')
const { POST: restore } = await import('@/app/api/admin/publications/[version]/restore/route')
const { POST: publish } = await import('@/app/api/admin/publish/route')
const { checkRestorable, summarizeChanges } = await import('../publish-restore')

const sql = async <T = Record<string, unknown>>(text: string, params?: unknown[]) =>
  (await pg.db!.query<T>(text, params)).rows

const post = (path: string, body: unknown) =>
  new Request(`https://cms.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
const params = (version: number | string) => ({ params: Promise.resolve({ version: String(version) }) })
const read = async (response: Response) => ({ status: response.status, body: await response.json() })

const doPublish = async (body: Record<string, unknown> = {}) => read(await publish(post('/api/admin/publish', body)))
const doRestore = async (version: number, body: Record<string, unknown>) =>
  read(await restore(post(`/api/admin/publications/${version}/restore`, body), params(version)))
const doPreview = async (version: number) =>
  read(await preview(new Request(`https://cms.test/api/admin/publications/${version}`), params(version)))
const doList = async () => read(await list(new Request('https://cms.test/api/admin/publications')))

const setSub = (blockId: string, sub: string) =>
  sql(`update block_translations set content = $2 where block_id = $1 and locale = 'en'`, [
    blockId,
    JSON.stringify({ ...HERO, sub }),
  ])

const rows = async () =>
  sql<{ version: number; checksum: string; restored_from: number | null; payload: string }>(
    `select version::int, checksum, restored_from::int, payload::text from publications order by version`,
  )

let heroId: string

beforeAll(async () => {
  vi.stubEnv('SITE_DEPLOY_HOOK_URL', '')
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
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 1000, 'hero') returning id`,
    [page!.id],
  )
  heroId = block!.id
  await sql(`insert into block_translations (block_id, locale, content, status) values ($1, 'en', '{}', 'ready')`, [
    heroId,
  ])
  await setSub(heroId, 'The first sentence.')
  expect((await doPublish()).status).toBe(200)
  await setSub(heroId, 'A sentence that went out by mistake.')
  expect((await doPublish()).status).toBe(200)
})

afterAll(async () => {
  vi.unstubAllEnvs()
  await pg.db?.close()
})

describe('publication history', () => {
  it('refuses anyone who is not signed in', async () => {
    const refused = new Response(null, { status: 401 })
    requireUser.mockResolvedValueOnce({ response: refused })
    expect(await list(new Request('https://cms.test/api/admin/publications'))).toBe(refused)
  })

  it('lists every version, newest first, and says the drafts match the live one', async () => {
    const { body } = await doList()
    expect(body.data.drafts).toBe('match')
    expect(body.data.publications.map((p: { version: number }) => p.version)).toEqual([2, 1])
    expect(body.data.publications[0]).toMatchObject({ author: 'owner@test', restoredFrom: null })
  })
})

describe('restoring a version', () => {
  it('shows what would change, field by field, before anything happens', async () => {
    const { status, body } = await doPreview(1)
    expect(status).toBe(200)
    expect(body.data).toMatchObject({ version: 1, live: 2, unchanged: false, problems: [] })
    expect(body.data.areas).toEqual([
      expect.objectContaining({
        label: '/',
        kind: 'changed',
        sample: [{ path: 'hero · content.sub', before: 'A sentence that went out by mistake.', after: 'The first sentence.' }],
      }),
    ])
    expect(await rows()).toHaveLength(2)
  })

  it('does nothing if something was published since the confirmation was shown', async () => {
    const { status } = await doRestore(1, { live: 1 })
    expect(status).toBe(409)
    expect(await rows()).toHaveLength(2)
  })

  it('publishes the old content as a new version, and rewrites nothing', async () => {
    const before = await rows()
    const { status, body } = await doRestore(1, { live: 2 })
    expect(status).toBe(200)
    expect(body.data).toMatchObject({ ok: true, unchanged: false, version: 3, restoredFrom: 1, rebuild: 'not_configured' })

    const after = await rows()
    expect(after.slice(0, 2)).toEqual(before)
    const copy = after[2]!
    expect(copy).toMatchObject({ version: 3, restored_from: 1, checksum: before[0]!.checksum })
    const payload = JSON.parse(copy.payload)
    expect(payload.locales.en.version).toBe(3)
    expect(payload.locales.en.checksum).toBe(before[0]!.checksum)
    for (const locale of ['en', 'ru']) {
      const home = payload.locales[locale].pages.find((page: { slug: string }) => page.slug === 'home')
      expect(home.blocks[0].content.sub).toBe('The first sentence.')
    }
  })

  it('records the restore in the audit log, with what it replaced', async () => {
    const [entry] = await sql<{ diff: Record<string, unknown> }>(
      `select diff from audit_log where action = 'publication.restore'`,
    )
    expect(entry?.diff).toMatchObject({ version: 3, restoredFrom: 1, replaced: 2 })
  })

  it('serves the restore as the live version', async () => {
    const { body } = await doList()
    expect(body.data.publications[0]).toMatchObject({ version: 3, restoredFrom: 1, note: 'Restored version 1' })
    expect(body.data.drafts).toBe('differ')
  })
})

describe('publishing after a restore', () => {
  it('asks first, because the drafts still hold what the restore took off the site', async () => {
    const { status, body } = await doPublish()
    expect(status).toBe(409)
    expect(body.error.code).toBe('restore_live')
    expect(body.error.message).toContain('version 3, a restore of version 1')
    expect(await rows()).toHaveLength(3)
  })

  it('publishes the drafts once told to', async () => {
    const { status, body } = await doPublish({ replaceRestore: true })
    expect(status).toBe(200)
    expect(body.data.version).toBe(4)
    // An ordinary publish again, so the next one doesn't ask.
    expect((await doPublish()).body.data).toMatchObject({ unchanged: true, version: 4 })
  })

  it('makes no new version when the content restored is what the site shows', async () => {
    const { body } = await doRestore(2, { live: 4 })
    expect(body.data).toMatchObject({ unchanged: true, version: 4 })
    expect(await rows()).toHaveLength(4)
  })
})

describe('what a restore refuses', () => {
  it('refuses a version holding a block type that no longer exists, and writes nothing', async () => {
    const [latest] = await sql<{ payload: { locales: Record<string, { pages: { slug: string; blocks: unknown[] }[] }> } }>(
      `select payload from publications where version = 4`,
    )
    const payload = latest!.payload
    for (const doc of Object.values(payload.locales)) {
      doc.pages
        .find((page) => page.slug === 'home')!
        .blocks.push({ id: 'gone', type: 'bento_grid', anchorId: null, content: {}, settings: {} })
    }
    await sql(`insert into publications (payload, locales, checksum) values ($1, array['en','ru'], 'old')`, [
      JSON.stringify(payload),
    ])
    expect((await doPublish()).status).toBe(200)

    const { body: plan } = await doPreview(5)
    expect(plan.data.problems).toContainEqual({
      path: 'home/bento_grid/en/type',
      message: '"bento_grid" is no longer a block type, so this page would not render.',
    })
    const count = (await rows()).length
    const { status } = await doRestore(5, { live: 6 })
    expect(status).toBe(422)
    expect(await rows()).toHaveLength(count)
  })

  it('answers a version that does not exist with 404', async () => {
    expect((await doPreview(999)).status).toBe(404)
    expect((await doRestore(999, { live: 6 })).status).toBe(404)
  })

  it('refuses a publication with no copy in one of the languages', async () => {
    const { problems } = await checkRestorable({ locales: { en: { ...SNAPSHOT } } })
    expect(problems).toContainEqual(expect.objectContaining({ path: 'ru', message: 'Has no RU copy.' }))
  })

  it('refuses a publication with no profile, which the page head reads', async () => {
    const settings = { ...SNAPSHOT.settings, profile: undefined }
    const { problems } = await checkRestorable({
      locales: { en: { ...SNAPSHOT, settings }, ru: { ...SNAPSHOT, locale: 'ru', settings } },
    })
    expect(problems).toContainEqual(expect.objectContaining({ block: 'profile' }))
  })

  it('refuses a publication showing a file that was swept from storage, even inside a post', async () => {
    const url = 'https://store.test/media/swept.png'
    await sql(
      `insert into media (storage_key, url, mime, size_bytes, deleted_at, purged_at)
       values ('media/swept.png', $1, 'image/png', 10, now(), now())`,
      [url],
    )
    const withPost = {
      ...SNAPSHOT,
      collections: { ...SNAPSHOT.collections, posts: [{ id: 'p', slug: 'p', data: { bodyHtml: `<img src="${url}">` } }] },
    }
    const { problems } = await checkRestorable({ locales: { en: withPost, ru: { ...withPost, locale: 'ru' } } })
    expect(problems).toContainEqual(expect.objectContaining({ block: url, message: expect.stringContaining('deleted') }))
  })

  it("passes the content that's live today, so today can always be restored", async () => {
    const { problems, payload } = await checkRestorable({
      locales: { en: SNAPSHOT, ru: { ...SNAPSHOT, locale: 'ru' } },
    })
    expect(problems).toEqual([])
    expect(payload?.locales.en.pages.length).toBe(SNAPSHOT.pages.length)
  })
})

describe('the summary of changes', () => {
  const doc = (pages: { slug: string; blocks: unknown[] }[]) => ({
    locales: {
      en: { ...SNAPSHOT, pages: pages.map((page) => ({ seo: {}, ...page })) },
      ru: { ...SNAPSHOT, locale: 'ru', pages: pages.map((page) => ({ seo: {}, ...page })) },
    },
  })

  it('names a page added or removed by its address, not by its index', () => {
    const before = doc([{ slug: 'about', blocks: [] }, { slug: 'work', blocks: [] }])
    const after = doc([{ slug: 'about', blocks: [] }, { slug: 'contact', blocks: [] }, { slug: 'work', blocks: [] }])
    expect(summarizeChanges(before, after)).toEqual([
      { label: '/contact', kind: 'added', count: 2, sample: [{ path: '(all of it)', before: null, after: expect.any(String) }] },
    ])
    expect(summarizeChanges(after, before)).toEqual([expect.objectContaining({ label: '/contact', kind: 'removed' })])
  })
})
