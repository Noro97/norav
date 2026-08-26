import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { invalid, notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  pageSlug: z.string().min(1),
  /** Every visible block on the page, in the order it should render. */
  order: z.array(z.string().uuid()).min(1),
})

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { pageSlug, order } = parsed.data

  const page = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [pageSlug])
  if (!page) return notFound('Page')

  // One statement, so the page is never half-reordered. Positions are
  // renormalised to round numbers here — the fractional index only has to stay
  // ordered between renormalisations.
  await query(
    `update blocks b
        set position = x.ord * 1000
       from (
         select value::uuid as id, ordinality as ord
           from jsonb_array_elements_text($2::jsonb) with ordinality as t(value, ordinality)
       ) x
      where b.id = x.id and b.page_id = $1 and b.deleted_at is null`,
    [page.id, JSON.stringify(order)],
  )

  await audit({
    actorId: auth.user.id,
    action: 'block.reorder',
    entityType: 'page',
    ip: clientIp(request),
    diff: { pageSlug, count: order.length },
  })

  return ok({ reordered: order.length })
}
