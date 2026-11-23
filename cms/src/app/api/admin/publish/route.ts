import { z } from 'zod'
import { clientIp, requireUser } from '@/lib/auth'
import { fail, ok } from '@/lib/http'
import { publishDrafts } from '@/lib/publish-run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  note: z.string().max(200).optional(),
  /** Asked and answered: the drafts go live in place of the restore the site shows. */
  replaceRestore: z.boolean().optional(),
})

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  const { note, replaceRestore } = parsed.success ? parsed.data : {}

  const published = await publishDrafts({
    note,
    replaceRestore,
    actorId: auth.user.id,
    ip: clientIp(request),
  })
  if (!published.ok && 'restoreLive' in published) {
    const { version, restoredFrom } = published.restoreLive
    return fail(409, {
      code: 'restore_live',
      message:
        `The site shows version ${version}, a restore of version ${restoredFrom}. ` +
        'Your drafts were not restored, so publishing puts them live in its place.',
    })
  }
  if (!published.ok) {
    // A publish that would render a broken page is refused, with the exact
    // block and field that needs attention.
    return fail(422, {
      code: 'publish_blocked',
      message: 'Some blocks are incomplete. Fix them and publish again.',
      fields: published.problems.map((p) => ({
        path: `${p.page}/${p.block}/${p.locale}/${p.path}`,
        message: p.message,
      })),
    })
  }

  const { version, checksum, unchanged } = published
  if (published.unchanged) return ok({ version, checksum, unchanged })
  const { publishedAt, purged, rebuild } = published
  return ok({ version, checksum, publishedAt, unchanged, purged, rebuild })
}
