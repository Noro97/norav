/**
 * Writes the truth patch (truth-patch.data.mts) into the drafts, on the content
 * published as version 25. It never publishes: nothing is live until someone
 * previews and publishes in the CMS.
 *
 *   npm run content:truth:production -- --check   # reads only, reports
 *   npm run content:truth:production              # writes the drafts
 *   npm run content:truth                         # the embedded database
 *
 * Every field is compared with what it held in version 25. One that says
 * something else stops the run before anything is written, so a later edit is
 * reported and not overwritten. A field that already holds the new value is
 * skipped, which makes a rerun safe.
 *
 * Publishing releases every draft, not only these, so the run also reports
 * where the drafts already differ from what's live.
 */
import {
  getCollectionDefinition,
  validateBlockContent,
  validateBlockSettings,
  validateEntryContent,
  validateEntryData,
} from '@norav/content-schema'
import { audit } from '../src/lib/audit'
import { assertExclusiveLocalDb, assertIntendedDatabase, closeDb, query, queryOne } from '../src/lib/db'
import { patchFields, publishedDifferences, type FieldEdit, type PublishedDocument } from '../src/lib/field-patch'
import { buildPublication } from '../src/lib/publish'
import { edits, type CreateEntry, type TruthEdit } from './truth-patch.data.ts'

assertIntendedDatabase('content:truth')
await assertExclusiveLocalDb()
const checkOnly = process.argv.includes('--check')

const SHOWN_DIFFERENCES = 30

type Json = Record<string, unknown>

const problems: string[] = []
const writes: (() => Promise<void>)[] = []
let toApply = 0
let alreadyDone = 0

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item])
  return groups
}

const toFieldEdit = (edit: TruthEdit): FieldEdit =>
  edit.kind === 'block-remove'
    ? { removeRow: edit.path, name: edit.from }
    : { path: (edit as { path: string }).path, from: (edit as { from: unknown }).from, to: (edit as { to: unknown }).to }

/** Runs a patch, tallies it, and records any field that moved. */
function patch<T>(label: string, document: T, fields: FieldEdit[]): { document: T; changed: boolean } {
  const result = patchFields(document, fields)
  toApply += result.applied
  alreadyDone += result.alreadyDone
  for (const field of result.moved) {
    problems.push(`${label}.${field.path}: expected ${JSON.stringify(field.expected)}, found ${JSON.stringify(field.found)}`)
  }
  return { document: result.document, changed: result.applied > 0 }
}

function tallySwitch(needed: boolean): boolean {
  if (needed) toApply += 1
  else alreadyDone += 1
  return needed
}

async function saveTranslation(
  entity: { revision: 'block' | 'entry'; table: string; idColumn: string; dataColumn: string; id: string },
  previous: unknown,
  next: unknown,
): Promise<void> {
  const { revision, table, idColumn, dataColumn, id } = entity
  await query(`insert into revisions (entity_type, entity_id, locale, data) values ($1, $2, 'en', $3)`, [
    revision,
    id,
    JSON.stringify(previous),
  ])
  await query(`update ${table} set ${dataColumn} = $2, status = 'ready' where ${idColumn} = $1 and locale = 'en'`, [
    id,
    JSON.stringify(next),
  ])
  // Editing the source invalidates the others, as it does in the admin.
  await query(`update ${table} set status = 'stale' where ${idColumn} = $1 and locale <> 'en' and status = 'ready'`, [id])
}

// ─── Blocks ──────────────────────────────────────────────────────────────────
const blockEdits = edits.filter((edit) => edit.kind.startsWith('block')) as Extract<TruthEdit, { type: string }>[]

