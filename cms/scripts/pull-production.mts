/**
 * Puts the live site's content on this laptop.
 *
 *   npm run pull:production -- --yes
 *
 * Reads every content table from the Neon database `DATABASE_URL` in
 * `cms/.env` points at, and writes it into the embedded database under
 * `cms/.pglite` — replacing whatever was there. Logins stay: the accounts,
 * their sessions and their password hashes are the one thing this never
 * copies in either direction. See `src/lib/pull-content.ts` for what moves.
 *
 * Production is opened read-only and only ever read. The embedded database is
 * the only one written, whatever `.env` says: the connection string is taken
 * off the environment before the local driver looks for it, so there is no
 * configuration under which this runs the other way.
 *
 * Without `--yes` it reports what it would replace and stops.
 */
import { pullContent } from '../src/lib/pull-content'

const production = process.env.DATABASE_URL
if (!production) {
  console.error('DATABASE_URL is not set — put the Neon connection string in cms/.env.')
  process.exit(1)
}
if (/localhost|127\.0\.0\.1/.test(production)) {
  console.error('DATABASE_URL points at this machine; the point is to pull from somewhere else.')
  process.exit(1)
}
// From here on, `../src/lib/db` opens the embedded database. Imported after
// the delete, not before: the module reads the variable lazily, but the
// order makes the intent plain.
delete process.env.DATABASE_URL
const { assertExclusiveLocalDb, closeDb, query } = await import('../src/lib/db')

await assertExclusiveLocalDb()

const { default: pg } = await import('pg')
// One connection, not a pool: the session setting below has to be on the
// connection every query uses. Belt and braces — even a bug in the copy could
// not write to production through it.
const client = new pg.Client({ connectionString: production })
await client.connect()
await client.query('set default_transaction_read_only = on')
const live = {
  async query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> {
    const result = await client.query(sql, params as unknown[])
    return result.rows as T[]
  },
}

async function latest(db: { query: typeof live.query }): Promise<string> {
  // `publications.version`, qualified: unqualified it names the `::text`
  // output column and sorts as strings, where 9 beats 67 (see the manifest
  // route, which learnt this the hard way).
  const [row] = await db.query<{ version: string; published_at: Date }>(
    'select version::text, published_at from publications order by publications.version desc limit 1',
  )
  return row ? `version ${row.version}, published ${row.published_at.toISOString()}` : 'nothing published'
}

const here = await latest({ query })
const there = await latest(live)
console.log(`Live:   ${there}`)
console.log(`Local:  ${here}`)

if (!process.argv.includes('--yes')) {
  console.log('\nThis replaces every page, block, entry, setting, media row and the publication')
  console.log('history in cms/.pglite with what is live. Accounts are left alone.')
  console.log('Run again with --yes to do it.')
  await client.end()
  await closeDb()
  process.exit(1)
}

try {
  const report = await pullContent(live, { query })
  console.log('')
  for (const [table, rows] of Object.entries(report)) {
    console.log(`  ${table.padEnd(20)} ${String(rows).padStart(6)}`)
  }
  console.log(`\nDone. Local is now ${await latest({ query })}.`)
  console.log('Start the CMS again with `npm run dev:local`; the site picks the content up on its next load.')
} finally {
  await client.end()
  await closeDb()
}
