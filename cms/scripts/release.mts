/**
 * Publishes the current drafts, or shows what a publish would change.
 *
 *   npm run release -- --dry-run                         the embedded database
 *   npm run release:production -- --dry-run              production, reading only
 *   npm run release:production -- --expect <checksum>    production, for real
 *
 * With `--restore <version>` it publishes that version's content again instead,
 * as a new version, the way History does in the admin. The drafts stay as they
 * are. The same two steps apply: a dry run, then `--expect` its checksum.
 *
 * Validation checks shape and not truth, so read the dry run. A real publish on
 * production needs the checksum that dry run printed, which means it can only
 * release exactly what somebody looked at. See docs/plan/runbook-publish.md.
 */
import { assertExclusiveLocalDb, assertIntendedDatabase, closeDb, queryOne } from '../src/lib/db'
import { buildPublication } from '../src/lib/publish'
import { diffPublications } from '../src/lib/publish-diff'
import { livePublication, publishDrafts } from '../src/lib/publish-run'
import { planRestore, restorePublication } from '../src/lib/publish-restore'

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}

function show(value: unknown): string {
  if (value === undefined) return '(nothing)'
  const text = JSON.stringify(value)
  return text.length > 140 ? `${text.slice(0, 140)}…` : text
}

const toProduction = assertIntendedDatabase('release')
await assertExclusiveLocalDb()

const dryRun = process.argv.includes('--dry-run')
const expected = arg('expect')
if (toProduction && !dryRun && !expected) {
  console.error('A real publish on production needs --expect <checksum>, from a --dry-run you have read.')
  process.exit(1)
}

const restoring = arg('restore')

async function restore(version: number) {
  const plan = await planRestore(version)
  if (!plan) {
    console.error(`There is no version ${version}.`)
    process.exitCode = 1
    return
  }
  if (plan.problems.length > 0) {
    console.error(`Version ${version} can't go live again:`)
    for (const p of plan.problems) console.error(`  ${p.page}/${p.block}/${p.locale}/${p.path}: ${p.message}`)
    process.exitCode = 1
    return
  }
  if (dryRun) {
    console.log(`Restoring version ${version} over version ${plan.live.version}:${plan.unchanged ? ' nothing changes.' : ''}`)
    for (const area of plan.areas) {
      console.log(`  ${area.label}: ${area.kind === 'changed' ? `${area.count} change(s)` : area.kind}`)
      for (const line of area.sample) console.log(`    ${line.path}: ${line.before ?? '(nothing)'} -> ${line.after ?? '(nothing)'}`)
    }
    console.log(`Checksum: ${plan.checksum}`)
    return
  }
  if (expected && expected !== plan.checksum) {
    console.error(`Expected ${expected}, but restoring version ${version} gives ${plan.checksum}. Nothing was published.`)
    process.exitCode = 1
    return
  }
  const restored = await restorePublication({
    version,
    expectLive: plan.live.version,
    note: arg('note'),
    actorId: null,
  })
  console.log(JSON.stringify(restored, null, 2))
  if (!restored.ok) process.exitCode = 1
}

async function release() {
  const built = await buildPublication()
  if (!built.ok) {
    console.error('Publish would be refused:')
    for (const p of built.problems) console.error(`  ${p.page}/${p.block}/${p.locale}/${p.path}: ${p.message}`)
    process.exitCode = 1
  } else if (dryRun) {
    const latest = await queryOne<{ version: string; payload: unknown }>(
      `select version::text, payload from publications order by publications.version desc limit 1`,
    )
    const changes = diffPublications(latest?.payload ?? {}, built.payload)
    const live = await livePublication()
    if (live?.restoredFrom != null) {
      console.log(`Version ${live.version} is a restore of version ${live.restoredFrom}. Releasing puts the drafts live in its place.`)
    }
    console.log(`Compared with version ${latest?.version ?? '(none)'}: ${changes.length} change(s).`)
    for (const change of changes) console.log(`  ${change.path}: ${show(change.before)} -> ${show(change.after)}`)
    console.log(`Checksum: ${built.checksum}`)
  } else if (expected && expected !== built.checksum) {
    console.error(`The drafts changed since the dry run: expected ${expected}, found ${built.checksum}. Nothing was published.`)
    process.exitCode = 1
  } else {
    // If the site shows a restore, the dry run said so, and this is the checksum it printed.
    const published = await publishDrafts({ note: arg('note'), actorId: null, replaceRestore: true })
    console.log(JSON.stringify(published, null, 2))
    if (!published.ok) process.exitCode = 1
  }
}

try {
  if (restoring) await restore(Number(restoring))
  else await release()
} finally {
  await closeDb()
}
