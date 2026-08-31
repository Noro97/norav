import { NextResponse } from 'next/server'
import { getStorage } from '@/lib/storage'
import { withCors } from '@/lib/http'

export const runtime = 'nodejs'

/**
 * Serves files held by the local driver. In production the blob store serves
 * its own URLs and this route is never reached.
 */
export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  const storage = getStorage()
  if (!storage.read) return new NextResponse(null, { status: 404 })

  const { key } = await context.params
  // The key is a generated uuid plus an extension; anything else is a probe.
  if (!/^[0-9a-f-]{36}\.[a-z0-9]{2,5}$/i.test(key)) {
    return new NextResponse(null, { status: 400 })
  }

  const file = await storage.read(key)
  if (!file) return new NextResponse(null, { status: 404 })

  return withCors(
    new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        'Content-Type': file.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }),
    request,
  )
}
