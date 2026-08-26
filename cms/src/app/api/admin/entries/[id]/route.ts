import { z } from 'zod'
import {
  getCollectionDefinition,
  LOCALES,
  mergeLocale,
  SOURCE_LOCALE,
  validateEntryContent,
  validateEntryData,
} from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, invalid, notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  version: z.number().int().positive(),
  isVisible: z.boolean().optional(),
  slug: z.string().min(1).max(60).optional(),
  /** Non-localized columns: dates, stack, media. */
  data: z.unknown().optional(),
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

  const entry = await queryOne<{ id: string; collection: string; version: number }>(
    `select id, collection, version from entries where id = $1 and deleted_at is null`,
    [id],
  )
  if (!entry) return notFound('Entry')
  if (entry.version !== patch.version) {
    return conflict('This entry changed in another tab. Reload before saving again.')
  }
  if (!getCollectionDefinition(entry.collection)) {
    return invalid([{ path: 'collection', message: `Unknown collection "${entry.collection}".` }])
  }

  // Validate everything before writing anything.
  if (patch.data !== undefined) {
    const result = validateEntryData(entry.collection, patch.data)
    if (!result.ok) return invalid(result.issues.map((i) => ({ ...i, path: `data.${i.path}` })))
  }

  const sourceRow = await queryOne<{ data: unknown }>(
    `select data from entry_translations where entry_id = $1 and locale = $2`,
    [id, SOURCE_LOCALE],
  )
  for (const translation of patch.translations ?? []) {
    // A non-source translation is partial by design; what must be valid is the
    // merge the site will render.
    const candidate =
      translation.locale === SOURCE_LOCALE
        ? translation.content
        : mergeLocale(sourceRow?.data ?? {}, translation.content)
    const result = validateEntryContent(entry.collection, candidate)
    if (!result.ok) {
      return invalid(
        result.issues.map((i) => ({ ...i, path: `translations.${translation.locale}.${i.path}` })),
      )
    }
  }

  for (const translation of patch.translations ?? []) {
    const previous = await queryOne<{ data: unknown }>(
      `select data from entry_translations where entry_id = $1 and locale = $2`,
      [id, translation.locale],
    )
    if (previous) {
      await query(
        `insert into revisions (entity_type, entity_id, locale, data, author_id)
         values ('entry', $1, $2, $3, $4)`,
        [id, translation.locale, JSON.stringify(previous.data), auth.user.id],
      )
    }

    await query(
      `insert into entry_translations (entry_id, locale, data, status)
       values ($1, $2, $3, 'ready')
       on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready'`,
      [id, translation.locale, JSON.stringify(translation.content)],
    )

    if (translation.locale === SOURCE_LOCALE) {
      await query(
        `update entry_translations set status = 'stale'
          where entry_id = $1 and locale <> $2 and status = 'ready'`,
        [id, SOURCE_LOCALE],
      )
    }
  }

  const updated = await queryOne<{ version: number; slug: string }>(
    `update entries
        set is_visible = coalesce($2, is_visible),
            slug       = coalesce($3, slug),
            data       = coalesce($4::jsonb, data),
            version    = version + 1
      where id = $1
      returning version, slug`,
    [
      id,
      patch.isVisible ?? null,
      patch.slug ?? null,
      patch.data === undefined ? null : JSON.stringify(patch.data),
    ],
  )

  await audit({
    actorId: auth.user.id,
    action: 'entry.update',
    entityType: 'entry',
    entityId: id,
    ip: clientIp(request),
    diff: { locales: (patch.translations ?? []).map((t) => t.locale) },
  })

  return ok({ id, version: updated?.version, slug: updated?.slug })
}

/** Soft delete — the row keeps its content and its revisions, and frees its slug. */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const entry = await queryOne<{ id: string; collection: string; slug: string }>(
    `select id, collection, slug from entries where id = $1 and deleted_at is null`,
    [id],
  )
  if (!entry) return notFound('Entry')

  await query(`update entries set deleted_at = now() where id = $1`, [id])

  await audit({
    actorId: auth.user.id,
    action: 'entry.delete',
    entityType: 'entry',
    entityId: id,
    ip: clientIp(request),
    diff: { collection: entry.collection, slug: entry.slug },
  })

  return ok({ id, deleted: true })
}
