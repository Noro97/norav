import { query } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { ok } from '@/lib/http'
import { buildPublication } from '@/lib/publish'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** More than a portfolio publishes in a long while. Older ones stay readable by `?v=`. */
const LISTED = 100

/**
 * Every recent version, newest first, and whether the drafts match the one
 * that's live. After a restore they usually don't, and that's the one thing
 * about the drafts this screen has to say.
 */
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const publications = await query<{
    version: string
    publishedAt: string
    note: string | null
    checksum: string
    restoredFrom: string | null
    author: string | null
  }>(
    `select p.version::text, p.published_at as "publishedAt", p.note, p.checksum,
            p.restored_from::text as "restoredFrom", u.email as author
       from publications p
       left join admin_users u on u.id = p.author_id
      order by p.version desc
      limit $1`,
    [LISTED],
  )

  const live = publications[0]
  const built = await buildPublication()
  const drafts = !built.ok ? 'blocked' : built.checksum === live?.checksum ? 'match' : 'differ'

  return ok({
    drafts,
    publications: publications.map((row) => ({
      ...row,
      version: Number(row.version),
      restoredFrom: row.restoredFrom === null ? null : Number(row.restoredFrom),
    })),
  })
}
