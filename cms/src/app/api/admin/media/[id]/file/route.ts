import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { notFound } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Where a `media:<id>` reference points right now, for the admin's thumbnails.
 *
 * A redirect rather than the URL written into the form: the form holds the id,
 * and a file replaced in another tab should show its new picture here without
 * the form being told. Not cached for the same reason.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  if (!/^[0-9a-f-]{36}$/i.test(id)) return notFound('File')

  const media = await queryOne<{ url: string }>(
    `select url from media where id = $1 and deleted_at is null`,
    [id],
  )
  if (!media) return notFound('File')

  const response = NextResponse.redirect(new URL(media.url, request.url), 302)
  response.headers.set('Cache-Control', 'no-store')
  return response
}
