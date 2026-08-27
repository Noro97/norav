import { createHash, randomBytes } from 'node:crypto'
import { query, queryOne } from './db'

/**
 * Keys that let the site render what has not been published.
 *
 * Short-lived on purpose. The token travels in a URL — pasted into a browser,
 * forwarded to whoever is reviewing, written into a server log — so the useful
 * question is not whether it will leak but how long a leaked one is worth
 * anything. Thirty minutes is long enough to look at a page and short enough
 * that a stale link in a chat is already dead.
 */
const LIFETIME_MINUTES = 30

function digest(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function createPreviewToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + LIFETIME_MINUTES * 60 * 1000)

  await query(
    `insert into preview_tokens (token_hash, created_by, expires_at) values ($1, $2, $3)`,
    [digest(token), userId, expiresAt.toISOString()],
  )

  // Cheap sweep on the way past, so expired rows do not accumulate for want of
  // a scheduled job.
  await query(`delete from preview_tokens where expires_at < now() - interval '1 day'`)

  return { token, expiresAt }
}

export async function isPreviewTokenValid(token: string | null): Promise<boolean> {
  if (!token) return false
  const row = await queryOne<{ token_hash: string }>(
    `select token_hash from preview_tokens where token_hash = $1 and expires_at > now()`,
    [digest(token)],
  )
  return Boolean(row)
}
