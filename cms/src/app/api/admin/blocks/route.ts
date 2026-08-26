import { z } from 'zod'
import { getBlockDefinition, isBlockType, SOURCE_LOCALE } from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, fail, invalid, notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  pageSlug: z.string().min(1),
  type: z.string().min(1),
  anchorId: z.string().min(1).max(64).nullable().optional(),
  /** Insert after this block; omit to append. */
  afterId: z.string().uuid().nullable().optional(),
})

/** Creates a block from its registry defaults, already translated into the source locale. */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { pageSlug, type, anchorId, afterId } = parsed.data

  const definition = getBlockDefinition(type)
  if (!definition || !isBlockType(type)) {
    return fail(422, { code: 'unknown_type', message: `No block type "${type}" in the registry.` })
  }

  const page = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [pageSlug])
  if (!page) return notFound('Page')

  if (definition.singleton) {
    const existing = await queryOne<{ id: string }>(
      `select id from blocks where page_id = $1 and type = $2 and deleted_at is null`,
      [page.id, type],
    )
    if (existing) return conflict(`"${definition.label}" can only appear once on a page.`)
  }

  // Fractional index: land halfway between the neighbours so the rest of the
  // page keeps its positions.
  const neighbours = await queryOne<{ before: string | null; after: string | null }>(
    `select
       (select position::text from blocks
         where page_id = $1 and deleted_at is null and ($2::uuid is null or id = $2)
         order by position desc limit 1) as before,
       (select min(position)::text from blocks
         where page_id = $1 and deleted_at is null
           and position > coalesce(
             (select position from blocks where id = $2::uuid), 'infinity'::numeric)) as after`,
    [page.id, afterId ?? null],
  )

  const before = neighbours?.before ? Number(neighbours.before) : 0
  const after = neighbours?.after ? Number(neighbours.after) : before + 2000
  const position = afterId ? (before + after) / 2 : before + 1000

  const created = await queryOne<{ id: string }>(
    `insert into blocks (page_id, type, position, anchor_id, settings)
     values ($1, $2, $3, $4, $5) returning id`,
    [page.id, type, position, anchorId ?? null, JSON.stringify(definition.defaults.settings)],
  )
  if (!created) return fail(500, { code: 'insert_failed', message: 'Could not create the block.' })

  await query(
    `insert into block_translations (block_id, locale, content, status)
     values ($1, $2, $3, 'draft')`,
    [created.id, SOURCE_LOCALE, JSON.stringify(definition.defaults.content)],
  )

  await audit({
    actorId: auth.user.id,
    action: 'block.create',
    entityType: 'block',
    entityId: created.id,
    ip: clientIp(request),
    diff: { type, position },
  })

  return ok({ id: created.id, type, position }, { status: 201 })
}
