import { randomUUID } from 'node:crypto'
import { query } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'
import { getStorage } from '@/lib/storage'
import { findUsage } from '@/lib/content-references'
import { addFile, inspectFile } from '@/lib/media-library'
import { MIME_EXTENSIONS, uploadProblem } from '@/lib/media-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface MediaRow {
  id: string
  url: string
  mime: string
  width: number | null
  height: number | null
  size_bytes: string | null
  alt: Record<string, string>
  created_at: string
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const media = await query<MediaRow>(
    `select id, url, mime, width, height, size_bytes::text, alt, created_at
       from media where deleted_at is null order by created_at desc limit 200`,
  )

  // Carried on the list rather than fetched per file: the whole reason to show
  // it is the moment before a delete, and a count that arrives after the click
  // is too late to be worth anything.
  const usage = await findUsage(media)

  return ok({
    media: media.map((item) => ({ ...item, usedBy: usage.get(item.id) ?? [] })),
    storage: getStorage().kind,
  })
}

/**
 * Takes a file through this function: everything on the embedded setup, and on
 * Vercel whatever fits. Larger files and video go through `media/direct`.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return invalid([{ path: 'file', message: 'Attach a file.' }])
  }

  const problem = uploadProblem(file.type, file.size)
  if (problem) return fail(problem.status, { code: problem.code, message: problem.message })

  const bytes = Buffer.from(await file.arrayBuffer())
  const { width, height, problem: unsafe } = await inspectFile(file.type, bytes)
  if (unsafe) return fail(422, { code: 'unsafe_svg', message: unsafe })

  const stored = await getStorage().put(`${randomUUID()}${MIME_EXTENSIONS[file.type]}`, bytes, file.type)
  const id = await addFile(
    { key: stored.key, url: stored.url, mime: file.type, width, height, bytes: bytes.byteLength },
    file.name,
  )

  await audit({
    actorId: auth.user.id,
    action: 'media.upload',
    entityType: 'media',
    entityId: id ?? null,
    ip: clientIp(request),
    diff: { mime: file.type, bytes: bytes.byteLength },
  })

  return ok({ id, url: stored.url, mime: file.type, width, height }, { status: 201 })
}
