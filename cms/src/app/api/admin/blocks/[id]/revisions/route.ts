import { LOCALES, type Locale } from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { fail, notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Enough to undo a bad afternoon. The rest stay in the table. */
const LISTED = 30

/**
 * A section's earlier texts in one language, newest first.
 *
 * Each save writes what it replaced, so a revision is the text as it stood
 * until `replacedAt`, and `replacedBy` is whoever saved over it. Nothing here
 * writes: the editor loads a revision into the form, and the ordinary save
 * validates it and keeps the current text as a revision in turn.
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const locale = new URL(request.url).searchParams.get('locale')
  if (!LOCALES.includes(locale as Locale)) {
    return fail(422, { code: 'invalid', message: `locale must be one of ${LOCALES.join(', ')}.` })
  }

  const block = await queryOne<{ id: string }>(`select id from blocks where id = $1 and deleted_at is null`, [id])
  if (!block) return notFound('Block')

  const revisions = await query<{ id: string; content: unknown; replacedAt: string; replacedBy: string | null }>(
    `select r.id::text, r.data as content, r.created_at as "replacedAt", u.email as "replacedBy"
       from revisions r
       left join admin_users u on u.id = r.author_id
      where r.entity_type = 'block' and r.entity_id = $1 and r.locale = $2
      order by r.created_at desc, r.id desc
      limit $3`,
    [id, locale, LISTED],
  )

  return ok({ revisions })
}
