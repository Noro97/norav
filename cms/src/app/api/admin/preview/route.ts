import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { canonicalOrigin, ok } from '@/lib/http'
import { createPreviewToken } from '@/lib/preview'
import { describeEnvironment } from '@/lib/environment'
import { ROOT_SLUG, SLUG } from '@/lib/pages'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Mints a key for looking at the draft, and the address to look at it with. */
export async function POST(request: Request) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { token, expiresAt } = await createPreviewToken(auth.user.id)

  await audit({
    actorId: auth.user.id,
    action: 'preview.create',
    entityType: 'preview',
    entityId: null,
    ip: clientIp(request),
  })

  // The site must be the one that talks to *this* CMS: only this instance can
  // validate the token. A local CMS handing out a norav.dev link would send you
  // to a site that asks production about a token production has never seen, and
  // quietly shows the published copy instead.
  // Which page to open. The reader is looking at one page in the editor, and a
  // preview that always lands on the home page makes them navigate to the thing
  // they were already editing — or, if it is not linked from anywhere yet,
  // guess its address.
  const body = (await request.json().catch(() => null)) as { page?: unknown } | null
  const asked = typeof body?.page === 'string' ? body.page : ROOT_SLUG
  const page = SLUG.test(asked) ? asked : ROOT_SLUG
  const path = page === ROOT_SLUG ? '' : `/${page}`

  const production = describeEnvironment().target === 'production'
  // SITE_ORIGIN is an allowlist, so take the canonical entry: the raw value can
  // name several origins, and a URL can only have one.
  const site = production ? canonicalOrigin() : 'http://localhost:5173'
  return ok({
    // In the fragment: a fragment never reaches a server, so the key stays out
    // of access logs and out of the Referer header of every link on the page.
    url: `${site}${path}/#preview=${token}`,
    expiresAt: expiresAt.toISOString(),
  })
}
