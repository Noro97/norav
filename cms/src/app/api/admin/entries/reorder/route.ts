import { z } from 'zod'
import { getCollectionDefinition } from '@norav/content-schema'
import { query } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  collection: z.string().min(1),
  order: z.array(z.string().uuid()).min(1),
})

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { collection, order } = parsed.data

  if (!getCollectionDefinition(collection)) {
    return fail(422, { code: 'unknown_collection', message: `No collection "${collection}".` })
  }

  // One statement, so the collection is never half-reordered.
  await query(
    `update entries e
        set position = x.ord * 1000
       from (
         select value::uuid as id, ordinality as ord
           from jsonb_array_elements_text($2::jsonb) with ordinality as t(value, ordinality)
       ) x
      where e.id = x.id and e.collection = $1 and e.deleted_at is null`,
    [collection, JSON.stringify(order)],
  )

  await audit({
    actorId: auth.user.id,
    action: 'entry.reorder',
    entityType: 'entry',
    ip: clientIp(request),
    diff: { collection, count: order.length },
  })

  return ok({ reordered: order.length })
}
