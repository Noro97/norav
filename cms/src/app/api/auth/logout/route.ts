import { destroySession, getSessionUser } from '@/lib/session'
import { audit } from '@/lib/audit'
import { clientIp } from '@/lib/auth'
import { forbidden, isSameOrigin, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden()
  const user = await getSessionUser()
  await destroySession()
  if (user) await audit({ actorId: user.id, action: 'auth.logout', ip: clientIp(request) })
  return ok({ signedOut: true })
}
