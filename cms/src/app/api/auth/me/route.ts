import { getSessionUser } from '@/lib/session'
import { ok, unauthorized } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSessionUser()
  return user ? ok(user) : unauthorized()
}
