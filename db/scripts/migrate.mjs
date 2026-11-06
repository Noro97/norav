#!/usr/bin/env node
// =============================================================================
// Applies every pending migration to DATABASE_URL, in filename order.
//
//   node --env-file=.env scripts/migrate.mjs          apply pending
//   node --env-file=.env scripts/migrate.mjs --status  list without applying
//   node --env-file=.env scripts/migrate.mjs --through=0031  stop after that number
//
// Each file runs inside its own transaction together with its schema_migrations
// row, so a failure leaves the database on the last fully-applied version.
// =============================================================================
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = join(root, 'migrations')
const statusOnly = process.argv.includes('--status')
const through = process.argv.find((arg) => arg.startsWith('--through='))?.slice('--through='.length)
if (through !== undefined && !/^\d{4}$/.test(through)) {
  console.error('--through takes a four-digit migration number, like --through=0031.')
  process.exit(1)
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy db/.env.example to db/.env and fill it in.')
  process.exit(1)
}

const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()
const client = new pg.Client({ connectionString })
await client.connect()

try {
  // 0001 creates the bookkeeping table, so the first run has nothing to read.
  await client.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )`)

  const { rows } = await client.query('select version from schema_migrations')
  const applied = new Set(rows.map((r) => r.version))
  const pending = files.filter((f) => !applied.has(f) && (through === undefined || f.slice(0, 4) <= through))

  if (statusOnly) {
    for (const f of files) console.log(`${applied.has(f) ? '  applied' : '  PENDING'}  ${f}`)
    console.log(`\n${applied.size} applied, ${pending.length} pending`)
    process.exit(0)
  }

  if (pending.length === 0) {
    console.log('Up to date — nothing to apply.')
    process.exit(0)
  }

  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    process.stdout.write(`  applying ${file} ... `)
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('insert into schema_migrations (version) values ($1)', [file])
      await client.query('commit')
      console.log('ok')
    } catch (err) {
      await client.query('rollback')
      console.log('FAILED')
      console.error(`\n${file}:\n${err.message}\n`)
      process.exit(1)
    }
  }
  console.log(`\nApplied ${pending.length} migration(s).`)
} finally {
  await client.end()
}
