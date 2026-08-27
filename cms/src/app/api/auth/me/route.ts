import { getSessionUser } from '@/lib/session'
import { ok, unauthorized } from '@/lib/http'
import { describeEnvironment } from '@/lib/environment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSessionUser()
  // Carried on the session response the editor already fetches at startup,
  // so knowing which database you are about to edit costs no extra request.
  return user ? ok({ ...user, environment: describeEnvironment() }) : unauthorized()
}
