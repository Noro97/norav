/**
 * The production catch-up's second step. See docs/plan/runbook-publish.md.
 *
 *   npm run content:catch-up:production            # says what it would change, stops
 *   npm run content:catch-up:production -- --yes   # writes it, then checks the result
 *
 * After migrations 0016-0031, this puts the drafts back to the latest publication,
 * so a publish changes nothing a visitor can see. See src/lib/restore-published.ts.
 * It writes drafts only. Rerunning it is safe, and a second run has nothing to do.
 *
 * Delete it once production is caught up, as S1 did with its truth patch.
 */
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const { assertExclusiveLocalDb, assertIntendedDatabase, closeDb, query } = await import('../src/lib/db')
const { buildPublication } = await import('../src/lib/publish')
const { differences, planRestore } = await import('../src/lib/restore-published')

assertIntendedDatabase('content:catch-up')
await assertExclusiveLocalDb()

/** The last migration that writes old copy. Anything later is meant to reach the drafts. */
const THROUGH = '0031'

function refuse(reason: string): never {
  console.error(`Refused, and nothing was written. ${reason}`)
  process.exit(1)
}

try {
  const files = readdirSync(join(process.cwd(), '..', 'db', 'migrations')).filter((file) => file.endsWith('.sql'))
  const applied = new Set((await query<{ version: string }>('select version from schema_migrations')).map((row) => row.version))
  const pending = files.filter((file) => file.slice(0, 4) <= THROUGH && !applied.has(file))
  const later = [...applied].filter((file) => file.slice(0, 4) > THROUGH)
  if (pending.length > 0) refuse(`Apply these first: ${pending.join(', ')}`)
  if (later.length > 0) {
    refuse(`Run this before any migration after ${THROUGH}, or it would hide what they add. Applied: ${later.join(', ')}`)
  }

  const db = { query }
  const plan = await planRestore(db)
  if (plan.problems.length > 0) refuse(`\n${plan.problems.map((problem) => `  ${problem}`).join('\n')}`)

  console.log(`Latest publication: version ${plan.version}.`)
  console.log(`Drafts differ from it in ${plan.writes.length} places.\n`)
  for (const write of plan.writes) console.log(`  ${write.what}`)

  if (!process.argv.includes('--yes')) {
    console.log('\nNothing was written. Run again with --yes to write these to the drafts.')
    process.exit(0)
  }

  for (const write of plan.writes) await query(write.sql, write.params)

  const [{ payload }] = await query<{ payload: Parameters<typeof differences>[0] }>(
    `select payload from publications order by publications.version desc limit 1`,
  )
  const built = await buildPublication()
  if (!built.ok) {
    for (const p of built.problems) console.error(`  ${p.page}/${p.block}/${p.locale}/${p.path}: ${p.message}`)
    refuse('Publish validation fails on the restored drafts.')
  }

  const found = differences(payload, built.payload)
  const surprising = found.filter((difference) => !difference.expected)
  console.log(`\nWritten. A publish now differs from version ${plan.version} in ${found.length} values:`)
  console.log(`  ${found.length - surprising.length} expected: menu anchors (0031) and ambient-layer settings (0027)`)
  if (surprising.length > 0) {
    console.error(`  ${surprising.length} NOT expected. Don't publish:`)
    for (const { locale, path } of surprising) console.error(`    ${locale} ${path}`)
    process.exitCode = 1
  } else {
    console.log('Nothing a visitor can see changes. Nothing is live until someone publishes.')
  }
} finally {
  await closeDb()
}
