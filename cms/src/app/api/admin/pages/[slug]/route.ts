import { query, queryOne } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { notFound, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface BlockRow {
  id: string
  type: string
  position: string
  anchor_id: string | null
  is_visible: boolean
  settings: Record<string, unknown>
  version: number
  updated_at: string
  translations: Record<string, { content: Record<string, unknown>; status: string }>
}

/** The editor's read model: a page with its blocks and every translation. */
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { slug } = await context.params
  const page = await queryOne<{ id: string; slug: string; status: string; seo: unknown }>(
    `select id, slug, status, seo from pages where slug = $1`,
    [slug],
  )
  if (!page) return notFound('Page')

  const blocks = await query<BlockRow>(
    `select b.id, b.type, b.position::text, b.anchor_id, b.is_visible, b.settings, b.version, b.updated_at,
            coalesce(
              jsonb_object_agg(t.locale, jsonb_build_object('content', t.content, 'status', t.status))
                filter (where t.locale is not null),
              '{}'::jsonb
            ) as translations
       from blocks b
       left join block_translations t on t.block_id = b.id
      where b.page_id = $1 and b.deleted_at is null
      group by b.id
      order by b.position`,
    [page.id],
  )

  return ok({ page, blocks })
}
