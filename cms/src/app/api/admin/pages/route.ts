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

  // `changed` answers the question the sidebar could not: which pages hold work
  // that is saved but not yet on the site. A block's own updated_at is the
  // truth — the page row does not change when a section under it is edited.
  const pages = await query<{
    id: string
    slug: string
    status: string
    seo: unknown
    blocks: number
    menuItems: number
    changed: boolean
  }>(
    // `menuItems` is the other thing that stops a delete. Carried on the list
    // so the settings dialog can say so before the click, not after it.
    `select p.id, p.slug, p.status, p.seo,
            count(b.id) filter (where b.deleted_at is null)::int as blocks,
            (select count(*)::int from entries e
              where e.collection = 'navigation' and e.data ->> 'page' = p.slug
                and e.deleted_at is null) as "menuItems",
            coalesce(
              greatest(p.updated_at, max(b.updated_at))
                > (select max(published_at) from publications),
              true
            ) as changed
       from pages p
       left join blocks b on b.page_id = p.id and b.deleted_at is null
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

  return ok({ page: { ...page, blocks: 0, menuItems: 0 } }, { status: 201 })
}