for (const [, group] of groupBy(blockEdits, (edit) => `${edit.page}|${edit.type}`)) {
  const { page, type } = group[0]!
  const label = `${page}/${type}`
  const rows = await query<{ id: string; settings: Json; is_visible: boolean; content: Json | null }>(
    `select b.id, b.settings, b.is_visible, t.content
       from blocks b
       join pages p on p.id = b.page_id
       left join block_translations t on t.block_id = b.id and t.locale = 'en'
      where p.slug = $1 and b.type = $2 and b.deleted_at is null`,
    [page, type],
  )
  if (rows.length !== 1 || !rows[0]!.content) {
    problems.push(`${label}: expected one block with English copy, found ${rows.length}`)
    continue
  }
  const row = rows[0]!

  const content = patch(label, row.content!, group.filter((e) => e.kind === 'block' || e.kind === 'block-remove').map(toFieldEdit))
  const settings = patch(`${label} settings`, row.settings, group.filter((e) => e.kind === 'block-setting').map(toFieldEdit))
  const hide = group.some((e) => e.kind === 'block-hide') && tallySwitch(row.is_visible)

  if (content.changed) {
    const check = validateBlockContent(type, content.document)
    if (!check.ok) problems.push(...check.issues.map((i) => `${label}.${i.path}: ${i.message}`))
  }
  if (settings.changed) {
    const check = validateBlockSettings(type, settings.document)
    if (!check.ok) problems.push(...check.issues.map((i) => `${label} settings.${i.path}: ${i.message}`))
  }
  if (!content.changed && !settings.changed && !hide) continue

  writes.push(async () => {
    if (content.changed) {
      await saveTranslation(
        { revision: 'block', table: 'block_translations', idColumn: 'block_id', dataColumn: 'content', id: row.id },
        row.content,
        content.document,
      )
    }
    await query(
      `update blocks
          set is_visible = case when $2 then false else is_visible end,
              settings   = coalesce($3::jsonb, settings),
              version    = version + 1
        where id = $1`,
      [row.id, hide, settings.changed ? JSON.stringify(settings.document) : null],
    )
  })
}

// ─── Page search listings and status ─────────────────────────────────────────
const seoEdits = edits.filter((edit) => edit.kind === 'seo') as Extract<TruthEdit, { kind: 'seo' }>[]

for (const [page, group] of groupBy(seoEdits, (edit) => edit.page)) {
  const row = await queryOne<{ id: string; seo: Json }>(`select id, seo from pages where slug = $1`, [page])
  if (!row) {
    problems.push(`${page}: no such page`)
    continue
  }
  const seo = patch(`${page} seo`, row.seo, group.map(toFieldEdit))
  // The limits the admin route enforces on a page's listing.
  for (const edit of group) {
    const limit = edit.path.endsWith('.title') ? 70 : 200
    if (edit.to.length > limit) problems.push(`${page} seo.${edit.path}: longer than ${limit} characters`)
  }
  if (seo.changed) {
    writes.push(async () => {
      await query(`update pages set seo = $2 where id = $1`, [row.id, JSON.stringify(seo.document)])
    })
  }
}

for (const edit of edits) {
  if (edit.kind !== 'page-unpublish') continue
  const row = await queryOne<{ id: string; status: string }>(`select id, status from pages where slug = $1`, [edit.page])
  if (!row) {
    problems.push(`${edit.page}: no such page`)
  } else if (tallySwitch(row.status === 'published')) {
    writes.push(async () => {
      await query(`update pages set status = 'draft' where id = $1`, [row.id])
    })
  }
}

// ─── Collection rows ─────────────────────────────────────────────────────────
const entryEdits = edits.filter((edit) => edit.kind === 'entry') as Extract<TruthEdit, { kind: 'entry' }>[]

for (const [, group] of groupBy(entryEdits, (edit) => `${edit.collection}|${edit.slug}`)) {
  const { collection, slug } = group[0]!
  const label = `${collection}/${slug}`
  const row = await queryOne<{ id: string; data: Json; content: Json | null }>(
    `select e.id, e.data, t.data as content
       from entries e
       left join entry_translations t on t.entry_id = e.id and t.locale = 'en'
      where e.collection = $1 and e.slug = $2 and e.deleted_at is null`,
    [collection, slug],
  )
  if (!row?.content) {
    problems.push(`${label}: no row with English copy`)
    continue
  }
  // A row keeps its dates and stack in `data` and its copy in the translation.
  const isData = (edit: { path: string }) => edit.path.split('.')[0]! in row.data
  const data = patch(label, row.data, group.filter(isData).map(toFieldEdit))
  const content = patch(label, row.content, group.filter((edit) => !isData(edit)).map(toFieldEdit))

  if (data.changed) {
    const check = validateEntryData(collection, data.document)
    if (!check.ok) problems.push(...check.issues.map((i) => `${label}.${i.path}: ${i.message}`))
  }
  if (content.changed) {
    const check = validateEntryContent(collection, content.document)
    if (!check.ok) problems.push(...check.issues.map((i) => `${label}.${i.path}: ${i.message}`))
  }
  if (!data.changed && !content.changed) continue

  writes.push(async () => {
    if (content.changed) {
      await saveTranslation(
        { revision: 'entry', table: 'entry_translations', idColumn: 'entry_id', dataColumn: 'data', id: row.id },
        row.content,
        content.document,
      )
    }
    await query(`update entries set data = coalesce($2::jsonb, data), version = version + 1 where id = $1`, [
      row.id,
      data.changed ? JSON.stringify(data.document) : null,
    ])
  })
}

