import { z } from 'zod'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'
import { addFile, findLiveFile, inspectFile, swapFile } from '@/lib/media-library'
import { directUploadTarget, uploadProblem } from '@/lib/media-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const body = z.object({
  url: z.url(),
  name: z.string().max(255),
  /** The library entry this file takes over, if it's a replacement. */
  replaces: z.uuid().optional(),
})

/**
 * Records a file the browser just sent to the blob store, as a new entry or a
 * replacement.
 *
 * The browser's word isn't taken for anything: the store says what the file is and
 * how big, and only a file in this store's `media/` folder can be recorded at all.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const parsed = body.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }
  const { url, name, replaces } = parsed.data

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return fail(409, { code: 'no_blob_store', message: 'This setup has no blob store to read from.' })

  const existing = replaces ? await findLiveFile(replaces) : undefined
  if (replaces && !existing) return fail(404, { code: 'not_found', message: 'That file is not in the library.' })

  const { del, head } = await import('@vercel/blob')
  const blob = await head(url, { token }).catch(() => null)
  const target = blob ? directUploadTarget(blob.pathname) : null
  if (!blob || !target) return fail(404, { code: 'not_found', message: 'That upload is not in the blob store.' })

  const problem = uploadProblem(blob.contentType, blob.size)
  if (problem) {
    await del(blob.url, { token })
    return fail(problem.status, { code: problem.code, message: problem.message })
  }

  // Images are measured like any other. A video is only ever read by the browser.
  let dimensions: { width: number | null; height: number | null } = { width: null, height: null }
  if (blob.contentType.startsWith('image/')) {
    const bytes = Buffer.from(await (await fetch(blob.url)).arrayBuffer())
    dimensions = await inspectFile(blob.contentType, bytes)
  }

  const upload = {
    key: target.key,
    url: blob.url,
    mime: blob.contentType,
    width: dimensions.width,
    height: dimensions.height,
    bytes: blob.size,
  }

  if (replaces && existing) {
    const repointed = await swapFile(replaces, existing, upload)
    await audit({
      actorId: auth.user.id,
      action: 'media.replace',
      entityType: 'media',
      entityId: replaces,
      ip: clientIp(request),
      diff: { mime: upload.mime, bytes: upload.bytes, repointed },
    })
    return ok({ id: replaces, url: blob.url, mime: upload.mime, ...dimensions, repointed })
  }

  const id = await addFile(upload, name)
  await audit({
    actorId: auth.user.id,
    action: 'media.upload',
    entityType: 'media',
    entityId: id ?? null,
    ip: clientIp(request),
    diff: { mime: upload.mime, bytes: upload.bytes },
  })
  return ok({ id, url: blob.url, mime: upload.mime, ...dimensions }, { status: 201 })
}
