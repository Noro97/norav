import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, notFound, ok } from '@/lib/http'
import { findUsage } from '@/lib/content-references'
import { purgeIfUnpublished } from '@/lib/media-retention'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Soft-deletes the row and removes the bytes — unless a recent publication
 * still shows them, in which case they stay until a publish that does not (see
 * lib/media-retention). The row is kept so that a page still pointing at the
 * file can be traced, rather than the reference simply becoming a dead URL
 * with no way back to what it was.
 *
 * A file the content still names is refused. Nothing used to stop that, and the
 * result was an image that vanished for visitors while the admin looked fine —
 * the failure only shows up on the live site, where you are not looking.
 * `?force=1` is the way past it, for a reference you mean to break.
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const media = await queryOne<{ id: string; storage_key: string; url: string }>(
    `select id, storage_key, url from media where id = $1 and deleted_at is null`,
    [id],
  )
  if (!media) return notFound('File')

  if (new URL(request.url).searchParams.get('force') !== '1') {
    const usage = (await findUsage([media])).get(media.id) ?? []
    if (usage.length > 0) {
      return fail(409, {
        code: 'in_use',
        message: `Still used by ${usage.join(', ')}. Replace it, or delete it anyway if you mean to.`,
      })
    }
  }

  await query(`update media set deleted_at = now() where id = $1`, [id])
  const purged = await purgeIfUnpublished(media)

  await audit({
    actorId: auth.user.id,
    action: 'media.delete',
    entityType: 'media',
    entityId: id,
    ip: clientIp(request),
    diff: { purged },
  })

  return ok({ id, deleted: true, purged })
}
