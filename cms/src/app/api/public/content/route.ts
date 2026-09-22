import { NextResponse } from 'next/server'
import { isLocale, SOURCE_LOCALE } from '@norav/content-schema'
import { queryOne } from '@/lib/db'
import { withCors } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The published snapshot for one locale.
 *
 * `?v=<version>&c=<checksum>` addresses an immutable document, so it is cached
 * forever; without the checksum the endpoint serves the version, or "latest",
 * with a short TTL.
 *
 * The checksum is what makes the address immutable, not the version. A version
 * number is only unique within one database: a laptop that recreates its
 * embedded database counts from one again, and "v=36" comes round a second time
 * naming different content. A browser told the first was immutable keeps
 * serving it — reload or not — for as long as the number alone is the address.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const localeParam = url.searchParams.get('locale') ?? SOURCE_LOCALE
  const versionParam = url.searchParams.get('v')
  const checksumParam = url.searchParams.get('c')

  if (!isLocale(localeParam)) {
    return withCors(
      NextResponse.json(
        { error: { code: 'invalid_locale', message: `Unsupported locale "${localeParam}".` } },
        { status: 400 },
      ),
      request,
    )
  }

  type Row = { payload: { locales: Record<string, unknown> }; checksum: string }
  const row = versionParam
    ? await queryOne<Row>(`select payload, checksum from publications where version = $1`, [
        Number(versionParam),
      ])
    : await queryOne<Row>(`select payload, checksum from publications order by version desc limit 1`)

  // A version that exists but is not the document asked for is the case above
  // in the flesh: the number has been reused. Nothing is the right answer.
  if (!row || (checksumParam && checksumParam !== row.checksum)) {
    return withCors(
      NextResponse.json(
        { error: { code: 'not_published', message: 'Nothing has been published yet.' } },
        { status: 404 },
      ),
      request,
    )
  }

  const snapshot = row.payload.locales[localeParam]
  const response = NextResponse.json(snapshot, {
    headers: {
      'Cache-Control':
        versionParam && checksumParam
          ? 'public, max-age=31536000, immutable'
          : 'public, s-maxage=60, stale-while-revalidate=600',
    },
  })
  return withCors(response, request)
}

export async function OPTIONS(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request)
}
