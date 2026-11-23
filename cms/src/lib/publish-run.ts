import { audit } from '@/lib/audit'
import { queryOne } from '@/lib/db'
import { purgeRetired } from '@/lib/media-retention'
import {
  buildPublication,
  stampVersion,
  type PublicationPayload,
  type PublishProblem,
} from '@/lib/publish'
import { LOCALES } from '@norav/content-schema'

export type Rebuild = 'triggered' | 'not_configured' | 'failed'

export type PublishOutcome =
  | { ok: false; problems: PublishProblem[] }
  /** The site shows a restore, and publishing would replace it with the drafts. */
  | { ok: false; restoreLive: { version: number; restoredFrom: number } }
  | { ok: true; unchanged: true; version: number; checksum: string }
  | {
      ok: true
      unchanged: false
      version: number
      checksum: string
      publishedAt: string | undefined
      purged: number
      rebuild: Rebuild
    }

export interface LivePublication {
  version: number
  checksum: string
  restoredFrom: number | null
}

/** What the site shows now: the newest publication. */
export async function livePublication(): Promise<LivePublication | null> {
  const row = await queryOne<{ version: string; checksum: string; restored_from: string | null }>(
    `select version::text, checksum, restored_from::text from publications
     order by publications.version desc limit 1`,
  )
  if (!row) return null
  return {
    version: Number(row.version),
    checksum: row.checksum,
    restoredFrom: row.restored_from === null ? null : Number(row.restored_from),
  }
}

/** The CMS's Publish button and `npm run release` both land here, so they can't drift apart. */
export async function publishDrafts(options: {
  note?: string
  actorId: string | null
  ip?: string | null
  /**
   * A restore leaves the drafts as they were, so publishing them puts back what
   * the restore took off the site. That has to be said once, so the caller
   * passes this after asking.
   */
  replaceRestore?: boolean
}): Promise<PublishOutcome> {
  const built = await buildPublication()
  if (!built.ok) return { ok: false, problems: built.problems }

  const live = await livePublication()
  if (live?.checksum === built.checksum) {
    return { ok: true, unchanged: true, version: live.version, checksum: built.checksum }
  }
  if (live?.restoredFrom != null && !options.replaceRestore) {
    return { ok: false, restoreLive: { version: live.version, restoredFrom: live.restoredFrom } }
  }

  const recorded = await recordPublication({
    payload: built.payload,
    checksum: built.checksum,
    note: options.note,
    actorId: options.actorId,
  })

  await audit({
    actorId: options.actorId,
    action: 'publish',
    entityType: 'page',
    ip: options.ip,
    diff: { version: recorded.version, checksum: built.checksum, note: options.note },
  })

  return {
    ok: true,
    unchanged: false,
    version: recorded.version,
    checksum: built.checksum,
    publishedAt: recorded.publishedAt,
    ...(await afterPublication()),
  }
}

/** Writes one publication row, publish or restore. */
export async function recordPublication(options: {
  payload: PublicationPayload
  checksum: string
  note?: string
  actorId: string | null
  restoredFrom?: number
}): Promise<{ version: number; publishedAt: string | undefined }> {
  const row = await queryOne<{ version: string; published_at: string }>(
    `insert into publications (payload, locales, checksum, note, author_id, restored_from)
     values ($1, $2, $3, $4, $5, $6)
     returning version::text, published_at`,
    [
      JSON.stringify(options.payload),
      LOCALES as unknown as string[],
      options.checksum,
      options.note ?? null,
      options.actorId,
      options.restoredFrom ?? null,
    ],
  )

  const version = Number(row?.version ?? 0)
  // The version is only known after the insert, so it is stamped into the
  // stored document in a second write rather than guessed beforehand.
  await queryOne(`update publications set payload = $2 where version = $1`, [
    version,
    JSON.stringify(stampVersion(options.payload, version)),
  ])
  return { version, publishedAt: row?.published_at }
}

/** What follows any new publication: the file sweep, and the site's rebuild. */
export async function afterPublication(): Promise<{ purged: number; rebuild: Rebuild }> {
  // Files retired since the last publish may have just stopped being shown.
  // A failed sweep costs storage, not the publish, and is retried next time.
  const purged = await purgeRetired().catch((error) => {
    console.warn('[media] purge after publish failed', error)
    return 0
  })
  return { purged, rebuild: await triggerSiteRebuild() }
}

/**
 * Asks the site to rebuild, so the snapshot baked into its bundle catches up
 * with what was just published.
 *
 * The site does not depend on this: it notices a new version on its own, at
 * runtime, from the manifest. What a rebuild buys is the *first* paint being
 * current too, rather than showing the previous copy for a moment. So a failure
 * here is reported, not raised — the publish itself already succeeded.
 */
async function triggerSiteRebuild(): Promise<Rebuild> {
  const hook = process.env.SITE_DEPLOY_HOOK_URL
  if (!hook) return 'not_configured'

  try {
    const response = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(5000) })
    if (!response.ok) {
      console.error(`[publish] deploy hook returned ${response.status}`)
      return 'failed'
    }
    return 'triggered'
  } catch (error) {
    console.error('[publish] deploy hook unreachable', error)
    return 'failed'
  }
}
