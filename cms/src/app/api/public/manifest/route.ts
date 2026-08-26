import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { withCors } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * What the site polls in the background to notice that the copy baked into its
 * bundle is out of date. Small and short-lived on purpose.
 */
export async function GET() {
  const row = await queryOne<{ version: string; published_at: string; checksum: string }>(
    `select version::text, published_at, checksum from publications order by version desc limit 1`,
  )

  const body = row
    ? {
        version: Number(row.version),
        publishedAt: new Date(row.published_at).toISOString(),
        checksum: row.checksum,
      }
    : { version: 0, publishedAt: new Date(0).toISOString(), checksum: '' }

  const response = NextResponse.json(body, {
    headers: {
      // max-age=0 keeps this out of the browser's own cache — a client holding a
      // stale manifest would never notice a publish. The CDN still absorbs the
      // traffic through s-maxage.
      'Cache-Control': 'public, max-age=0, must-revalidate, s-maxage=60, stale-while-revalidate=600',
    },
  })
  return withCors(response)
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }))
}
