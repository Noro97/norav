import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { notFound, ok } from '@/lib/http'
import { getStorage } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Soft-deletes the row and removes the bytes. The row is kept so that a page
 * still pointing at the file can be traced, rather than the reference simply
 * becoming a dead URL with no way back to what it was.
 */
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const media = await queryOne<{ id: string; storage_key: string }>(
    `select id, storage_key from media where id = $1 and deleted_at is null`,
    [id],
  )
  if (!media) return notFound('File')

  await getStorage().remove(media.storage_key)
  await query(`update media set deleted_at = now() where id = $1`, [id])

  await audit({
    actorId: auth.user.id,
    action: 'media.delete',
    entityType: 'media',
    entityId: id,
    ip: clientIp(request),
  })

  return ok({ id, deleted: true })
}
