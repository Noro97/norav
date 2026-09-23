import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { invalid, ok } from '@/lib/http'
import { slugify } from '@/lib/post-html'
import { SOURCE_LOCALE } from '@norav/content-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export interface PostSummary {
  id: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: string | null
  updatedAt: string
  title: string
  /** Edited since the last publish — saved, not yet on the site. */
  changed: boolean
}

/** Every post, newest first, with what the list needs to show each one. */
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const posts = await query<PostSummary>(
    `select p.id, p.slug, p.status, p.published_at as "publishedAt",
            greatest(p.updated_at, max(t.updated_at)) as "updatedAt",
            coalesce(max(t.title) filter (where t.locale = $1), '') as title,
            coalesce(
              greatest(p.updated_at, max(t.updated_at)) > (select max(published_at) from publications),
              true
            ) as changed
       from posts p
       left join post_translations t on t.post_id = p.id
      where p.deleted_at is null
      group by p.id
      order by coalesce(p.published_at, p.created_at) desc`,
    [SOURCE_LOCALE],
  )

  return ok({ posts })
}

const createSchema = z.object({ title: z.string().trim().min(1).max(200) })

/**
 * A new draft, from its title. The address comes from the title and is made
 * unique here, so starting a post is one field and not three.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { title } = parsed.data

  const base = slugify(title) || 'post'
  const taken = new Set(
    (
      await query<{ slug: string }>(
        `select slug from posts where deleted_at is null and (slug = $1 or slug like $1 || '-%')`,
        [base],
      )
    ).map((row) => row.slug),
  )
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`

  const post = await queryOne<{ id: string }>(
    `with created as (
       insert into posts (slug) values ($1) returning id
     ), copy as (
       insert into post_translations (post_id, locale, title)
       select id, $2, $3 from created
     )
     select id from created`,
    [slug, SOURCE_LOCALE, title],
  )

  await audit({
    actorId: auth.user.id,
    action: 'post.create',
    entityType: 'post',
    entityId: post!.id,
    ip: clientIp(request),
    diff: { slug },
  })

  return ok({ id: post!.id, slug }, { status: 201 })
}
