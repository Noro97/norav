import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, fail, invalid, notFound, ok } from '@/lib/http'
import { ROOT_SLUG, SLUG } from '@/lib/pages'
import { mediaRefId } from '@/lib/media-refs'

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

/**
 * Link previews show PNG and JPEG everywhere, GIF in most places, and drop SVG.
 * A path or URL whose extension says otherwise is refused here; a library file
 * is checked by its type once the request has passed this.
 */
const PREVIEW_TYPES = ['image/png', 'image/jpeg', 'image/gif']
const PREVIEW_EXTENSION = /\.(png|jpe?g|gif)$/i
const ANY_EXTENSION = /\.[a-z0-9]+$/i

const shareImage = z
  .string()
  .max(500)
  .refine(
    (value) => !value || mediaRefId(value) !== null || value.startsWith('/') || value.startsWith('https://'),
    'Choose a file, or type a path like /og/work.png or an https:// address.',
  )
  .refine((value) => {
    const file = value.split(/[?#]/)[0]?.replace(/^https:\/\/[^/]+/, '').split('/').pop() ?? ''
    return mediaRefId(value) !== null || !ANY_EXTENSION.test(file) || PREVIEW_EXTENSION.test(file)
  }, 'Link previews drop SVG and most other formats. Use a PNG or JPEG, 1200 × 630.')

const seoSchema = z.record(
  z.string(),
  z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(200).optional(),
    /** The page's own link-preview image. Empty means the site's card. */
    ogImage: shareImage.optional(),
    ogImageAlt: z.string().max(200).optional(),
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

  for (const [locale, listing] of Object.entries(body.seo ?? {})) {
    const id = mediaRefId(listing.ogImage)
    if (!id) continue
    const file = await queryOne<{ mime: string }>(`select mime from media where id = $1 and deleted_at is null`, [id])
    const reason = !file
      ? 'That file is no longer in the media library.'
      : PREVIEW_TYPES.includes(file.mime)
        ? null
        : 'Link previews drop SVG and most other formats. Use a PNG or JPEG, 1200 × 630.'
    if (reason) return invalid([{ path: `seo.${locale}.ogImage`, message: reason }])
  }

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

  // One statement, because these two writes are one change. The menu names
  // pages by slug — that is what makes renaming safe — so a rename whose
  // repoint does not land leaves the menu pointing at a page that no longer
  // answers, which is the exact failure this design exists to prevent. There is
  // no transaction helper in lib/db, and a CTE needs none.
  const updated = await queryOne<{ id: string; slug: string; status: string; seo: unknown }>(
    `with renamed as (
       update pages
          set slug   = coalesce($2, slug),
              status = coalesce($3, status),
              -- Merged, not replaced: a request carrying one locale must not
              -- drop the other. Shallow, so { en: {...} } does replace all of
              -- en — which is what the editor sends, a whole locale at a time.
              seo    = case when $4::jsonb is null then seo else seo || $4::jsonb end
        where id = $1
        returning id, slug, status, seo
     ), repointed as (
       update entries
          set data = jsonb_set(data, '{page}', to_jsonb($2::text))
        where $2::text is not null
          and collection = 'navigation'
          and data ->> 'page' = $5
          and deleted_at is null
        returning 1
     )
     select id, slug, status, seo from renamed`,
    [
      page.id,
      body.slug ?? null,
      body.status ?? null,
      body.seo ? JSON.stringify(body.seo) : null,
      path,
    ],
  )

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

/**
 * Removes a page. Its blocks must be moved or deleted first. Menu items that
 * point at it block the delete too, unless `?unlink=1` says to take them out
 * of the menu in the same change.
 */
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

  // The same reasoning one guard up, for the other thing that points at a page.
  // The site drops a menu item whose page is gone, so nothing breaks for a
  // reader — but the item stays in the collection as invisible dead data, and
  // the person deleting the page is the only one in a position to decide.
  // `?unlink=1` is that decision made: the dialog has already said which menu
  // items point here, and asked.
  const unlink = new URL(request.url).searchParams.get('unlink') === '1'
  const linked = await queryOne<{ count: number }>(
    `select count(*)::int as count from entries
      where collection = 'navigation' and data ->> 'page' = $1 and deleted_at is null`,
    [path],
  )
  if (!unlink && linked && linked.count > 0) {
    return conflict(
      `${linked.count} menu item${linked.count === 1 ? '' : 's'} point${linked.count === 1 ? 's' : ''} at "${path}". Change or remove them first.`,
    )
  }

  // One statement, for the same reason a rename is: a page deleted without its
  // menu items going too is the dead data the guard above exists to prevent.
  const removed = await queryOne<{ unlinked: number }>(
    `with unlinked as (
       update entries set deleted_at = now()
        where $2::boolean
          and collection = 'navigation' and data ->> 'page' = $3 and deleted_at is null
        returning 1
     ), removed as (
       delete from pages where id = $1 returning 1
     )
     select (select count(*) from unlinked)::int as unlinked`,
    [page.id, unlink, path],
  )

  await audit({
    actorId: auth.user.id,
    action: 'page.delete',
    entityType: 'page',
    entityId: page.id,
    ip: clientIp(request),
    diff: { slug: path, unlinked: removed?.unlinked ?? 0 },
  })

  return ok({ deleted: path, unlinked: removed?.unlinked ?? 0 })
}
