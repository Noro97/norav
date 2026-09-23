import { query } from './db'
import { mediaRefId, toMediaRef } from './media-refs'
import { htmlMediaIds } from './post-html'

/**
 * Where a media URL can be referenced, as [table, jsonb column, id column].
 *
 * Four places, because a file can be named by a block's settings, a collection
 * entry's data, or either one's translated copy. Anything that walks content
 * looking for URLs has to walk all four, and forgetting one is a silent
 * half-migration — so this list has a single home.
 */
export const REFERENCE_SITES = [
  { table: 'blocks', column: 'settings', key: 'id', translated: false },
  { table: 'block_translations', column: 'content', key: 'block_id', translated: true },
  { table: 'entries', column: 'data', key: 'id', translated: false },
  { table: 'entry_translations', column: 'data', key: 'entry_id', translated: true },
] as const

/** Replace every occurrence of a string anywhere in a JSON value. */
export function replaceDeep(value: unknown, from: string, to: string): unknown {
  if (typeof value === 'string') return value === from ? to : value
  if (Array.isArray(value)) return value.map((item) => replaceDeep(item, from, to))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, replaceDeep(v, from, to)]),
    )
  }
  return value
}

/**
 * Point every reference to `from` at `to` instead.
 *
 * Returns how many rows changed, which is what tells a caller whether a
 * replacement actually reached the content or quietly matched nothing.
 */
export async function repointReferences(from: string, to: string): Promise<number> {
  let changed = 0

  for (const site of REFERENCE_SITES) {
    const rows = await query<{ key: string; value: unknown; locale?: string }>(
      `select ${site.key} as key, ${site.column} as value${site.translated ? ', locale' : ''}
         from ${site.table}
        where ${site.column}::text like $1${site.translated ? '' : ' and deleted_at is null'}`,
      [`%${from}%`],
    )

    for (const row of rows) {
      const next = replaceDeep(row.value, from, to)
      await query(
        `update ${site.table} set ${site.column} = $1 where ${site.key} = $2` +
          (site.translated ? ' and locale = $3' : ''),
        site.translated
          ? [JSON.stringify(next), row.key, row.locale]
          : [JSON.stringify(next), row.key],
      )
      changed++
    }
  }

  return changed
}

/**
 * What names each library file, as labels a person can act on, keyed by id.
 *
 * The point is the moment before a delete: "used by Bento grid, About" is the
 * difference between removing a spare copy and removing the photo on the live
 * site. A file is named either by its `media:<id>` reference or, in content
 * written before references, by its URL — both count. Deduplicated per locale:
 * a file used in both translations of one block is one place, not two.
 */
export async function findUsage(
  files: { id: string; url: string }[],
): Promise<Map<string, string[]>> {
  const usage = new Map<string, Set<string>>()
  if (files.length === 0) return new Map()

  const label = async (site: (typeof REFERENCE_SITES)[number], key: string): Promise<string> => {
    if (site.table.startsWith('block')) {
      const row = await query<{ type: string }>(`select type from blocks where id = $1`, [key])
      return row[0]?.type ?? 'a block'
    }
    const row = await query<{ collection: string; slug: string }>(
      `select collection, slug from entries where id = $1`,
      [key],
    )
    return row[0] ? `${row[0].collection} · ${row[0].slug}` : 'an entry'
  }

  for (const site of REFERENCE_SITES) {
    const rows = await query<{ key: string; text: string }>(
      `select ${site.key} as key, ${site.column}::text as text from ${site.table}
        ${site.translated ? '' : 'where deleted_at is null'}`,
    )
    for (const row of rows) {
      for (const file of files) {
        // Quoted, so one id or URL cannot match inside a longer one.
        const named =
          row.text.includes(JSON.stringify(toMediaRef(file.id))) ||
          row.text.includes(JSON.stringify(file.url))
        if (!named) continue
        if (!usage.has(file.id)) usage.set(file.id, new Set())
        usage.get(file.id)!.add(await label(site, row.key))
      }
    }
  }

  // Posts are text columns, not JSON, and name files only by reference: a
  // cover field, and images inside the body.
  const posts = await query<{ slug: string; cover: string; bodies: string[] }>(
    `select p.slug, p.cover, coalesce(array_agg(t.body_html) filter (where t.body_html is not null), '{}') as bodies
       from posts p left join post_translations t on t.post_id = p.id
      where p.deleted_at is null
      group by p.id`,
  )
  const wanted = new Set(files.map((file) => file.id))
  for (const post of posts) {
    const named = [mediaRefId(post.cover), ...post.bodies.flatMap(htmlMediaIds)]
    for (const id of named) {
      if (!id || !wanted.has(id)) continue
      if (!usage.has(id)) usage.set(id, new Set())
      usage.get(id)!.add(`post · ${post.slug}`)
    }
  }

  return new Map([...usage].map(([id, places]) => [id, [...places].sort()]))
}
