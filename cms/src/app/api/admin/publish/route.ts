import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, ok } from '@/lib/http'
import { buildPublication, stampVersion } from '@/lib/publish'
import { LOCALES } from '@norav/content-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({ note: z.string().max(200).optional() })

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})))
  const note = parsed.success ? parsed.data.note : undefined

  const built = await buildPublication()
  if (!built.ok) {
    // A publish that would render a broken page is refused, with the exact
    // block and field that needs attention.
    return fail(422, {
      code: 'publish_blocked',
      message: 'Some blocks are incomplete. Fix them and publish again.',
      fields: built.problems.map((p) => ({
        path: `${p.page}/${p.block}/${p.locale}/${p.path}`,
        message: p.message,
      })),
    })
  }

  const previous = await queryOne<{ checksum: string; version: string }>(
    `select checksum, version::text from publications order by version desc limit 1`,
  )
  if (previous?.checksum === built.checksum) {
    return ok({
      version: Number(previous.version),
      checksum: built.checksum,
      unchanged: true,
    })
  }

  const row = await queryOne<{ version: string; published_at: string }>(
    `insert into publications (payload, locales, checksum, note, author_id)
     values ($1, $2, $3, $4, $5)
     returning version::text, published_at`,
    [
      JSON.stringify(built.payload),
      LOCALES as unknown as string[],
      built.checksum,
      note ?? null,
      auth.user.id,
    ],
  )

  const version = Number(row?.version ?? 0)
  // The version is only known after the insert, so it is stamped into the
  // stored document in a second write rather than guessed beforehand.
  await queryOne(`update publications set payload = $2 where version = $1`, [
    version,
    JSON.stringify(stampVersion(built.payload, version)),
  ])

  await audit({
    actorId: auth.user.id,
    action: 'publish',
    entityType: 'page',
    ip: clientIp(request),
    diff: { version, checksum: built.checksum, note },
  })

  return ok({ version, checksum: built.checksum, publishedAt: row?.published_at, unchanged: false })
}
