import { z } from 'zod'
import {
  LOCALES,
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
  for (const translation of patch.translations ?? []) {
    const result = validateBlockContent(block.type, translation.content)
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

  const updated = await queryOne<{ version: number; updated_at: string }>(
    `update blocks
        set is_visible = coalesce($2, is_visible),
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
