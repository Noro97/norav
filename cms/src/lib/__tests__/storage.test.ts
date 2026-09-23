import { afterEach, describe, expect, it, vi } from 'vitest'
import { mayRemoveFiles } from '../storage'

describe('mayRemoveFiles', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('lets the local driver remove its own files', () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')
    vi.stubEnv('DATABASE_URL', '')
    expect(mayRemoveFiles()).toBe(true)
  })

  it('lets a CMS on the real database remove blob files', () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'token')
    vi.stubEnv('DATABASE_URL', 'postgres://neon')
    expect(mayRemoveFiles()).toBe(true)
  })

  it('stops a laptop on the embedded database from removing production blob files', () => {
    // The pairing `npm run dev` gives after `pull:production`: live media rows
    // copied locally, and the live blob token in .env.
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'token')
    vi.stubEnv('DATABASE_URL', '')
    expect(mayRemoveFiles()).toBe(false)
  })
})
