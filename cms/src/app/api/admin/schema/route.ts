import {
  listBlockDefinitions,
  listCollectionDefinitions,
  LOCALES,
  SOURCE_LOCALE,
} from '@norav/content-schema'
import { requireUser } from '@/lib/auth'
import { ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The admin builds its forms from this payload, so adding a block type ships
 * without touching the editor UI.
 */
export async function GET(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  return ok({
    locales: LOCALES,
    sourceLocale: SOURCE_LOCALE,
    blocks: listBlockDefinitions(),
    collections: listCollectionDefinitions(),
  })
}