for (const edit of edits) {
  if (edit.kind !== 'entry-hide') continue
  const row = await queryOne<{ id: string; is_visible: boolean }>(
    `select id, is_visible from entries where collection = $1 and slug = $2 and deleted_at is null`,
    [edit.collection, edit.slug],
  )
  if (!row) {
    problems.push(`${edit.collection}/${edit.slug}: no such row`)
  } else if (tallySwitch(row.is_visible)) {
    writes.push(async () => {
      await query(`update entries set is_visible = false, version = version + 1 where id = $1`, [row.id])
    })
  }
}

async function planCreate(edit: CreateEntry): Promise<void> {
  const label = `${edit.collection}/${edit.slug}`
  if (!getCollectionDefinition(edit.collection)) {
    problems.push(`${label}: no such collection`)
    return
  }
  const data = validateEntryData(edit.collection, edit.data)
  const content = validateEntryContent(edit.collection, edit.content)
  if (!data.ok) problems.push(...data.issues.map((i) => `${label}.${i.path}: ${i.message}`))
  if (!content.ok) problems.push(...content.issues.map((i) => `${label}.${i.path}: ${i.message}`))

  const existing = await queryOne<{ id: string }>(
    `select id from entries where collection = $1 and slug = $2 and deleted_at is null`,
    [edit.collection, edit.slug],
  )
  if (!tallySwitch(!existing)) return

  writes.push(async () => {
    // Above every other row: the list runs newest first.
    const first = await queryOne<{ position: string | null }>(
      `select min(position)::text as position from entries where collection = $1 and deleted_at is null`,
      [edit.collection],
    )
    const created = await queryOne<{ id: string }>(
      `insert into entries (collection, slug, position, data) values ($1, $2, $3, $4) returning id`,
      [edit.collection, edit.slug, Number(first?.position ?? 1000) - 1000, JSON.stringify(edit.data)],
    )
    await query(`insert into entry_translations (entry_id, locale, data, status) values ($1, 'en', $2, 'ready')`, [
      created!.id,
      JSON.stringify(edit.content),
    ])
  })
}

for (const edit of edits) if (edit.kind === 'entry-create') await planCreate(edit)

// ─── What publishing would release ───────────────────────────────────────────
const live = await queryOne<{ version: string; payload: { locales: Record<string, PublishedDocument> } }>(
  `select version::text, payload from publications order by publications.version desc limit 1`,
)
const built = await buildPublication()

if (!built.ok) {
  console.log('Publishing the current drafts would be refused:')
  for (const problem of built.problems) {
    console.log(`  ${problem.page}/${problem.block}/${problem.locale}/${problem.path}: ${problem.message}`)
  }
} else if (live) {
  const differences = Object.entries(built.payload.locales).flatMap(([locale, document]) => {
    const before = live.payload.locales[locale]
    return before ? publishedDifferences(before, document).map((path) => `${locale} ${path}`) : []
  })
  if (differences.length === 0) {
    console.log(`Drafts match live version ${live.version}, so publishing would release only this patch.`)
  } else {
    console.log(`Drafts differ from live version ${live.version} in ${differences.length} ${differences.length === 1 ? "place" : "places"}:`)
    for (const path of differences.slice(0, SHOWN_DIFFERENCES)) console.log(`  ${path}`)
    if (differences.length > SHOWN_DIFFERENCES) console.log(`  ...and ${differences.length - SHOWN_DIFFERENCES} more`)
  }
}

console.log(`\n${toApply} edits to make, ${alreadyDone} already made.`)

if (problems.length > 0) {
  console.error('\nRefused, nothing was written:')
  for (const problem of problems) console.error(`  ${problem}`)
  await closeDb()
  process.exit(1)
}

if (checkOnly) {
  console.log('Check only, nothing was written.')
  await closeDb()
  process.exit(0)
}

for (const write of writes) await write()
await audit({ action: 'content.truth_patch', diff: { applied: toApply, alreadyDone } })

console.log('Written to the drafts. Nothing is live until you preview and publish in the CMS.')
await closeDb()
