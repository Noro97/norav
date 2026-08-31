import { NextResponse } from 'next/server'
import { isLocale, SOURCE_LOCALE } from '@norav/content-schema'
import { queryOne } from '@/lib/db'
import { withCors } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The published snapshot for one locale.
 *
 * `?v=<version>` addresses an immutable document, so it is cached forever;
 * without it the endpoint serves "latest" with a short TTL.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const localeParam = url.searchParams.get('locale') ?? SOURCE_LOCALE
  const versionParam = url.searchParams.get('v')

  if (!isLocale(localeParam)) {
    return withCors(
      NextResponse.json(
        { error: { code: 'invalid_locale', message: `Unsupported locale "${localeParam}".` } },
        { status: 400 },
      ),
      request,
    )
  }

  const row = versionParam
    ? await queryOne<{ payload: { locales: Record<string, unknown> } }>(
        `select payload from publications where version = $1`,
        [Number(versionParam)],
      )
    : await queryOne<{ payload: { locales: Record<string, unknown> } }>(
        `select payload from publications order by version desc limit 1`,
      )

  if (!row) {
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
      'Cache-Control': versionParam
        ? 'public, max-age=31536000, immutable'
        : 'public, s-maxage=60, stale-while-revalidate=600',
    },
  })
  return withCors(response, request)
}

export async function OPTIONS(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request)
}
