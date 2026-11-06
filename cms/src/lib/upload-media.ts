import { goesDirect, MIME_EXTENSIONS, uploadProblem } from './media-types'

export type UploadResult = { ok: true; repointed?: number } | { ok: false; message: string }

interface UploadOptions {
  /** Where the library keeps its files: what `GET /api/admin/media` says. */
  storage: string
  /** The library entry this file takes over, if it's a replacement. */
  replaces?: string
  onProgress?: (percent: number) => void
}

/** Sends one file by whichever route it needs. See `media-types` for why there are two. */
export async function uploadMedia(file: File, options: UploadOptions): Promise<UploadResult> {
  const problem = uploadProblem(file.type, file.size)
  if (problem) return { ok: false, message: `${file.name}: ${problem.message}` }

  try {
    const response = goesDirect(file.type, file.size, options.storage)
      ? await sendDirect(file, options)
      : await sendThroughServer(file, options)
    const body = await response.json().catch(() => null)
    if (!response.ok) return { ok: false, message: body?.error?.message ?? `Could not upload ${file.name}.` }
    return { ok: true, repointed: body?.data?.repointed }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : `Could not upload ${file.name}.` }
  }
}

function sendThroughServer(file: File, { replaces }: UploadOptions): Promise<Response> {
  const form = new FormData()
  form.append('file', file)
  const path = replaces ? `/api/admin/media/${replaces}/replace` : '/api/admin/media'
  return fetch(path, { method: 'POST', body: form })
}

async function sendDirect(file: File, { replaces, onProgress }: UploadOptions): Promise<Response> {
  const { upload } = await import('@vercel/blob/client')
  const blob = await upload(`media/${crypto.randomUUID()}${MIME_EXTENSIONS[file.type]}`, file, {
    access: 'public',
    contentType: file.type,
    handleUploadUrl: '/api/admin/media/direct',
    multipart: true,
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  })
  return fetch('/api/admin/media/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: blob.url, name: file.name, replaces }),
  })
}
