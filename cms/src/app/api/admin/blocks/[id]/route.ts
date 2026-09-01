import { z } from 'zod'
import {
  LOCALES,
  mergeLocale,
  SOURCE_LOCALE,
  validateBlockContent,
  validateBlockSettings,
} from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, invalid, notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  /** The version the editor read. A stale one means someone else saved first. */
  version: z.number().int().positive(),
  isVisible: z.boolean().optional(),
  /** Move the section to another page. It lands at the end of that one. */
  pageSlug: z.string().min(1).optional(),
  anchorId: z.string().min(1).max(64).nullable().optional(),
  settings: z.unknown().optional(),
  translations: z
    .array(z.object({ locale: z.enum(LOCALES), content: z.unknown() }))
    .max(LOCALES.length)
    .optional(),
})

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const patch = parsed.data

  const block = await queryOne<{ id: string; type: string; version: number }>(
    `select id, type, version from blocks where id = $1 and deleted_at is null`,
    [id],
  )
  if (!block) return notFound('Block')
  if (block.version !== patch.version) {
    return conflict('This block changed in another tab. Reload before saving again.')
  }

  // Validate everything before writing anything: a rejected save leaves the row
  // exactly as it was.
  if (patch.settings !== undefined) {
    const result = validateBlockSettings(block.type, patch.settings)
    if (!result.ok) return invalid(result.issues.map((i) => ({ ...i, path: `settings.${i.path}` })))
  }
  // A non-source translation is a partial document by design — the fields it
  // does not own live on the source locale. What has to be valid is the result
  // the site will render, so the check runs on the merge, not on the fragment.
  const sourceRow = await queryOne<{ content: unknown }>(
    `select content from block_translations where block_id = $1 and locale = $2`,
    [id, SOURCE_LOCALE],
  )
  for (const translation of patch.translations ?? []) {
    const candidate =
      translation.locale === SOURCE_LOCALE
        ? translation.content
        : mergeLocale(sourceRow?.content ?? {}, translation.content)
    const result = validateBlockContent(block.type, candidate)
    if (!result.ok) {
      return invalid(
        result.issues.map((i) => ({ ...i, path: `translations.${translation.locale}.${i.path}` })),
      )
    }
  }

  for (const translation of patch.translations ?? []) {
    const previous = await queryOne<{ content: unknown }>(
      `select content from block_translations where block_id = $1 and locale = $2`,
      [id, translation.locale],
    )
    if (previous) {
      await query(
        `insert into revisions (entity_type, entity_id, locale, data, author_id)
         values ('block', $1, $2, $3, $4)`,
        [id, translation.locale, JSON.stringify(previous.content), auth.user.id],
      )
    }

    await query(
      `insert into block_translations (block_id, locale, content, status)
       values ($1, $2, $3, 'ready')
       on conflict (block_id, locale) do update set content = excluded.content, status = 'ready'`,
      [id, translation.locale, JSON.stringify(translation.content)],
    )

    // Editing the source invalidates the others: they still say the old thing.
    if (translation.locale === SOURCE_LOCALE) {
      await query(
        `update block_translations set status = 'stale'
          where block_id = $1 and locale <> $2 and status = 'ready'`,
        [id, SOURCE_LOCALE],
      )
    }
  }

  // A move, resolved before the update so a bad slug fails without touching the
  // row. The block lands at the end of its new page: a fractional position is
  // meaningful only among its own neighbours, and carrying one across would put
  // the section in an arbitrary place.
  let destination: { id: string; position: number } | null = null
  if (patch.pageSlug) {
    const target = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [
      patch.pageSlug,
    ])
    if (!target) return notFound('Page')

    const last = await queryOne<{ last: string | null }>(
      // Qualified, and cast in the outer select only: an unqualified order by
      // would bind to a cast output column and sort these numbers as strings.
      `select max(blocks.position)::text as last
         from blocks where page_id = $1 and deleted_at is null`,
      [target.id],
    )
    destination = { id: target.id, position: last?.last ? Number(last.last) + 1000 : 1000 }

    // `b.id <> $2` so that moving a block to the page it is already on is a
    // no-op rather than a refusal to move it onto itself.
    const singleton = await queryOne<{ id: string }>(
      `select b.id from blocks b
        where b.page_id = $1 and b.id <> $2
          and b.type = (select type from blocks where id = $2)
          and b.deleted_at is null`,
      [target.id, id],
    )
    if (singleton) {
      return conflict(`That page already has this section.`)
    }

    // Anchors are unique per page by index, so a collision here would surface as
    // a constraint violation — a 500 for what is an ordinary editorial clash.
    const anchorTaken = await queryOne<{ anchor_id: string }>(
      `select b.anchor_id from blocks b
        where b.page_id = $1 and b.id <> $2 and b.deleted_at is null
          and b.anchor_id is not null
          and b.anchor_id = (select anchor_id from blocks where id = $2)`,
      [target.id, id],
    )
    if (anchorTaken) {
      return conflict(
        `That page already has a section anchored at "${anchorTaken.anchor_id}". Rename one of them first.`,
      )
    }
  }

  const updated = await queryOne<{ version: number; updated_at: string }>(
    `update blocks
        set page_id    = coalesce($6::uuid, page_id),
            position   = coalesce($7::numeric, position),
            is_visible = coalesce($2, is_visible),
            anchor_id  = case when $3::boolean then $4 else anchor_id end,
            settings   = coalesce($5::jsonb, settings),
            version    = version + 1
      where id = $1
      returning version, updated_at`,
    [
      id,
      patch.isVisible ?? null,
      Object.prototype.hasOwnProperty.call(patch, 'anchorId'),
      patch.anchorId ?? null,
      patch.settings === undefined ? null : JSON.stringify(patch.settings),
      destination?.id ?? null,
      destination?.position ?? null,
    ],
  )

  await audit({
    actorId: auth.user.id,
    action: 'block.update',
    entityType: 'block',
    entityId: id,
    ip: clientIp(request),
    diff: { locales: (patch.translations ?? []).map((t) => t.locale) },
  })

  return ok({ id, version: updated?.version, updatedAt: updated?.updated_at })
}

/**
 * Soft delete. The row keeps its content and its revisions, and the partial
 * indexes only cover live rows, so the anchor becomes free again immediately.
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const block = await queryOne<{ id: string; type: string }>(
    `select id, type from blocks where id = $1 and deleted_at is null`,
    [id],
  )
  if (!block) return notFound('Block')

  await query(`update blocks set deleted_at = now() where id = $1`, [id])

  await audit({
    actorId: auth.user.id,
    action: 'block.delete',
    entityType: 'block',
    entityId: id,
    ip: clientIp(request),
    diff: { type: block.type },
  })

  return ok({ id, deleted: true })
}
