import { getSessionUser, type SessionUser } from './session'
import { isSameOrigin, unauthorized, forbidden } from './http'
import type { NextResponse } from 'next/server'

export type AuthResult = { user: SessionUser } | { response: NextResponse }

/**
 * Gate for every admin route: a valid session, and — for anything that writes —
 * a same-origin request.
 */
export async function requireUser(request: Request): Promise<AuthResult> {
  const mutating = request.method !== 'GET' && request.method !== 'HEAD'
  if (mutating && !isSameOrigin(request)) return { response: forbidden() }

  const user = await getSessionUser()
  if (!user) return { response: unauthorized() }
  return { user }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || '127.0.0.1'
}
