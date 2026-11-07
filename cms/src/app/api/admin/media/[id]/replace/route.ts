import { randomUUID } from 'node:crypto'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'
import { getStorage } from '@/lib/storage'
import { findLiveFile, inspectFile, swapFile } from '@/lib/media-library'
import { MIME_EXTENSIONS, uploadProblem } from '@/lib/media-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Replaces a library file through this function. See `swapFile`, and `media/direct` for large ones. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const existing = await findLiveFile(id)
  if (!existing) return fail(404, { code: 'not_found', message: 'That file is not in the library.' })

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return invalid([{ path: 'file', message: 'Attach a file.' }])

  const problem = uploadProblem(file.type, file.size)
  if (problem) return fail(problem.status, { code: problem.code, message: problem.message })

  const bytes = Buffer.from(await file.arrayBuffer())
  const { width, height, problem: unsafe } = await inspectFile(file.type, bytes)
  if (unsafe) return fail(422, { code: 'unsafe_svg', message: unsafe })

  const stored = await getStorage().put(`${randomUUID()}${MIME_EXTENSIONS[file.type]}`, bytes, file.type)
  const repointed = await swapFile(id, existing, {
    key: stored.key,
    url: stored.url,
    mime: file.type,
    width,
    height,
    bytes: bytes.byteLength,
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
