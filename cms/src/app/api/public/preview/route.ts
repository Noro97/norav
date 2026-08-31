import { NextResponse } from 'next/server'
import { isLocale, SOURCE_LOCALE } from '@norav/content-schema'
import { withCors } from '@/lib/http'
import { buildPublication } from '@/lib/publish'
import { isPreviewTokenValid } from '@/lib/preview'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The draft, as the site would render it.
 *
 * The same builder publishing runs, without the storing — so what a preview
 * shows and what a publish would produce cannot drift. Never cached: a draft
 * that is one edit old is the one thing a preview must not show.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!(await isPreviewTokenValid(token))) {
    return withCors(
      NextResponse.json(
        { error: { code: 'preview_expired', message: 'This preview link is no longer valid.' } },
        { status: 401 },
      ),
      request,
    )
  }

  const locale = url.searchParams.get('locale') ?? SOURCE_LOCALE
  if (!isLocale(locale)) {
    return withCors(
      NextResponse.json(
        { error: { code: 'invalid_locale', message: `Unsupported locale "${locale}".` } },
        { status: 400 },
      ),
      request,
    )
  }

  const built = await buildPublication()
  if (built.ok === false) {
    return withCors(
      NextResponse.json(
        {
          error: {
            code: 'draft_invalid',
            message: 'The draft cannot be rendered yet.',
            fields: built.problems,
          },
        },
        { status: 422 },
      ),
      request,
    )
  }

  return withCors(
    NextResponse.json(built.payload.locales[locale], {
      headers: { 'Cache-Control': 'no-store' },
    }),
    request,
  )
}

export async function OPTIONS(request: Request) {
  return withCors(new NextResponse(null, { status: 204 }), request)
}
