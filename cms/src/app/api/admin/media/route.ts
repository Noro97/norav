import { randomUUID } from 'node:crypto'
import { extname } from 'node:path'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'
import { getStorage } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 12 * 1024 * 1024

/** What the library will accept. Anything else is refused before it is stored. */
const ACCEPTED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

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
  return ok({ media, storage: getStorage().kind })
}

export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return invalid([{ path: 'file', message: 'Attach a file.' }])
  }

  const extension = ACCEPTED[file.type]
  if (!extension) {
    return fail(415, {
      code: 'unsupported_type',
      message: `${file.type || 'That file'} is not an image the library accepts.`,
    })
  }
  if (file.size > MAX_BYTES) {
    return fail(413, {
      code: 'too_large',
      message: `Files are limited to ${MAX_BYTES / 1024 / 1024} MB.`,
    })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  // Dimensions let the site reserve layout space, which is the difference
  // between a smooth load and a jumping page. SVG has none to read.
  let width: number | null = null
  let height: number | null = null
  if (file.type !== 'image/svg+xml') {
    try {
      const sharp = (await import('sharp')).default
      const metadata = await sharp(bytes).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null
    } catch (error) {
      console.warn('[media] could not read dimensions', error)
    }
  }

  const key = `${randomUUID()}${extension}`
  const stored = await getStorage().put(key, bytes, file.type)

  const created = await queryOne<{ id: string }>(
    `insert into media (storage_key, url, mime, width, height, size_bytes, alt)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [
      stored.key,
      stored.url,
      file.type,
      width,
      height,
      bytes.byteLength,
      JSON.stringify({ en: basename(file.name) }),
    ],
  )

  await audit({
    actorId: auth.user.id,
    action: 'media.upload',
    entityType: 'media',
    entityId: created?.id ?? null,
    ip: clientIp(request),
    diff: { mime: file.type, bytes: bytes.byteLength },
  })

  return ok(
    { id: created?.id, url: stored.url, mime: file.type, width, height },
    { status: 201 },
  )
}

/** A readable default for the alt text: the file's name without its extension. */
function basename(name: string): string {
  return name.slice(0, name.length - extname(name).length).replace(/[-_]+/g, ' ').trim()
}
