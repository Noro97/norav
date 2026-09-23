import { z } from 'zod'
import { LOCALES } from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, invalid, notFound, ok } from '@/lib/http'
import { sanitizePostHtml } from '@/lib/sanitize-post'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface PostCopy {
  title: string
  excerpt: string
  bodyHtml: string
  seo: { title?: string; description?: string }
}

export interface PostDetail {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  cover: string
  tags: string[]
  version: number
  translations: Partial<Record<string, PostCopy>>
}

async function load(id: string): Promise<PostDetail | undefined> {
  return queryOne<PostDetail>(
    `select p.id, p.slug, p.status, p.published_at as "publishedAt", p.cover, p.tags, p.version,
            coalesce(
              jsonb_object_agg(
                t.locale,
                jsonb_build_object('title', t.title, 'excerpt', t.excerpt, 'bodyHtml', t.body_html, 'seo', t.seo)
              ) filter (where t.locale is not null),
              '{}'::jsonb
            ) as translations
       from posts p
       left join post_translations t on t.post_id = p.id
      where p.id = $1 and p.deleted_at is null
      group by p.id`,
    [id],
  )
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const post = await load((await context.params).id)
  if (!post) return notFound('Post')
  return ok({ post })
}

const patchSchema = z.object({
  version: z.number().int().positive(),
  // One segment: a post lives at /writing/<slug>, never deeper.
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase words separated by -')
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.iso.datetime({ offset: true }).nullable().optional(),
  cover: z.string().max(500).optional(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(8).optional(),
  locale: z.enum(LOCALES).optional(),
  title: z.string().max(200).optional(),
  excerpt: z.string().max(400).optional(),
  bodyHtml: z.string().max(500_000).optional(),
  seo: z
    .object({ title: z.string().max(70).optional(), description: z.string().max(200).optional() })
    .optional(),
})

/**
 * Saves a post: its own fields and, for one locale, its copy. One request for
 * both, because the editor saves them together and a half-saved post — the new
 * title with the old status — is not a state anybody chose.
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const parsed = patchSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const patch = parsed.data

  const current = await queryOne<{ version: number; status: string; published_at: string | null }>(
    `select version, status, published_at from posts where id = $1 and deleted_at is null`,
    [id],
  )
  if (!current) return notFound('Post')
  if (current.version !== patch.version) {
    return conflict('This post changed in another tab. Reload before saving again.')
  }

  if (patch.slug) {
    const taken = await queryOne<{ id: string }>(
      `select id from posts where slug = $1 and id <> $2 and deleted_at is null`,
      [patch.slug, id],
    )
    if (taken) return conflict(`Another post already lives at /writing/${patch.slug}.`)
  }

  // Publishing without a date means "now". A date already set is kept, so
  // republishing an old post does not move it to the top.
  const status = patch.status ?? current.status
  let publishedAt = patch.publishedAt === undefined ? current.published_at : patch.publishedAt
  if (status === 'published' && !publishedAt) publishedAt = new Date().toISOString()

  const copyTouched = ['title', 'excerpt', 'bodyHtml', 'seo'].some(
    (key) => patch[key as keyof typeof patch] !== undefined,
  )
  if (copyTouched && !patch.locale) {
    return invalid([{ path: 'locale', message: 'Say which language this copy is in.' }])
  }
  const body = patch.bodyHtml === undefined ? null : sanitizePostHtml(patch.bodyHtml)

  await query(
    `update posts
        set slug = coalesce($2, slug),
            status = $3,
            published_at = $4,
            cover = coalesce($5, cover),
            tags = coalesce($6, tags),
            version = version + 1
      where id = $1`,
    [id, patch.slug ?? null, status, publishedAt, patch.cover ?? null, patch.tags ?? null],
  )

  if (copyTouched) {
    await query(
      `insert into post_translations (post_id, locale, title, excerpt, body_html, seo)
       values ($1, $2, coalesce($3, ''), coalesce($4, ''), coalesce($5, ''), coalesce($6::jsonb, '{}'))
       on conflict (post_id, locale) do update
          set title     = coalesce($3, post_translations.title),
              excerpt   = coalesce($4, post_translations.excerpt),
              body_html = coalesce($5, post_translations.body_html),
              seo       = coalesce($6::jsonb, post_translations.seo)`,
      [
        id,
        patch.locale,
        patch.title ?? null,
        patch.excerpt ?? null,
        body,
        patch.seo ? JSON.stringify(patch.seo) : null,
      ],
    )
  }

  await audit({
    actorId: auth.user.id,
    action: 'post.update',
    entityType: 'post',
    entityId: id,
    ip: clientIp(request),
    diff: { ...patch, bodyHtml: body === null ? undefined : `${body.length} chars` },
  })

  return ok({ post: await load(id) })
}

/**
 * Soft-deletes a post. It leaves the site with the next publish, and its
 * address is free again for a new one.
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const deleted = await queryOne<{ slug: string }>(
    `update posts set deleted_at = now() where id = $1 and deleted_at is null returning slug`,
    [id],
  )
  if (!deleted) return notFound('Post')

  await audit({
    actorId: auth.user.id,
    action: 'post.delete',
    entityType: 'post',
    entityId: id,
    ip: clientIp(request),
    diff: { slug: deleted.slug },
  })

  return ok({ id, deleted: true })
}
