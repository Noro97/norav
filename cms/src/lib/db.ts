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
export interface QueryResult<T> {
  rows: T[]
}

export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>
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
  }
}

// Next.js reloads modules on every edit in dev; without a global the PGlite
// instance would be re-created (and re-locked) on each change.
const globalForDb = globalThis as unknown as { __noravDb?: Promise<Db> }

export function getDb(): Promise<Db> {
  if (!globalForDb.__noravDb) {
    const connectionString = process.env.DATABASE_URL
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

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params)
  return rows[0]
}
