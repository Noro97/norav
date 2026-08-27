import type { EnvironmentInfo } from '@/lib/environment'

/**
 * Who you are signed in as, and what you are about to edit.
 *
 * The second half is the point. Every deployment of this admin looks the same,
 * and Vercel gives preview builds the production environment variables unless
 * told otherwise — so the surest way to edit the live site by accident is to
 * open a pull request's preview and forget which one it is.
 */
export function WorkspaceFooter({
  userEmail,
  environment,
  onSignOut,
}: {
  userEmail: string
  environment?: EnvironmentInfo
  onSignOut: () => void
}) {
  return (
    <>
      {environment?.writingToSharedDataFromElsewhere && (
        <p className="env-warning" role="status">
          <strong>{environment.target === 'preview' ? 'Preview build' : 'Local'}</strong> — edits
          here change the live site.
        </p>
      )}

      <p className="brand-sub" style={{ marginTop: 28, marginBottom: 8 }}>
        {userEmail}
      </p>
      <button className="ghost" type="button" onClick={onSignOut} style={{ width: '100%' }}>
        Sign out
      </button>
    </>
  )
}
