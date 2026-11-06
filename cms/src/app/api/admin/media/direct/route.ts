import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireUser } from '@/lib/auth'
import { fail } from '@/lib/http'
import { directUploadTarget } from '@/lib/media-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Lets the signed-in browser send one file straight to the blob store.
 *
 * It answers with a short-lived token for exactly one pathname, one content type
 * and that type's size limit, so the store enforces what this route would have.
 * There's no completion callback: it would need a public URL, and the browser
 * reports back to `media/register` instead, where the file is checked again.
 *
 * The answer isn't `{ data }`, because the client library reads it directly.
 */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null
  if (!body) return fail(400, { code: 'invalid', message: 'Expected an upload request.' })

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const target = directUploadTarget(pathname)
        if (!target) throw new Error('That is not a file the library accepts.')
        return {
          allowedContentTypes: [target.mime],
          maximumSizeInBytes: target.maxBytes,
          addRandomSuffix: false,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return fail(400, {
      code: 'upload_refused',
      message: error instanceof Error ? error.message : 'The upload was refused.',
    })
  }
}
