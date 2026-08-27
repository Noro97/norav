import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { getStorage } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Whether this deployment is actually wired up.
 *
 * A CMS that boots but cannot reach its database looks identical to a healthy
 * one until someone tries to sign in, so this answers the three questions that
 * a fresh deploy actually raises: is the database reachable, have the
 * migrations been applied, and has anything been published yet.
 *
 * Deliberately unauthenticated and deliberately thin: it reports posture, never
 * content, and never why something failed.
 */
export async function GET() {
  try {
    const migrations = await queryOne<{ count: string }>(
      `select count(*)::text as count from schema_migrations`,
    )
    const publication = await queryOne<{ version: string; published_at: string }>(
      `select version::text, published_at from publications
       order by publications.version desc limit 1`,
    )

    return NextResponse.json(
      {
        status: 'ok',
        database: 'reachable',
        migrations: Number(migrations?.count ?? 0),
        publishedVersion: publication ? Number(publication.version) : null,
        publishedAt: publication?.published_at ?? null,
        storage: getStorage().kind,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[health] database unreachable', error)
    return NextResponse.json(
      { status: 'error', database: 'unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
