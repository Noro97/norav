import { randomUUID } from 'node:crypto'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'
import { getStorage } from '@/lib/storage'
import { repointReferences } from '@/lib/content-references'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 12 * 1024 * 1024

const ACCEPTED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
}

/**
 * Swap the bytes behind a library entry, and carry every reference across.
 *
 * The alternative is uploading the new file and choosing it again everywhere
 * the old one appeared — eight places for one bento illustration, and no way
 * to tell whether you got them all. This keeps the entry and repoints the
 * content in the same request, so a replacement is either complete or refused.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const existing = await queryOne<{ url: string; storage_key: string }>(
    `select url, storage_key from media where id = $1 and deleted_at is null`,
    [id],
  )
  if (!existing) return fail(404, { code: 'not_found', message: 'That file is not in the library.' })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return invalid([{ path: 'file', message: 'Attach a file.' }])

  const extension = ACCEPTED[file.type]
  if (!extension) {
    return fail(415, {
      code: 'unsupported_type',
      message: `${file.type || 'That file'} is not a file the library accepts.`,
    })
  }
  if (file.size > MAX_BYTES) {
    return fail(413, {
      code: 'too_large',
      message: `Files are limited to ${MAX_BYTES / 1024 / 1024} MB.`,
    })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  let width: number | null = null
  let height: number | null = null
  if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
    try {
      const sharp = (await import('sharp')).default
      const metadata = await sharp(bytes).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null
    } catch (error) {
      console.warn('[media] could not read dimensions', error)
    }
  }

  const storage = getStorage()
  const key = `${randomUUID()}${extension}`
  const stored = await storage.put(key, bytes, file.type)

  await query(
    `update media set storage_key = $1, url = $2, mime = $3, width = $4, height = $5, size_bytes = $6
      where id = $7`,
    [stored.key, stored.url, file.type, width, height, bytes.byteLength, id],
  )

  const repointed = await repointReferences(existing.url, stored.url)

  // Only after the content no longer names it. A failure above leaves the old
  // file in place and the entry pointing at it, which is a state you can retry
  // from; deleting first would not be.
  await storage.remove(existing.storage_key).catch((error) => {
    console.warn('[media] could not remove the replaced file', error)
  })

  await audit({
    actorId: auth.user.id,
    action: 'media.replace',
    entityType: 'media',
    entityId: id,
    ip: clientIp(request),
    diff: { mime: file.type, bytes: bytes.byteLength, repointed },
  })

  return ok({ id, url: stored.url, mime: file.type, width, height, repointed })
}
