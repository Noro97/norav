import { requireUser } from '@/lib/auth'
import { notFound, ok } from '@/lib/http'
import { planRestore } from '@/lib/publish-restore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** What restoring this version would change on the site, or why it can't be restored. */
export async function GET(request: Request, context: { params: Promise<{ version: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const version = Number((await context.params).version)
  const plan = Number.isSafeInteger(version) && version > 0 ? await planRestore(version) : null
  if (!plan) return notFound('Version')

  return ok({
    version: plan.version,
    publishedAt: plan.publishedAt,
    note: plan.note,
    live: plan.live.version,
    checksum: plan.checksum,
    unchanged: plan.unchanged,
    areas: plan.areas,
    problems: plan.problems.map((p) => ({ path: `${p.page}/${p.block}/${p.locale}/${p.path}`, message: p.message })),
  })
}
