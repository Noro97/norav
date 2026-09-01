import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { conflict, invalid, ok } from '@/lib/http'
import { ROOT_SLUG, SLUG } from '@/lib/pages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createSchema = z.object({
  slug: z.string().min(1).max(120).regex(SLUG, 'Lowercase words separated by - and /'),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
})

/** Every page, with enough about each to list it without a second request. */
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const pages = await query<{
    id: string
    slug: string
    status: string
    seo: unknown
    blocks: number
    updated_at: string
  }>(
    `select p.id, p.slug, p.status, p.seo, p.updated_at,
            count(b.id) filter (where b.deleted_at is null)::int as blocks
       from pages p
       left join blocks b on b.page_id = p.id
      group by p.id
      order by p.slug = $1 desc, p.slug`,
    [ROOT_SLUG],
  )

  return ok({ pages })
}

/** A new, empty page. Blocks are added to it afterwards, or moved onto it. */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { slug, status } = parsed.data

  const existing = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [slug])
  if (existing) return conflict(`A page at "${slug}" already exists.`)

  const page = await queryOne<{ id: string; slug: string; status: string; seo: unknown }>(
    `insert into pages (slug, status) values ($1, $2) returning id, slug, status, seo`,
    [slug, status],
  )

  await audit({
    actorId: auth.user.id,
    action: 'page.create',
    entityType: 'page',
    entityId: page!.id,
    ip: clientIp(request),
  })

  return ok({ page: { ...page, blocks: 0 } }, { status: 201 })
}
