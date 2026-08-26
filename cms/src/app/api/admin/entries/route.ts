import { z } from 'zod'
import { getAtPath, getCollectionDefinition, SOURCE_LOCALE } from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface EntryRow {
  id: string
  collection: string
  slug: string
  position: string
  is_visible: boolean
  data: Record<string, unknown>
  version: number
  translations: Record<string, { data: Record<string, unknown>; status: string }>
}

/** Every row of one collection, with all of its translations. */
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const collection = new URL(request.url).searchParams.get('collection')
  if (!collection || !getCollectionDefinition(collection)) {
    return fail(422, { code: 'unknown_collection', message: `No collection "${collection}".` })
  }

  const entries = await query<EntryRow>(
    `select e.id, e.collection, e.slug, e.position::text, e.is_visible, e.data, e.version,
            coalesce(
              jsonb_object_agg(t.locale, jsonb_build_object('data', t.data, 'status', t.status))
                filter (where t.locale is not null),
              '{}'::jsonb
            ) as translations
       from entries e
       left join entry_translations t on t.entry_id = e.id
      where e.collection = $1 and e.deleted_at is null
      group by e.id
      order by e.position`,
    [collection],
  )

  return ok({ collection, entries })
}

const createSchema = z.object({
  collection: z.string().min(1),
  /** Insert after this row; omit to append. */
  afterId: z.string().uuid().nullable().optional(),
})

/** Slugs come from the title field, so a new row is addressable straight away. */
function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'entry'
  )
}

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { collection, afterId } = parsed.data

  const definition = getCollectionDefinition(collection)
  if (!definition) {
    return fail(422, { code: 'unknown_collection', message: `No collection "${collection}".` })
  }

  const neighbours = await queryOne<{ before: string | null; after: string | null }>(
    `select
       (select position::text from entries
         where collection = $1 and deleted_at is null and ($2::uuid is null or id = $2)
         order by position desc limit 1) as before,
       (select min(position)::text from entries
         where collection = $1 and deleted_at is null
           and position > coalesce(
             (select position from entries where id = $2::uuid), 'infinity'::numeric)) as after`,
    [collection, afterId ?? null],
  )

  const before = neighbours?.before ? Number(neighbours.before) : 0
  const after = neighbours?.after ? Number(neighbours.after) : before + 2000
  const position = afterId ? (before + after) / 2 : before + 1000

  const title = String(getAtPath(definition.defaults.content, definition.titleField) ?? '')
  const base = slugify(title || definition.key)
  // A collection can hold many rows created from the same blank defaults.
  const taken = await query<{ slug: string }>(
    `select slug from entries where collection = $1 and slug like $2 and deleted_at is null`,
    [collection, `${base}%`],
  )
  const slugs = new Set(taken.map((row) => row.slug))
  let slug = base
  for (let n = 2; slugs.has(slug); n += 1) slug = `${base}-${n}`

  const created = await queryOne<{ id: string }>(
    `insert into entries (collection, slug, position, data) values ($1, $2, $3, $4) returning id`,
    [collection, slug, position, JSON.stringify(definition.defaults.data)],
  )
  if (!created) return fail(500, { code: 'insert_failed', message: 'Could not create the entry.' })

  await query(
    `insert into entry_translations (entry_id, locale, data, status) values ($1, $2, $3, 'draft')`,
    [created.id, SOURCE_LOCALE, JSON.stringify(definition.defaults.content)],
  )

  await audit({
    actorId: auth.user.id,
    action: 'entry.create',
    entityType: 'entry',
    entityId: created.id,
    ip: clientIp(request),
    diff: { collection, slug },
  })

  return ok({ id: created.id, collection, slug, position }, { status: 201 })
}
