import { z } from 'zod'
import { clientIp, requireUser } from '@/lib/auth'
import { conflict, fail, invalid, notFound, ok } from '@/lib/http'
import { restorePublication } from '@/lib/publish-restore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  /** The live version the confirmation compared with. */
  live: z.number().int().positive(),
  note: z.string().max(200).optional(),
})

/** Publishes an older version again, as a new one. Nothing is rewritten. */
export async function POST(request: Request, context: { params: Promise<{ version: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const version = Number((await context.params).version)
  if (!Number.isSafeInteger(version) || version <= 0) return notFound('Version')

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }

  const restored = await restorePublication({
    version,
    expectLive: parsed.data.live,
    note: parsed.data.note,
    actorId: auth.user.id,
    ip: clientIp(request),
  })

  if (!restored.ok) {
    if (restored.reason === 'not_found') return notFound('Version')
    if (restored.reason === 'moved') {
      return conflict(`Version ${restored.live} was published since you opened this. Look at the changes again.`)
    }
    return fail(422, {
      code: 'restore_blocked',
      message: `Version ${version} can't go live again as it is.`,
      fields: restored.problems.map((p) => ({
        path: `${p.page}/${p.block}/${p.locale}/${p.path}`,
        message: p.message,
      })),
    })
  }

  return ok(restored)
}
