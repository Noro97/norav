import { z } from 'zod'
import { DEFAULT_THEME, deriveThemeTokens, themeSchema } from '@norav/content-schema'
import { query, queryOne } from '@/lib/db'
import { clientIp, requireUser } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { fail, invalid, ok } from '@/lib/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Site-wide settings, one row per key.
 *
 * Each key validates against its own schema, so a setting cannot be saved in a
 * shape the site would not know how to render. Keys without one are refused
 * outright rather than stored as free-form JSON.
 */
const SCHEMAS: Record<string, z.ZodType> = {
  theme: themeSchema,
  site: z.object({
    cursor: z.boolean(),
    grain: z.boolean(),
    dynamicGrid: z.boolean(),
    /** Which shape the active-link indicator in the nav takes. */
    navIndicator: z.enum(['dot', 'gooey']).default('dot'),
  }),
}

const DEFAULTS: Record<string, unknown> = {
  theme: DEFAULT_THEME,
  site: { cursor: true, grain: true, dynamicGrid: true, navIndicator: 'dot' },
}

export async function GET(request: Request, context: { params: Promise<{ key: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { key } = await context.params
  const schema = SCHEMAS[key]
  if (!schema) return fail(404, { code: 'unknown_setting', message: `No setting "${key}".` })

  const row = await queryOne<{ value: unknown }>(`select value from settings where key = $1`, [key])
  const parsed = schema.safeParse(row?.value)
  const value = parsed.success ? parsed.data : DEFAULTS[key]

  // The derived palette travels with the theme so the editor can preview what
  // publishing would produce, without duplicating the derivation.
  const derived = key === 'theme' ? deriveThemeTokens(value as never) : undefined

  return ok({ key, value, derived })
}

export async function PUT(request: Request, context: { params: Promise<{ key: string }> }) {
  const auth = await requireUser(request)
  if ('response' in auth) return auth.response

  const { key } = await context.params
  const schema = SCHEMAS[key]
  if (!schema) return fail(404, { code: 'unknown_setting', message: `No setting "${key}".` })

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return invalid(parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })))
  }

  const previous = await queryOne<{ value: unknown }>(
    `select value from settings where key = $1`,
    [key],
  )
  if (previous) {
    await query(
      `insert into revisions (entity_type, entity_key, data, author_id) values ('settings', $1, $2, $3)`,
      [key, JSON.stringify(previous.value), auth.user.id],
    )
  }

  await query(
    `insert into settings (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value`,
    [key, JSON.stringify(parsed.data)],
  )

  await audit({
    actorId: auth.user.id,
    action: 'settings.update',
    entityType: 'settings',
    ip: clientIp(request),
    diff: { key },
  })

  const derived = key === 'theme' ? deriveThemeTokens(parsed.data as never) : undefined
  return ok({ key, value: parsed.data, derived })
}
