/**
 * Which deployment this instance is, and which database it opened.
 *
 * The admin looks identical wherever it runs, and Vercel hands preview
 * deployments the production environment variables unless told otherwise — so
 * a preview build of a pull request edits the live site, and nothing on screen
 * says so. The same trap exists locally the moment `cms/.env` holds the Neon
 * connection string, which it does.
 */
export interface EnvironmentInfo {
  target: 'production' | 'preview' | 'local'
  database: 'postgres' | 'embedded'
  /** True when writes land in Postgres from somewhere that is not production. */
  writingToSharedDataFromElsewhere: boolean
}

export function describeEnvironment(): EnvironmentInfo {
  const vercelEnv = process.env.VERCEL_ENV
  const target: EnvironmentInfo['target'] =
    vercelEnv === 'production' ? 'production' : vercelEnv === 'preview' ? 'preview' : 'local'

  const database: EnvironmentInfo['database'] = process.env.DATABASE_URL ? 'postgres' : 'embedded'

  return {
    target,
    database,
    writingToSharedDataFromElsewhere: database === 'postgres' && target !== 'production',
  }
}
