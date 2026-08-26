import { redirect } from 'next/navigation'
import { listBlockDefinitions, LOCALES, SOURCE_LOCALE } from '@norav/content-schema'
import { getSessionUser } from '@/lib/session'
import { query, queryOne } from '@/lib/db'
import { Editor, type EditorBlock } from '@/components/Editor'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGE_SLUG = 'home'

export default async function AdminPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const page = await queryOne<{ id: string }>(`select id from pages where slug = $1`, [PAGE_SLUG])

  const blocks = page
    ? await query<EditorBlock>(
        `select b.id, b.type, b.anchor_id, b.is_visible, b.settings, b.version,
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
    : []

  return (
    <Editor
      pageSlug={PAGE_SLUG}
      blocks={blocks}
      definitions={listBlockDefinitions()}
      locales={LOCALES}
      sourceLocale={SOURCE_LOCALE}
      userEmail={user.email}
    />
  )
}
