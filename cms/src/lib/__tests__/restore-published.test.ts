import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { getBlockDefinition, validateBlockContent } from '@norav/content-schema'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Queryable } from '../pull-content'
import { differences, planRestore } from '../restore-published'
import type { PublicationPayload } from '../publish'

/**
 * A database shaped like production right after its pending migrations: one
 * publication, and drafts the migrations have moved away from it.
 */
const MIGRATIONS = join(process.cwd(), '..', 'db', 'migrations')
const FILE = 'https://blob.example/photo.png'

let db: PGlite
let q: Queryable
let heroId: string
let terminalId: string
let oldStripId: string

function valid(type: string, overrides: Record<string, unknown> = {}) {
  const defaults = getBlockDefinition(type)!.defaults.content as Record<string, unknown>
  const checked = validateBlockContent(type, { ...defaults, ...overrides })
  if (!checked.ok) throw new Error(`${type}: ${JSON.stringify(checked.issues)}`)
  return checked.data as Record<string, unknown>
}

async function insertBlock(pageId: string, type: string, position: number, anchor: string | null, content: unknown) {
  const [row] = await q.query<{ id: string }>(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, $2, $3, $4) returning id`,
    [pageId, type, position, anchor],
  )
  await q.query(
    `insert into block_translations (block_id, locale, content, status) values ($1, 'en', $2, 'ready')`,
    [row!.id, JSON.stringify(content)],
  )
  return row!.id
}

async function apply() {
  const plan = await planRestore(q)
  for (const write of plan.writes) await q.query(write.sql, write.params)
  return plan
}

const published = async () => {
  const [row] = await q.query<{ payload: PublicationPayload }>(
    `select payload from publications order by publications.version desc limit 1`,
  )
  return row!.payload.locales.en
}

const draftOf = async (id: string) => {
  const [row] = await q.query<{ content: Record<string, unknown> }>(
    `select content from block_translations where block_id = $1 and locale = 'en'`,
    [id],
  )
  return row!.content
}

const blockRow = async (id: string) => {
  const [row] = await q.query<{ is_visible: boolean; page_id: string }>(
    `select is_visible, page_id from blocks where id = $1`,
    [id],
  )
  return row!
}

beforeEach(async () => {
  db = new PGlite()
  await db.exec(`create table if not exists schema_migrations (
    version text primary key, applied_at timestamptz not null default now())`)
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS, file), 'utf8'))
  }
  q = {
    async query(sql, params) {
      const result = await db.query(sql, params)
      return result.rows as never[]
    },
  }

  // The migrations seed a few rows of their own. This test sets the scene itself.
  await q.query(`truncate pages, entries cascade`)

  const page = async (slug: string, status: string) => {
    const [row] = await q.query<{ id: string }>(
      `insert into pages (slug, status, seo) values ($1, $2, '{"en":{"title":"Kept"}}') returning id`,
      [slug, status],
    )
    return row!.id
  }
  const home = await page('home', 'published')
  await page('site', 'published')
  const contact = await page('contact', 'published')
  const automation = await page('automation', 'draft')

  await q.query(`insert into media (storage_key, url, mime) values ('photo', $1, 'image/png')`, [FILE])

  const heroPublished = valid('hero', { subtitle: 'Senior Fullstack Engineer' })
  const terminalPublished = valid('terminal_footer')
  const aboutPublished = valid('about', { role: 'Published role' })

  // What the migrations did to the drafts: new copy over the hero, the terminal
  // moved to its own page, a section nobody has reviewed, a menu item, and a file
  // reference the publication holds as a URL.
  heroId = await insertBlock(home, 'hero', 1000, 'hero', valid('hero', { subtitle: 'Senior or staff engineer' }))
  terminalId = await insertBlock(contact, 'terminal_footer', 2000, 'terminal', terminalPublished)
  oldStripId = await insertBlock(home, 'recruiter_cta', 500, 'hire', valid('recruiter_cta'))
  await insertBlock(automation, 'workflow', 1000, null, valid('workflow'))
  await insertBlock(home, 'about', 2000, 'about', aboutPublished)

  const [contactEntry] = await q.query<{ id: string }>(
    `insert into entries (collection, slug, position, data)
     values ('navigation', 'contact', 1, '{"page":"contact","external":""}') returning id`,
  )
  await q.query(
    `insert into entry_translations (entry_id, locale, data, status) values ($1, 'en', '{"label":"Contact"}', 'ready')`,
    [contactEntry!.id],
  )
  await q.query(
    `insert into entries (collection, slug, position, data)
     values ('navigation', 'writing', 2, '{"page":"writing","external":""}')`,
  )

  const snapshot = {
    version: 26,
    publishedAt: '2026-11-06T09:04:07.445Z',
    checksum: 'c',
    locale: 'en',
    settings: { site: { grain: true } },
    pages: [
      {
        slug: 'home',
        seo: { en: { title: 'Kept' } },
        blocks: [
          { id: heroId, type: 'hero', anchorId: 'hero', content: heroPublished, settings: {} },
          { id: (await idOf('about')), type: 'about', anchorId: 'about', content: aboutPublished, settings: {} },
        ],
      },
      {
        slug: 'site',
        seo: { en: { title: 'Kept' } },
        blocks: [{ id: terminalId, type: 'terminal_footer', anchorId: 'terminal', content: terminalPublished, settings: {} }],
      },
    ],
    collections: {
      navigation: [
        {
          id: contactEntry!.id,
          slug: 'contact',
          data: { page: 'site', anchor: 'terminal', external: '', label: 'Contact' },
        },
      ],
      posts: [],
    },
  }
  await q.query(
    `insert into publications (payload, locales, checksum) values ($1, '{en}', 'c')`,
    [JSON.stringify({ locales: { en: snapshot } })],
  )
})

async function idOf(type: string) {
  const [row] = await q.query<{ id: string }>(`select id from blocks where type = $1`, [type])
  return row!.id
}

afterEach(async () => {
  await db.close()
})

describe('planRestore', () => {
  it('writes nothing by itself', async () => {
    const before = await draftOf(heroId)
    const plan = await planRestore(q)
    expect(plan.writes.length).toBeGreaterThan(0)
    expect(await draftOf(heroId)).toEqual(before)
  })

  it('puts back copy the migrations overwrote', async () => {
    await apply()
    expect((await draftOf(heroId)).subtitle).toBe('Senior Fullstack Engineer')
  })

  it('hides a section the publication does not hold, without deleting it', async () => {
    await apply()
    expect((await blockRow(oldStripId)).is_visible).toBe(false)
  })

  it('leaves alone a block on a page that was already a draft', async () => {
    const workflow = await idOf('workflow')
    await apply()
    expect((await blockRow(workflow)).is_visible).toBe(true)
  })

  it('moves a block back to its published page', async () => {
    await apply()
    const [site] = await q.query<{ id: string }>(`select id from pages where slug = 'site'`)
    expect((await blockRow(terminalId)).page_id).toBe(site!.id)
  })

  it('unpublishes a page the publication does not hold', async () => {
    await apply()
    const [contact] = await q.query<{ status: string }>(`select status from pages where slug = 'contact'`)
    expect(contact!.status).toBe('draft')
  })

  it('points the menu item back, hides a new one, and leaves the anchor removed', async () => {
    await apply()
    const rows = await q.query<{ slug: string; is_visible: boolean; data: Record<string, unknown> }>(
      `select slug, is_visible, data from entries where collection = 'navigation'`,
    )
    const contact = rows.find((row) => row.slug === 'contact')!
    expect(contact.data.page).toBe('site')
    expect(contact.data).not.toHaveProperty('anchor')
    expect(rows.find((row) => row.slug === 'writing')!.is_visible).toBe(false)
  })

  it('has nothing left to do on a second run', async () => {
    await apply()
    expect((await planRestore(q)).writes).toEqual([])
  })

  describe('files', () => {
    const settingsOf = async (id: string) => {
      const [row] = await q.query<{ settings: Record<string, unknown> }>(`select settings from blocks where id = $1`, [id])
      return row!.settings
    }

    beforeEach(async () => {
      const snapshot = await published()
      snapshot.pages[0]!.blocks[1]!.settings = { photo: FILE }
      await q.query(`update publications set payload = $1`, [JSON.stringify({ locales: { en: snapshot } })])
    })

    it('stores a restored file by id when the publication holds its URL', async () => {
      const about = await idOf('about')
      await q.query(`update blocks set settings = '{"photo":"/assets/illustrations/old.svg"}' where id = $1`, [about])

      await apply()

      const [media] = await q.query<{ id: string }>(`select id from media`)
      expect((await settingsOf(about)).photo).toBe(`media:${media!.id}`)
    })

    it('leaves a reference alone when it already resolves to the published URL', async () => {
      const about = await idOf('about')
      const [media] = await q.query<{ id: string }>(`select id from media`)
      await q.query(`update blocks set settings = $2 where id = $1`, [about, JSON.stringify({ photo: `media:${media!.id}` })])

      const plan = await planRestore(q)

      expect(plan.writes.map((write) => write.what)).not.toContain('settings of home/about')
    })
  })

  it('refuses when a published block has been deleted', async () => {
    await q.query(`update blocks set deleted_at = now() where id = $1`, [heroId])
    const plan = await planRestore(q)
    expect(plan.problems.join()).toMatch(/home\/hero/)
  })
})

describe('differences', () => {
  const payload = (overrides: Record<string, unknown>) =>
    ({
      locales: {
        en: { version: 1, publishedAt: 'a', checksum: 'a', locale: 'en', settings: {}, pages: [], collections: {}, ...overrides },
      },
    }) as unknown as PublicationPayload

  it('ignores version and timestamps', () => {
    const later = payload({})
    later.locales.en.version = 2
    later.locales.en.publishedAt = 'b'
    expect(differences(payload({}), later)).toEqual([])
  })

  it('marks what 0027 and 0031 removed as expected', () => {
    const found = differences(
      payload({
        settings: { site: { grain: true } },
        collections: { navigation: [{ data: { anchor: 'hero' } }] },
      }),
      payload({ settings: { site: {} }, collections: { navigation: [{ data: {} }] } }),
    )
    expect(found.map((d) => d.path).sort()).toEqual(['collections.navigation[0].data.anchor', 'settings.site.grain'])
    expect(found.every((d) => d.expected)).toBe(true)
  })

  it('marks anything else as a surprise', () => {
    const found = differences(
      payload({ pages: [{ slug: 'home', blocks: [{ content: { title: 'Published' } }] }] }),
      payload({ pages: [{ slug: 'home', blocks: [{ content: { title: 'Senior or staff' } }] }] }),
    )
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ path: 'pages[0].blocks[0].content.title', expected: false })
  })
})
