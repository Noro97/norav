import { audit } from '@/lib/audit'
import { queryOne } from '@/lib/db'
import { purgeRetired } from '@/lib/media-retention'
import { buildPublication, stampVersion, type PublishProblem } from '@/lib/publish'
import { LOCALES } from '@norav/content-schema'

export type PublishOutcome =
  | { ok: false; problems: PublishProblem[] }
  | { ok: true; unchanged: true; version: number; checksum: string }
  | {
      ok: true
      unchanged: false
      version: number
      checksum: string
      publishedAt: string | undefined
      purged: number
      rebuild: 'triggered' | 'not_configured' | 'failed'
    }

/** The CMS's Publish button and `npm run release` both land here, so they can't drift apart. */
export async function publishDrafts(options: {
  note?: string
  actorId: string | null
  ip?: string | null
}): Promise<PublishOutcome> {
  const built = await buildPublication()
  if (!built.ok) return { ok: false, problems: built.problems }

  const previous = await queryOne<{ checksum: string; version: string }>(
    `select checksum, version::text from publications
     order by publications.version desc limit 1`,
  )
  if (previous?.checksum === built.checksum) {
    return { ok: true, unchanged: true, version: Number(previous.version), checksum: built.checksum }
  }

  const row = await queryOne<{ version: string; published_at: string }>(
    `insert into publications (payload, locales, checksum, note, author_id)
     values ($1, $2, $3, $4, $5)
     returning version::text, published_at`,
    [
      JSON.stringify(built.payload),
      LOCALES as unknown as string[],
      built.checksum,
      options.note ?? null,
      options.actorId,
    ],
  )

  const version = Number(row?.version ?? 0)
  // The version is only known after the insert, so it is stamped into the
  // stored document in a second write rather than guessed beforehand.
  await queryOne(`update publications set payload = $2 where version = $1`, [
    version,
    JSON.stringify(stampVersion(built.payload, version)),
  ])

  await audit({
    actorId: options.actorId,
    action: 'publish',
    entityType: 'page',
    ip: options.ip,
    diff: { version, checksum: built.checksum, note: options.note },
  })

  // Files retired since the last publish may have just stopped being shown.
  // A failed sweep costs storage, not the publish, and is retried next time.
  const purged = await purgeRetired().catch((error) => {
    console.warn('[media] purge after publish failed', error)
    return 0
  })

  return {
    ok: true,
    unchanged: false,
    version,
    checksum: built.checksum,
    publishedAt: row?.published_at,
    purged,
    rebuild: await triggerSiteRebuild(),
  }
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
async function triggerSiteRebuild(): Promise<'triggered' | 'not_configured' | 'failed'> {
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
