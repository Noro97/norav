import { describe, expect, it, afterEach } from 'vitest'
import { describeEnvironment } from '../environment'

const saved = { ...process.env }
afterEach(() => {
  process.env = { ...saved }
})

function env(vercelEnv: string | undefined, databaseUrl: string | undefined) {
  if (vercelEnv === undefined) delete process.env.VERCEL_ENV
  else process.env.VERCEL_ENV = vercelEnv
  if (databaseUrl === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = databaseUrl
  return describeEnvironment()
}

describe('describeEnvironment', () => {
  it('says nothing when production writes to Postgres', () => {
    // The expected arrangement: no warning to give.
    expect(env('production', 'postgres://neon').writingToSharedDataFromElsewhere).toBe(false)
  })

  it('says nothing when a laptop writes to the embedded database', () => {
    expect(env(undefined, undefined).writingToSharedDataFromElsewhere).toBe(false)
  })

  it('warns when a preview build writes to Postgres', () => {
    // Vercel hands preview deployments the production variables unless told
    // otherwise, so this is the default state of every pull request.
    const info = env('preview', 'postgres://neon')
    expect(info.target).toBe('preview')
    expect(info.writingToSharedDataFromElsewhere).toBe(true)
  })

  it('warns when a laptop writes to Postgres', () => {
    // cms/.env holds the production connection string, so `npm run dev` lands
    // here — which is what `dev:local` exists to avoid.
    expect(env(undefined, 'postgres://neon').writingToSharedDataFromElsewhere).toBe(true)
  })
})
