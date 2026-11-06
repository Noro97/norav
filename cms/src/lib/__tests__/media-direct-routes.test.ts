import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The two routes behind a direct upload. Real token generation, which needs no
 * network, and a fake blob store: what's left unproven here is only the browser's
 * PUT to Vercel.
 */
const requireUser = vi.hoisted(() => vi.fn())
const addFile = vi.hoisted(() => vi.fn())
const swapFile = vi.hoisted(() => vi.fn())
const findLiveFile = vi.hoisted(() => vi.fn())
const inspectFile = vi.hoisted(() => vi.fn())
const head = vi.hoisted(() => vi.fn())
const del = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({ requireUser, clientIp: () => '127.0.0.1' }))
vi.mock('@/lib/audit', () => ({ audit: vi.fn() }))
vi.mock('@/lib/media-library', () => ({ addFile, swapFile, findLiveFile, inspectFile }))
vi.mock('@vercel/blob', async (original) => ({ ...(await original<object>()), head, del }))

const { POST: direct } = await import('@/app/api/admin/media/direct/route')
const { POST: register } = await import('@/app/api/admin/media/register/route')

const UUID = '0b4f6c1e-8d2a-4c3b-9e5f-1a2b3c4d5e6f'
const TOKEN = 'vercel_blob_rw_storeid123_secretsecretsecret'
const STORE = 'https://storeid123.public.blob.vercel-storage.com'

const json = (path: string, body: unknown) =>
  new Request(`https://cms.example${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const tokenRequest = (pathname: string) =>
  json('/api/admin/media/direct', {
    type: 'blob.generate-client-token',
    payload: { pathname, clientPayload: null, multipart: true },
  })

const blobAt = (pathname: string, contentType: string, size: number) => ({
  pathname,
  contentType,
  size,
  url: `${STORE}/${pathname}`,
})

beforeEach(() => {
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', TOKEN)
  requireUser.mockResolvedValue({ user: { id: 'owner' } })
  addFile.mockResolvedValue('new-id')
  swapFile.mockResolvedValue(3)
  inspectFile.mockResolvedValue({ width: 800, height: 600 })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('POST media/direct', () => {
  it('refuses anyone who is not signed in', async () => {
    const refused = new Response(null, { status: 401 })
    requireUser.mockResolvedValue({ response: refused })

    expect(await direct(tokenRequest(`media/${UUID}.mp4`))).toBe(refused)
  })

  it('gives a token for one video, limited to its type and size', async () => {
    const response = await direct(tokenRequest(`media/${UUID}.mp4`))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.type).toBe('blob.generate-client-token')

    // A client token is a base64 payload the store reads back.
    const decoded = Buffer.from(body.clientToken.replace('vercel_blob_client_storeid123_', ''), 'base64').toString()
    const payload = JSON.parse(Buffer.from(decoded.split('.')[1]!, 'base64').toString())
    expect(payload).toMatchObject({
      pathname: `media/${UUID}.mp4`,
      allowedContentTypes: ['video/mp4'],
      maximumSizeInBytes: 50 * 1024 * 1024,
      addRandomSuffix: false,
    })
  })

  it.each([
    ['a name the server would not choose', 'media/holiday.mp4'],
    ['somewhere else in the store', `other/${UUID}.mp4`],
    ['an SVG, which has to be checked first', `media/${UUID}.svg`],
  ])('refuses %s', async (_name, pathname) => {
    const response = await direct(tokenRequest(pathname))
    expect(response.status).toBe(400)
    expect((await response.json()).error.code).toBe('upload_refused')
  })
})

describe('POST media/register', () => {
  const upload = { url: `${STORE}/media/${UUID}.mp4`, name: 'proof-reps.mp4' }

  it('records what the store says, not what the browser says', async () => {
    head.mockResolvedValue(blobAt(`media/${UUID}.mp4`, 'video/mp4', 1234))

    const response = await register(json('/api/admin/media/register', upload))

    expect(response.status).toBe(201)
    expect(addFile).toHaveBeenCalledWith(
      { key: `${UUID}.mp4`, url: `${STORE}/media/${UUID}.mp4`, mime: 'video/mp4', width: null, height: null, bytes: 1234 },
      'proof-reps.mp4',
    )
    expect(inspectFile).not.toHaveBeenCalled()
  })

  it('measures an image, which can arrive this way when it is large', async () => {
    head.mockResolvedValue(blobAt(`media/${UUID}.png`, 'image/png', 9_000_000))
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2, 3]))))

    await register(json('/api/admin/media/register', { ...upload, url: `${STORE}/media/${UUID}.png` }))

    expect(addFile.mock.calls[0]![0]).toMatchObject({ width: 800, height: 600 })
  })

  it('removes a file over the limit instead of recording it', async () => {
    head.mockResolvedValue(blobAt(`media/${UUID}.mp4`, 'video/mp4', 60 * 1024 * 1024))

    const response = await register(json('/api/admin/media/register', upload))

    expect(response.status).toBe(413)
    expect(del).toHaveBeenCalledWith(`${STORE}/media/${UUID}.mp4`, { token: TOKEN })
    expect(addFile).not.toHaveBeenCalled()
  })

  it('will not record a file the store does not hold', async () => {
    head.mockRejectedValue(new Error('not found'))

    const response = await register(json('/api/admin/media/register', upload))

    expect(response.status).toBe(404)
    expect(addFile).not.toHaveBeenCalled()
  })

  it('will not record a file from outside the media folder', async () => {
    head.mockResolvedValue(blobAt('secrets/export.mp4', 'video/mp4', 10))

    const response = await register(json('/api/admin/media/register', upload))

    expect(response.status).toBe(404)
    expect(addFile).not.toHaveBeenCalled()
  })

  it('replaces an entry, carrying its references across', async () => {
    const existing = { url: `${STORE}/media/old.mp4`, storage_key: 'old.mp4' }
    findLiveFile.mockResolvedValue(existing)
    head.mockResolvedValue(blobAt(`media/${UUID}.mp4`, 'video/mp4', 1234))

    const response = await register(json('/api/admin/media/register', { ...upload, replaces: UUID }))

    expect(swapFile).toHaveBeenCalledWith(UUID, existing, expect.objectContaining({ key: `${UUID}.mp4` }))
    expect((await response.json()).data.repointed).toBe(3)
    expect(addFile).not.toHaveBeenCalled()
  })

  it('says so when there is no blob store', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')

    const response = await register(json('/api/admin/media/register', upload))

    expect(response.status).toBe(409)
  })
})
