import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { query, queryOne } from './db'

export const SESSION_COOKIE = 'norav_cms_session'
const SESSION_DAYS = 30

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: 'owner' | 'editor'
}

/** Only the digest is persisted, so a database dump cannot be replayed. */
function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<void> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await query(
    `insert into sessions (user_id, token_hash, expires_at, ip, user_agent)
     values ($1, $2, $3, $4, $5)`,
    [userId, digest(token), expiresAt.toISOString(), meta.ip || null, meta.userAgent || null],
  )

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const row = await queryOne<SessionUser & { session_id: string }>(
    `select u.id, u.email, u.name, u.role, s.id as session_id
       from sessions s
       join admin_users u on u.id = s.user_id
      where s.token_hash = $1
        and s.revoked_at is null
        and s.expires_at > now()
        and u.is_active`,
    [digest(token)],
  )
  if (!row) return null

  // Cheap liveness signal for the sessions list; not on the hot path of a render.
  await query(`update sessions set last_seen_at = now() where id = $1`, [row.session_id])
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await query(`update sessions set revoked_at = now() where token_hash = $1`, [digest(token)])
  }
  store.delete(SESSION_COOKIE)
}

/** Throttle key is (identifier, ip); success clears it. */
export async function registerFailedLogin(identifier: string, ip: string): Promise<void> {
  await query(
    `insert into login_attempts (identifier, ip, failures, window_start)
     values ($1, $2, 1, now())
     on conflict (identifier, ip) do update
       set failures = case
             when login_attempts.window_start < now() - interval '15 minutes' then 1
             else login_attempts.failures + 1 end,
           window_start = case
             when login_attempts.window_start < now() - interval '15 minutes' then now()
             else login_attempts.window_start end`,
    [identifier, ip],
  )
}

export async function clearFailedLogins(identifier: string, ip: string): Promise<void> {
  await query(`delete from login_attempts where identifier = $1 and ip = $2`, [identifier, ip])
}

export async function isLoginThrottled(identifier: string, ip: string): Promise<boolean> {
  const row = await queryOne<{ failures: number }>(
    `select failures from login_attempts
      where identifier = $1 and ip = $2 and window_start > now() - interval '15 minutes'`,
    [identifier, ip],
  )
  return (row?.failures ?? 0) >= 5
}
