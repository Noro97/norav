/**
 * What the library accepts, and how a file reaches the store.
 *
 * Plain data and no Node imports, because the upload form asks the same questions
 * before it sends anything.
 *
 * On Vercel a function's request body stops at about 4.5 MB, and the platform
 * answers past that before the route runs. So the 12 MB this library used to
 * promise only ever held on a laptop. A file over `FUNCTION_BODY_BYTES`, and every
 * video, goes straight from the browser to the blob store instead, and the server
 * only hands out a token and records the result.
 */
const MB = 1024 * 1024

export const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
}

export const MAX_FILE_BYTES = 12 * MB
export const MAX_VIDEO_BYTES = 50 * MB
/** A little under the platform's limit, to leave room for the multipart form around the file. */
export const FUNCTION_BODY_BYTES = 4 * MB

export const isVideo = (mime: string) => mime.startsWith('video/')

/** An SVG is read on the server to check it's safe to store, so it can't skip the function. */
const SVG = 'image/svg+xml'

export function maxBytesFor(mime: string): number {
  if (mime === SVG) return FUNCTION_BODY_BYTES
  return isVideo(mime) ? MAX_VIDEO_BYTES : MAX_FILE_BYTES
}

export interface UploadProblem {
  status: 413 | 415
  code: 'too_large' | 'unsupported_type'
  message: string
}

/** Why a file can't be stored, or null if it can. */
export function uploadProblem(mime: string, bytes: number): UploadProblem | null {
  if (!MIME_EXTENSIONS[mime]) {
    return {
      status: 415,
      code: 'unsupported_type',
      message: `${mime || 'That file'} is not a file the library accepts.`,
    }
  }
  const limit = maxBytesFor(mime)
  if (bytes > limit) {
    const what = isVideo(mime) ? 'Videos' : mime === SVG ? 'SVGs' : 'Files'
    return { status: 413, code: 'too_large', message: `${what} are limited to ${limit / MB} MB.` }
  }
  return null
}

export function goesDirect(mime: string, bytes: number, storage: string): boolean {
  return storage === 'blob' && mime !== SVG && (isVideo(mime) || bytes > FUNCTION_BODY_BYTES)
}

const DIRECT_PATH = /^media\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]{2,5}))$/

/**
 * What a direct upload to this pathname may be: `media/<uuid>.<ext>`, the same
 * shape the server gives the files it stores itself. Null for anything else.
 */
export function directUploadTarget(pathname: string): { key: string; mime: string; maxBytes: number } | null {
  const match = DIRECT_PATH.exec(pathname)
  if (!match) return null
  const mime = Object.keys(MIME_EXTENSIONS).find((type) => MIME_EXTENSIONS[type] === match[2])
  if (!mime || mime === SVG) return null
  return { key: match[1]!, mime, maxBytes: maxBytesFor(mime) }
}
