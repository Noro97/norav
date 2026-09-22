import { describe, expect, it, vi } from 'vitest'

/**
 * The route against an in-memory publications table. Only the two queries the
 * route makes are answered; anything else is a test that outgrew this stub.
 */
const published = [
  { version: 36, checksum: 'new-checksum', payload: { locales: { en: { hero: 'new' }, ru: { hero: 'новый' } } } },
]

vi.mock('@/lib/db', () => ({
  queryOne: async (sql: string, params?: unknown[]) => {
    if (sql.includes('where version = $1')) {
      return published.find((row) => row.version === Number(params?.[0]))
    }
    return published[published.length - 1]
  },
}))

const { GET } = await import('../route')

const get = (search: string) => GET(new Request(`http://cms.test/api/public/content?${search}`))

describe('GET /api/public/content', () => {
  it('serves a document addressed by version and checksum as immutable', async () => {
    const response = await get('locale=en&v=36&c=new-checksum')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ hero: 'new' })
    expect(response.headers.get('Cache-Control')).toContain('immutable')
  })

  it('refuses a checksum that does not match the version', async () => {
    // A laptop that recreated its database has handed out "v=36" before, with
    // other content. The stale copy a browser holds is addressed by the old
    // checksum, so it is never served for this one — and a request that names
    // both is answered only when they agree.
    const response = await get('locale=en&v=36&c=old-checksum')
    expect(response.status).toBe(404)
  })

  it('does not call a version alone immutable', async () => {
    // Version numbers repeat across databases; only the checksum names one
    // document. Without it the answer is right today but must not be kept for
    // a year.
    const response = await get('locale=en&v=36')
    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).not.toContain('immutable')
  })

  it('serves the latest with a short TTL when no version is asked for', async () => {
    const response = await get('locale=ru')
    expect(await response.json()).toEqual({ hero: 'новый' })
    expect(response.headers.get('Cache-Control')).not.toContain('immutable')
  })
})
