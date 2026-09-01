import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, fail, invalid, notFound, ok } from '@/lib/http'
import { ROOT_SLUG, SLUG } from '@/lib/pages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface BlockRow {
  id: string
  type: string
  position: string
  anchor_id: string | null
  is_visible: boolean
  settings: Record<string, unknown>
  version: number
  updated_at: string
  translations: Record<string, { content: Record<string, unknown>; status: string }>
}

/** The editor's read model: a page with its blocks and every translation. */
export async function GET(request: Request, context: { params: Promise<{ slug: string[] }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { slug } = await context.params
  const path = slug.join('/')
  const page = await queryOne<{ id: string; slug: string; status: string; seo: unknown }>(
    `select id, slug, status, seo from pages where slug = $1`,
    [path],
  )
  if (!page) return notFound('Page')

  const blocks = await query<BlockRow>(
    `select b.id, b.type, b.position::text, b.anchor_id, b.is_visible, b.settings, b.version, b.updated_at,
            coalesce(
              jsonb_object_agg(t.locale, jsonb_build_object('content', t.content, 'status', t.status))
                filter (where t.locale is not null),
              '{}'::jsonb
            ) as translations
       from blocks b
       left join block_translations t on t.block_id = b.id
      where b.page_id = $1 and b.deleted_at is null
      group by b.id
      order by b.position`,
    [page.id],
  )

  return ok({ page, blocks })
}

const seoSchema = z.record(
  z.string(),
  z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(200).optional(),
    ogImage: z.string().optional(),
  }),
)

const patchSchema = z
  .object({
    slug: z.string().min(1).max(120).regex(SLUG, 'Lowercase words separated by - and /').optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    /** Per locale: { en: { title, description }, ru: {...} }. */
    seo: seoSchema.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Nothing to change')

/** Renames a page, changes what it publishes as, or edits its search listing. */
export async function PATCH(request: Request, context: { params: Promise<{ slug: string[] }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { slug } = await context.params
  const path = slug.join('/')
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const body = parsed.data

  const page = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [path])
  if (!page) return notFound('Page')

  // The site serves this page at its root, by that name. Renaming it would not
  // move the homepage — it would leave the site without one.
  if (path === ROOT_SLUG && body.slug && body.slug !== ROOT_SLUG) {
    return fail(422, {
      code: 'root_page',
      message: `"${ROOT_SLUG}" is the address of the site itself and cannot be renamed.`,
    })
  }

  if (body.slug && body.slug !== path) {
    const taken = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [body.slug])
    if (taken) return conflict(`A page at "${body.slug}" already exists.`)
  }

  const updated = await queryOne<{ id: string; slug: string; status: string; seo: unknown }>(
    `update pages
        set slug = coalesce($2, slug),
            status = coalesce($3, status),
            seo = coalesce($4::jsonb, seo)
      where id = $1
      returning id, slug, status, seo`,
    [page.id, body.slug ?? null, body.status ?? null, body.seo ? JSON.stringify(body.seo) : null],
  )

  // The menu names pages by slug, which is the whole reason renaming is safe:
  // the address is derived, so the items follow. Doing it here rather than
  // leaving it to the editor is the difference between a rename and a rename
  // plus a silent breakage nobody notices until a reader does.
  if (body.slug && body.slug !== path) {
    await query(
      `update entries
          set data = jsonb_set(data, '{page}', to_jsonb($2::text))
        where collection = 'navigation' and data ->> 'page' = $1 and deleted_at is null`,
      [path, body.slug],
    )
  }

  await audit({
    actorId: auth.user.id,
    action: 'page.update',
    entityType: 'page',
    entityId: page.id,
    ip: clientIp(request),
    diff: body,
  })

  return ok({ page: updated })
}

/** Removes a page. Its blocks must be moved or deleted first. */
export async function DELETE(request: Request, context: { params: Promise<{ slug: string[] }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { slug } = await context.params
  const path = slug.join('/')
  if (path === ROOT_SLUG) {
    return fail(422, {
      code: 'root_page',
      message: `"${ROOT_SLUG}" is the address of the site itself and cannot be deleted.`,
    })
  }

  const page = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [path])
  if (!page) return notFound('Page')

  // blocks cascade on delete, and a block carries its translations and its
  // revisions with it. Refusing here rather than cascading means losing a page
  // of work takes two deliberate steps instead of one click.
  const held = await queryOne<{ count: number }>(
    `select count(*)::int as count from blocks where page_id = $1 and deleted_at is null`,
    [page.id],
  )
  if (held && held.count > 0) {
    return conflict(
      `"${path}" still holds ${held.count} section${held.count === 1 ? '' : 's'}. Move or delete them first.`,
    )
  }

  await query(`delete from pages where id = $1`, [page.id])

  await audit({
    actorId: auth.user.id,
    action: 'page.delete',
    entityType: 'page',
    entityId: page.id,
    ip: clientIp(request),
    diff: { slug: path },
  })

  return ok({ deleted: path })
}
