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
/**
 * Who may read the public API from a browser.
 *
 * A list rather than one value, so a laptop can point at the deployed CMS and
 * see what is actually published — without which local development runs
 * against whatever content happens to be committed, and a change made in the
 * admin is invisible until someone rebuilds.
 *
 * Still a list and not `*`: these responses are public, but an allowlist is
 * the difference between a decision and an omission. Set it as
 * SITE_ORIGIN=https://norav.dev,http://localhost:5173
 */
function allowedOrigins(): string[] {
  return (process.env.SITE_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

export function withCors(response: NextResponse, request?: Request): NextResponse {
  const allowed = allowedOrigins()
  const asked = request?.headers.get('origin')?.replace(/\/$/, '') ?? null

  // Unset means unrestricted, which is what local development wants and what
  // production never has. Otherwise: echo the caller's origin when it is on the
  // list, and fall back to the first entry so the header is never absent.
  const value = allowed.length === 0 ? '*' : asked && allowed.includes(asked) ? asked : allowed[0]!

  response.headers.set('Access-Control-Allow-Origin', value)
  // Without this a CDN would serve one origin's header to another.
  response.headers.set('Vary', 'Origin')
  return response
}
