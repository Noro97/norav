import { NextResponse } from 'next/server'

/**
 * One response shape for the whole API: `{ data }` on success, `{ error }` on
 * failure, with `error.fields` carrying zod paths so the admin can highlight
 * the offending input instead of showing a toast.
 */
export interface ApiError {
  code: string
  message: string
  fields?: { path: string; message: string }[]
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, init)
}

export function fail(status: number, error: ApiError): NextResponse {
  return NextResponse.json({ error }, { status })
}

export const unauthorized = () =>
  fail(401, { code: 'unauthorized', message: 'Sign in to continue.' })

export const forbidden = () => fail(403, { code: 'forbidden', message: 'Not allowed.' })

export const notFound = (what = 'Resource') =>
  fail(404, { code: 'not_found', message: `${what} not found.` })

export const conflict = (message: string) => fail(409, { code: 'conflict', message })

export const invalid = (fields: { path: string; message: string }[]) =>
  fail(422, { code: 'invalid', message: 'Validation failed.', fields })

/**
 * SameSite=Lax already blocks cross-site cookie sends on anything but top-level
 * GETs; this closes the remaining gap for state-changing requests by refusing
 * anything whose Origin is not our own.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // same-origin fetches from some clients omit it
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

/** Public content endpoints are read by the site from another origin. */
export function withCors(response: NextResponse): NextResponse {
  const allowed = process.env.SITE_ORIGIN || '*'
  response.headers.set('Access-Control-Allow-Origin', allowed)
  response.headers.set('Vary', 'Origin')
  return response
}
