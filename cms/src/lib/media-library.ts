import { extname } from 'node:path'
import { query, queryOne } from './db'
import { repointReferences } from './content-references'
import { purgeIfUnpublished } from './media-retention'
import { inspectSvg } from './svg'

/**
 * The library's rows. Every way a file can arrive ends here, through the server or
 * straight to the blob store, so they can't disagree about what a row holds.
 */
export interface StoredUpload {
  key: string
  url: string
  mime: string
  width: number | null
  height: number | null
  bytes: number
}

export interface LiveFile {
  url: string
  storage_key: string
  mime: string
  width: number | null
  height: number | null
  size_bytes: string | null
  alt: Record<string, string>
}

/**
 * Dimensions let the site reserve layout space, which is the difference between a
 * smooth load and a jumping page. An SVG's come from its own attributes, read while
 * checking it is safe to store. Other images are measured. A video and a PDF have
 * none to read here.
 */
export async function inspectFile(
  mime: string,
  bytes: Buffer,
): Promise<{ width: number | null; height: number | null; problem?: string }> {
  if (mime === 'image/svg+xml') {
    const svg = inspectSvg(bytes)
    return { width: svg.width, height: svg.height, ...(svg.problem ? { problem: svg.problem } : {}) }
  }
  if (!mime.startsWith('image/')) return { width: null, height: null }
  try {
    const sharp = (await import('sharp')).default
    const metadata = await sharp(bytes).metadata()
    return { width: metadata.width ?? null, height: metadata.height ?? null }
  } catch (error) {
    console.warn('[media] could not read dimensions', error)
    return { width: null, height: null }
  }
}

/** A readable default for the alt text: the file's name without its extension. */
function basename(name: string): string {
  return name.slice(0, name.length - extname(name).length).replace(/[-_]+/g, ' ').trim()
}

export async function addFile(upload: StoredUpload, name: string): Promise<string | undefined> {
  const created = await queryOne<{ id: string }>(
    `insert into media (storage_key, url, mime, width, height, size_bytes, alt)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [
      upload.key,
      upload.url,
      upload.mime,
      upload.width,
      upload.height,
      upload.bytes,
      JSON.stringify({ en: basename(name) }),
    ],
  )
  return created?.id
}

export async function findLiveFile(id: string): Promise<LiveFile | undefined> {
  return (
    (await queryOne<LiveFile>(
      `select url, storage_key, mime, width, height, size_bytes::text, alt
         from media where id = $1 and deleted_at is null`,
      [id],
    )) ?? undefined
  )
}

/**
 * Swap the bytes behind a library entry, and carry every reference across.
 *
 * The alternative is uploading the new file and choosing it again everywhere
 * the old one appeared — eight places for one bento illustration, and no way
 * to tell whether you got them all. This keeps the entry and repoints the
 * content in the same request, so a replacement is either complete or refused.
 *
 * Returns how many places in the content now point at the new file.
 */
export async function swapFile(id: string, existing: LiveFile, upload: StoredUpload): Promise<number> {
  await query(
    `update media set storage_key = $1, url = $2, mime = $3, width = $4, height = $5, size_bytes = $6
      where id = $7`,
    [upload.key, upload.url, upload.mime, upload.width, upload.height, upload.bytes, id],
  )

  const repointed = await repointReferences(existing.url, upload.url)

  // The old bytes outlive the drafts that named them: the live publication,
  // and the snapshot baked into the site, still do until the next publish. So
  // they become a retired row of their own — deleted, not yet purged — and go
  // now only if nothing published names them; otherwise the publish sweep
  // takes them. Only after the drafts are repointed, so a failure above leaves
  // the old file in place and the entry pointing at it, which is a state you
  // can retry from.
  const retired = await queryOne<{ id: string }>(
    `insert into media (storage_key, url, mime, width, height, size_bytes, alt, deleted_at)
     values ($1, $2, $3, $4, $5, $6, $7, now()) returning id`,
    [
      existing.storage_key,
      existing.url,
      existing.mime,
      existing.width,
      existing.height,
      existing.size_bytes,
      JSON.stringify(existing.alt),
    ],
  )
  if (retired) {
    await purgeIfUnpublished({ id: retired.id, storage_key: existing.storage_key, url: existing.url }).catch((error) =>
      console.warn('[media] could not remove the replaced file', error),
    )
  }

  return repointed
}
