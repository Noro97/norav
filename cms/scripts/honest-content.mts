/**
 * Replaces every placeholder the redesign left behind with copy that is true,
 * and hides what has nothing true to say yet.
 *
 *   npm run content:honest              # the embedded database
 *   npm run content:honest:production   # the live one, deliberately
 *
 * The rule behind every line: a hiring manager can ask about any sentence on
 * the site and get the same answer in an interview. So the fake references,
 * press, awards, show reel and placeholder articles are hidden, not rewritten —
 * inventing them would be worse than the gap. They come back when there is
 * something real to put in them.
 *
 * Only English is written. Russian keeps its current rows and is translated
 * once the English is final.
 *
 * Idempotent: every change is a patch onto the current English content, and
 * rerunning it writes the same result. Nothing is deleted.
 */
import { getBlockDefinition, validateBlockContent } from '@norav/content-schema'
import { assertExclusiveLocalDb, assertIntendedDatabase, closeDb, query, queryOne } from '../src/lib/db'
import { changes, experienceFixes, pagesToUnpublish, type Content } from './honest-content.data.mts'

assertIntendedDatabase('content:honest')
await assertExclusiveLocalDb()

const problems: string[] = []
const writes: { label: string; blockId: string; visible?: boolean; content?: unknown }[] = []

// First pass: resolve and validate everything, write nothing. One bad field
// must not leave the site half-rewritten.
for (const change of changes) {
  const block = await queryOne<{ id: string }>(
    `select b.id from blocks b join pages p on p.id = b.page_id
      where p.slug = $1 and b.type = $2 and b.deleted_at is null`,
    [change.page, change.type],
  )
  if (!block) {
    problems.push(`${change.page}/${change.type}: no such block`)
    continue
  }

  let content: unknown
  if (change.patch) {
    if (!getBlockDefinition(change.type)) throw new Error(`No registry entry for "${change.type}"`)
    const row = await queryOne<{ content: Content }>(
      `select content from block_translations where block_id = $1 and locale = 'en'`,
      [block.id],
    )
    const current = row?.content ?? {}
    const patch = typeof change.patch === 'function' ? change.patch(current) : change.patch
    const check = validateBlockContent(change.type, { ...current, ...patch })
    if (!check.ok) {
      problems.push(...check.issues.map((i) => `${change.page}/${change.type}: ${i.path} — ${i.message}`))
      continue
    }
    content = check.data
  }

  writes.push({ label: `${change.page}/${change.type}`, blockId: block.id, visible: change.visible, content })
}

if (problems.length > 0) {
  console.error('Refused — nothing was written:')
  for (const problem of problems) console.error(`  ${problem}`)
  await closeDb()
  process.exit(1)
}

for (const write of writes) {
  if (write.visible !== undefined) {
    await query(`update blocks set is_visible = $2, updated_at = now() where id = $1`, [write.blockId, write.visible])
  }
  if (write.content !== undefined) {
    await query(
      `insert into block_translations (block_id, locale, content, status)
       values ($1, 'en', $2, 'ready')
       on conflict (block_id, locale) do update set content = excluded.content, status = 'ready'`,
      [write.blockId, JSON.stringify(write.content)],
    )
  }
  const did = [write.content !== undefined && 'copy', write.visible === false && 'hidden', write.visible === true && 'shown']
    .filter(Boolean)
    .join(', ')
  console.log(`  block  ${write.label} (${did})`)
}

for (const slug of pagesToUnpublish) {
  const page = await queryOne<{ id: string }>(
    `update pages set status = 'draft', updated_at = now() where slug = $1 returning id`,
    [slug],
  )
  console.log(page ? `  page   ${slug} (unpublished)` : `  page   ${slug} (not found, skipped)`)
}

for (const fix of experienceFixes) {
  // The sentence may live in the shared data or in the English translation,
  // depending on which fields the collection marks as translatable.
  const updated = await query(
    `update entries set data = replace(data::text, $2, $3)::jsonb
      where collection = 'experience' and slug = $1 and data::text like '%' || $2 || '%'
      returning id`,
    [fix.slug, fix.from, fix.to],
  )
  const translated = await query(
    `update entry_translations t set data = replace(t.data::text, $2, $3)::jsonb
       from entries e
      where e.id = t.entry_id and e.collection = 'experience' and e.slug = $1 and t.locale = 'en'
        and t.data::text like '%' || $2 || '%'
      returning t.entry_id`,
    [fix.slug, fix.from, fix.to],
  )
  const rows = updated.length + translated.length
  console.log(`  entry  experience/${fix.slug} (${rows > 0 ? 'claim replaced' : 'already replaced'})`)
}

console.log('\nDone. Nothing is live until you publish from the CMS.')
await closeDb()
