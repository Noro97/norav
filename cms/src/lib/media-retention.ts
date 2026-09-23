import { query, queryOne } from './db'
import { getStorage } from './storage'

/**
 * How many publications back a file must be unnamed before its bytes go.
 *
 * Not just the latest: the site paints first from the snapshot baked into its
 * bundle at build time, which can be several publishes behind until the next
 * deploy. Ten covers that gap with room to spare, and a portfolio's storage
 * does not notice a few superseded files.
 */
export const RETAINED_PUBLICATIONS = 10

/** Whether any recent publication still names this URL. */
export async function isPublished(url: string): Promise<boolean> {
  const row = await queryOne<{ published: boolean }>(
    `select exists (
       select 1 from (
         select payload from publications order by version desc limit $2
       ) recent
        where strpos(recent.payload::text, $1) > 0
     ) as published`,
    [url, RETAINED_PUBLICATIONS],
  )
  return row?.published ?? false
}

/**
 * Removes the bytes of a soft-deleted row now if nothing live names them, and
 * leaves them for `purgeRetired` otherwise. Returns whether they went.
 */
export async function purgeIfUnpublished(row: {
  id: string
  storage_key: string
  url: string
}): Promise<boolean> {
  if (await isPublished(row.url)) return false
  await getStorage().remove(row.storage_key)
  await query(`update media set purged_at = now() where id = $1`, [row.id])
  return true
}

/**
 * The sweep, run after each publish: every retired file whose URL the recent
 * publications have stopped naming loses its bytes. Best-effort — a file that
 * fails to delete keeps its null `purged_at` and is tried again next time.
 */
export async function purgeRetired(): Promise<number> {
  const retired = await query<{ id: string; storage_key: string; url: string }>(
    `select id, storage_key, url from media
      where deleted_at is not null and purged_at is null`,
  )

  let purged = 0
  for (const row of retired) {
    try {
      if (await purgeIfUnpublished(row)) purged++
    } catch (error) {
      console.warn('[media] could not purge a retired file', row.storage_key, error)
    }
  }
  return purged
}
