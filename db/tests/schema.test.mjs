// =============================================================================
// norav CMS · schema test harness
//
// Applies every migration to an ephemeral PostgreSQL (PGlite — real Postgres
// compiled to WASM), then asserts the invariants the API relies on. No Docker,
// no local cluster, no cleanup.
//
//   cd db && npm install && npm test
// =============================================================================
import { PGlite } from '@electric-sql/pglite'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const db = new PGlite()

let pass = 0
let fail = 0
const results = []

function check(name, ok, detail = '') {
  if (ok) {
    pass++
    results.push(['PASS', name, ''])
  } else {
    fail++
    results.push(['FAIL', name, detail])
  }
}

async function expectError(name, fn, matcher) {
  try {
    await fn()
    check(name, false, 'expected an error, statement succeeded')
  } catch (e) {
    const message = e.message || String(e)
    check(name, matcher ? matcher.test(message) : true, matcher ? `message was: ${message}` : '')
  }
}

// ---------------------------------------------------------------------------
// 1. Migrations apply cleanly, in order
// ---------------------------------------------------------------------------
const files = readdirSync(join(root, 'migrations')).filter((f) => f.endsWith('.sql')).sort()
for (const file of files) {
  try {
    await db.exec(readFileSync(join(root, 'migrations', file), 'utf8'))
    check(`migration ${file}`, true)
  } catch (e) {
    check(`migration ${file}`, false, e.message)
    console.error(`\n  ${file} failed:\n  ${e.message}\n`)
    break
  }
}

// ---------------------------------------------------------------------------
// 2. Fixtures
// ---------------------------------------------------------------------------
const {
  rows: [owner],
} = await db.query(
  `insert into admin_users (email, password_hash, role) values ('Owner@Norav.dev', 'x', 'owner') returning id`,
)
const {
  rows: [page],
} = await db.query(`insert into pages (slug, status) values ('home', 'published') returning id`)
const {
  rows: [hero],
} = await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 1000, 'hero') returning id, version, updated_at`,
  [page.id],
)
await db.query(
  `insert into block_translations (block_id, locale, content) values ($1, 'en', '{"subtitle":"Engineer"}'::jsonb)`,
  [hero.id],
)

// ---------------------------------------------------------------------------
// 3. Identity
// ---------------------------------------------------------------------------
await expectError(
  'admin_users.email is unique case-insensitively',
  () => db.query(`insert into admin_users (email, password_hash) values ('owner@norav.dev', 'y')`),
  /admin_users_email_key|duplicate key/i,
)

await expectError(
  'admin_users.role is constrained',
  () => db.query(`insert into admin_users (email, password_hash, role) values ('a@b.c', 'y', 'root')`),
  /check constraint/i,
)

{
  const { rows } = await db.query(
    `insert into sessions (user_id, token_hash, expires_at) values ($1, 'sha256:abc', now() + interval '30 days') returning id`,
    [owner.id],
  )
  check('sessions insert', rows.length === 1)
  await expectError(
    'sessions.token_hash is unique',
    () =>
      db.query(
        `insert into sessions (user_id, token_hash, expires_at) values ($1, 'sha256:abc', now())`,
        [owner.id],
      ),
    /duplicate key/i,
  )
}

// ---------------------------------------------------------------------------
// 4. Blocks: ordering, anchors, optimistic lock, cascade
// ---------------------------------------------------------------------------
await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'about', 2000, 'about'), ($1, 'skills', 3000, 'skills')`,
  [page.id],
)

// A fractional index means "insert between" writes one row, not the whole page.
await db.query(
  `insert into blocks (page_id, type, position, anchor_id) values ($1, 'capabilities', 1500, 'capabilities')`,
  [page.id],
)
{
  const { rows } = await db.query(
    `select type from blocks where page_id = $1 and deleted_at is null order by position`,
    [page.id],
  )
  check(
    'fractional position keeps order without renumbering',
    rows.map((r) => r.type).join(',') === 'hero,capabilities,about,skills',
    rows.map((r) => r.type).join(','),
  )
}

await expectError(
  'anchor_id is unique per page',
  () => db.query(`insert into blocks (page_id, type, position, anchor_id) values ($1, 'hero', 9000, 'hero')`, [page.id]),
  /blocks_anchor_key|duplicate key/i,
)

{
  // Soft-deleting frees the anchor — the partial index only covers live rows.
  await db.query(`update blocks set deleted_at = now() where page_id = $1 and anchor_id = 'skills'`, [page.id])
  const { rows } = await db.query(
    `insert into blocks (page_id, type, position, anchor_id) values ($1, 'skills', 4000, 'skills') returning id`,
    [page.id],
  )
  check('soft delete releases the anchor', rows.length === 1)
}

