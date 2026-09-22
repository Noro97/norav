import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * One query surface, two drivers.
 *
 * With DATABASE_URL set the CMS talks to Postgres (Neon) through `pg`. Without
 * it — the default for local development — it runs on an embedded PGlite
 * database under `cms/.pglite`, applying `db/migrations` on first boot. Same
 * SQL, same placeholders, no Docker and no cloud account to get started.
 */
interface QueryResult<T> {
  rows: T[]
}

interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
  /**
   * Flush and release the connection. PGlite writes its data directory here —
   * a process that exits without calling this can leave the directory in a
   * state that aborts on the next open, so every script must close.
   */
  close(): Promise<void>
}

const MIGRATIONS_DIR = join(process.cwd(), '..', 'db', 'migrations')

async function createPgClient(connectionString: string): Promise<Db> {
  const { default: pg } = await import('pg')
  const pool = new pg.Pool({ connectionString, max: 5 })
  return {
    async query(sql, params) {
      const result = await pool.query(sql, params as unknown[])
      return { rows: result.rows }
    },
    async close() {
      await pool.end()
    },
  }
}

async function createPgliteClient(): Promise<Db> {
  let PGlite: typeof import('@electric-sql/pglite').PGlite
  try {
    ;({ PGlite } = await import('@electric-sql/pglite'))
  } catch {
    throw new Error(
      'DATABASE_URL is not set and @electric-sql/pglite is not installed. ' +
        'Set DATABASE_URL to a Postgres connection string, or install dev dependencies.',
    )
  }

  const db = new PGlite(join(process.cwd(), '.pglite'))
  await db.exec(`create table if not exists schema_migrations (
    version text primary key,
    applied_at timestamptz not null default now())`)

  const { rows } = await db.query<{ version: string }>('select version from schema_migrations')
  const applied = new Set(rows.map((r) => r.version))

  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    if (applied.has(file)) continue
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'))
    await db.query('insert into schema_migrations (version) values ($1)', [file])
    console.log(`[db] applied ${file}`)
  }

  return {
    async query(sql, params) {
      const result = await db.query(sql, params as unknown[])
      return { rows: result.rows as never[] }
    },
    async close() {
      await db.close()
    },
  }
}

// Next.js reloads modules on every edit in dev; without a global the PGlite
// instance would be re-created (and re-locked) on each change.
const globalForDb = globalThis as unknown as { __noravDb?: Promise<Db> }

function getDb(): Promise<Db> {
  if (!globalForDb.__noravDb) {
    const connectionString = process.env.DATABASE_URL

    // The embedded database is a development convenience. On a serverless
    // filesystem it cannot even be created, and the failure that surfaces —
    // EROFS on mkdir — says nothing about the actual mistake, which is a
    // missing environment variable. Say that instead.
    if (!connectionString && process.env.VERCEL) {
      throw new Error(
        'DATABASE_URL is not set. A deployed CMS needs a real database — ' +
          'the embedded one is for local development only. Set it in the ' +
          'project settings and redeploy.',
      )
    }

    globalForDb.__noravDb = connectionString
      ? createPgClient(connectionString)
      : createPgliteClient()
  }
  return globalForDb.__noravDb
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const db = await getDb()
  const result = await db.query<T>(sql, params)
  return result.rows
}

/**
 * Closes the connection and forgets it, so the next getDb() opens a fresh one.
 * Scripts call this instead of exiting outright; the server never does.
 */
export async function closeDb(): Promise<void> {
  const pending = globalForDb.__noravDb
  if (!pending) return
  globalForDb.__noravDb = undefined
  const db = await pending
  await db.close()
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params)
  return rows[0]
}

/**
 * PGlite is a single-writer embedded database: a CLI script and a running dev
 * server cannot both hold `cms/.pglite`. Whichever opens it second sees a stale
 * view of the data — and an unclean exit can leave the directory unopenable.
 *
 * Scripts call this first, so the failure is a sentence instead of a mystery.
 * Irrelevant once DATABASE_URL points at a real server, which handles
 * concurrency itself.
 */
export async function assertExclusiveLocalDb(port = 3300): Promise<void> {
  if (process.env.DATABASE_URL) return

  try {
    const response = await fetch(`http://localhost:${port}/api/public/manifest`, {
      signal: AbortSignal.timeout(700),
    })
    if (!response.ok) return
  } catch {
    return // nothing listening — the directory is ours
  }

  throw new Error(
    `The CMS is running on port ${port} and holds cms/.pglite.\n` +
      'Stop it (Ctrl-C) before running this script, then start it again afterwards.',
  )
}

/**
 * Which database a writing script is about to touch, checked against which one
 * it was told to touch. `cms/.env` carries the production connection string so
 * that the `:production` scripts can find it, which means every other script
 * has to say out loud that it wants the embedded database — otherwise a plain
 * `npm run user:add` re-passwords the live account and reports success.
 *
 * Two guards, because getting either half wrong is expensive and quiet: with
 * DATABASE_URL set the script must carry `--production`; with `--production`
 * it must have somewhere to write. Returns whether production was the target.
 */
export function assertIntendedDatabase(script: string): boolean {
  const toProduction = process.argv.includes('--production')
  const usingPostgres = Boolean(process.env.DATABASE_URL)

  if (usingPostgres && !toProduction) {
    throw new Error(
      'DATABASE_URL is set, so this would write to the live database.\n' +
        `Run \`npm run ${script}\` for the embedded database, or\n` +
        `\`npm run ${script}:production\` if that is genuinely what you want.`,
    )
  }
  if (toProduction && !usingPostgres) {
    throw new Error('--production was passed but DATABASE_URL is empty. Nothing to write to.')
  }
  return toProduction
}
