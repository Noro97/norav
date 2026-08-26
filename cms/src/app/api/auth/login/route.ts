import { z } from 'zod'
import { queryOne } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import {
  clearFailedLogins,
  createSession,
  isLoginThrottled,
  registerFailedLogin,
} from '@/lib/session'
import { clientIp } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, isSameOrigin, ok, forbidden } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden()

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }

  const { email, password } = parsed.data
  const ip = clientIp(request)

  if (await isLoginThrottled(email, ip)) {
    return fail(429, {
      code: 'too_many_attempts',
      message: 'Too many attempts. Try again in 15 minutes.',
    })
  }

  const user = await queryOne<{ id: string; password_hash: string; is_active: boolean }>(
    `select id, password_hash, is_active from admin_users where lower(email) = lower($1)`,
    [email],
  )

  // Same response and roughly the same cost whether or not the account exists,
  // so the endpoint does not enumerate users.
  const valid = user?.is_active
    ? await verifyPassword(password, user.password_hash)
    : await verifyPassword(password, 'scrypt$32768$8$1$AAAA$AAAA')

  if (!user || !valid) {
    await registerFailedLogin(email, ip)
    await audit({ action: 'auth.login.failed', ip, diff: { email } })
    return fail(401, { code: 'invalid_credentials', message: 'Wrong email or password.' })
  }

  await clearFailedLogins(email, ip)
  await createSession(user.id, { ip, userAgent: request.headers.get('user-agent') })
  await queryOne(`update admin_users set last_login_at = now() where id = $1`, [user.id])
  await audit({ actorId: user.id, action: 'auth.login', ip })

  return ok({ id: user.id })
}