{
  await db.query(`update blocks set settings = '{"showScrollHint":false}'::jsonb where id = $1`, [hero.id])
  const { rows } = await db.query(`select updated_at from blocks where id = $1`, [hero.id])
  check(
    'updated_at trigger fires on update',
    new Date(rows[0].updated_at).getTime() >= new Date(hero.updated_at).getTime(),
  )
}

await expectError(
  'block_translations rejects an unknown locale',
  () => db.query(`insert into block_translations (block_id, locale) values ($1, 'de')`, [hero.id]),
  /check constraint/i,
)

{
  const {
    rows: [temp],
  } = await db.query(
    `insert into blocks (page_id, type, position) values ($1, 'tech_marquee', 5000) returning id`,
    [page.id],
  )
  await db.query(`insert into block_translations (block_id, locale) values ($1, 'en')`, [temp.id])
  await db.query(`delete from blocks where id = $1`, [temp.id])
  const { rows } = await db.query(`select 1 from block_translations where block_id = $1`, [temp.id])
  check('deleting a block cascades to its translations', rows.length === 0)
}

// ---------------------------------------------------------------------------
// 5. Collections
// ---------------------------------------------------------------------------
await db.query(
  `insert into entries (collection, slug, position, data) values ('experience', 'proof-app', 1000, '{"period":"Feb 2026 — Present"}'::jsonb)`,
)
await expectError(
  'entries.slug is unique per collection',
  () => db.query(`insert into entries (collection, slug, position) values ('experience', 'proof-app', 2000)`),
  /entries_slug_key|duplicate key/i,
)
{
  const { rows } = await db.query(
    `insert into entries (collection, slug, position) values ('project', 'proof-app', 1000) returning id`,
  )
  check('the same slug is free in another collection', rows.length === 1)
}

// ---------------------------------------------------------------------------
// 6. Publishing
// ---------------------------------------------------------------------------
{
  const { rows } = await db.query(
    `insert into publications (payload, locales, checksum, author_id)
     values ('{"pages":[]}'::jsonb, array['en','ru'], 'sha256:1', $1) returning version`,
    [owner.id],
  )
  const first = Number(rows[0].version)
  const { rows: second } = await db.query(
    `insert into publications (payload, locales, checksum) values ('{"pages":[]}'::jsonb, array['en'], 'sha256:2') returning version`,
  )
  check('publications.version increments monotonically', Number(second[0].version) === first + 1)

  // The query the manifest and the publish route run, in the shape they run it.
  // `version::text` in the select list creates an output column of the same
  // name, and an unqualified `order by version` binds to *that* — sorting the
  // rows as strings, where '9' lands above '12'. The manifest served version 9
  // through three publishes before anyone noticed, because the site kept
  // rendering the copy baked into its bundle.
  while (Number((await db.query(`select max(version) as m from publications`)).rows[0].m) < 12) {
    await db.query(
      `insert into publications (payload, locales, checksum) values ('{"pages":[]}'::jsonb, array['en'], 'sha256:n')`,
    )
  }
  const { rows: latest } = await db.query(
    `select version::text, checksum from publications order by publications.version desc limit 1`,
  )
  const { rows: [{ m: actualMax }] } = await db.query(`select max(version) as m from publications`)
  check(
    'latest publication is found by number, not by string order',
    Number(latest[0].version) === Number(actualMax),
    `got ${latest[0].version}, newest is ${actualMax}`,
  )
}

{
  // History must survive the author's account being removed.
  await db.query(`insert into revisions (entity_type, entity_id, locale, data, author_id) values ('block', $1, 'en', '{}'::jsonb, $2)`, [hero.id, owner.id])
  await db.query(`delete from admin_users where id = $1`, [owner.id])
  const { rows } = await db.query(`select author_id from revisions where entity_id = $1`, [hero.id])
  check('revisions outlive their author', rows.length === 1 && rows[0].author_id === null)
  const { rows: sessionRows } = await db.query(`select 1 from sessions`)
  check('deleting a user cascades to their sessions', sessionRows.length === 0)
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
const width = Math.max(...results.map(([, name]) => name.length))
for (const [status, name, detail] of results) {
  const line = `  ${status}  ${name.padEnd(width)}${detail ? `  — ${detail}` : ''}`
  console.log(status === 'PASS' ? line : `\x1b[31m${line}\x1b[0m`)
}
console.log(`\n  ${pass} passed, ${fail} failed\n`)
await db.close()
process.exit(fail === 0 ? 0 : 1)
