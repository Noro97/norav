# Publish runbook

How production content changes. **Sessions run this themselves (D21).** The owner keeps accounts, passwords and environment variables, and reviews new copy once (D23).

## The order

1. **Bring the main checkout up to date.** The scripts read `.env` files that only exist there.
   ```bash
   git -C ~/Desktop/projects/webapp pull --ff-only
   ```
   ```bash
   npm --prefix ~/Desktop/projects/webapp/cms ci
   ```
   ```bash
   npm --prefix ~/Desktop/projects/webapp/db ci
   ```
   If that checkout isn't on `main`, or has changes other than the untracked `norav-logo.svg`, stop and report it.
2. **Note `publishedVersion` and take a backup,** as below. That's the rollback point.
3. **Rehearse.** Restore the backup into a private Postgres, as below, and apply the migrations there. Point `DATABASE_URL` at it and run `npm run release:production -- --dry-run` from your worktree's `cms/`.
4. **Read the dry run.** Validation checks shape, not truth, so this list is the only check on what goes live. Every change must be one you expected, and new copy must be what the owner approved. If not, stop and report it (G2).
5. **Apply the migrations** to production, as below.
6. **Dry-run production:**
   ```bash
   npm --prefix ~/Desktop/projects/webapp/cms run release:production -- --dry-run
   ```
   It should show the same changes and the same checksum as the rehearsal. If not, stop and report it.
7. **Release that checksum:**
   ```bash
   npm --prefix ~/Desktop/projects/webapp/cms run release:production -- --expect <checksum> --note "S4: what changed"
   ```
8. **Check the result,** as below, and open the small PR that refreshes the committed snapshots. `release` reports `rebuild: not_configured`, because the deploy hook lives only on the CMS project, so merging that PR is what rebuilds the site.
9. **Delete the backup** once the result has been checked.

Until step 5, production hasn't changed. Never print a value from a `.env` file, and don't run any other `:production` script.

## How production works

- Merging to `main` deploys the site. The site bakes the latest published snapshot at build time and picks up newer ones at runtime.
- The CMS at `cms.norav.dev` is a separate Vercel project with its own database.
- Publishing writes an immutable row to `publications`. Publish validates every block against the registry and refuses a page that would render broken.
- **Validation checks shape, not truth.** It passes drafts full of claims from "Do not use" in `facts.md`. Reading what will change is the only check on that.
- The production scripts read `cms/.env` and `db/.env` in the main checkout. Worktrees don't have those files.

## Check the current state

```bash
curl https://cms.norav.dev/api/health
```

```bash
curl https://cms.norav.dev/api/public/manifest
```

```bash
npm --prefix ~/Desktop/projects/webapp/db run migrate:status
```

On 2026-11-07, production had all 33 migrations in the repo applied, with content version 27.

## Before any production change

1. Note the current `publishedVersion`. That's your rollback point.
2. Take a backup. This leaves out accounts, sessions, preview tokens and the audit log, so the file holds no password hashes:
   ```bash
   cd ~/Desktop/projects/webapp/cms && node --env-file=.env -e "require('node:child_process').execFileSync('pg_dump',[process.env.DATABASE_URL,'--format=custom','--no-owner','--no-privileges','--exclude-table-data=admin_users','--exclude-table-data=sessions','--exclude-table-data=login_attempts','--exclude-table-data=preview_tokens','--exclude-table-data=audit_log','--file='+process.env.HOME+'/Desktop/norav-content-'+new Date().toISOString().slice(0,10)+'.dump'],{stdio:'inherit'})"
   ```
   It only reads production. Keep the file outside this repo, and delete it once the change has been checked.

## Copy production for a rehearsal

The backup command above is the copy. Restore the file into a private Postgres. The restore has to clear `author_id` on `revisions` and `publications` before foreign keys go on, because `admin_users` stays behind.

`npm --prefix cms run pull:production` also copies production, into the embedded database. It refuses while production is behind the repository, because both sides have to be on the same migrations and the embedded one always applies all of them. To rehearse a migration that hasn't reached production, use the backup above.

## Small content edit, by the owner

1. Sign in at `cms.norav.dev`.
2. Make the edits.
3. Preview, then publish.
4. Check the result, as described below.

## Apply migrations

```bash
npm --prefix ~/Desktop/projects/webapp/db run migrate:status
```

```bash
npm --prefix ~/Desktop/projects/webapp/db run migrate
```

```bash
curl https://cms.norav.dev/api/health
```

Some migrations write content rows. **Writing them doesn't publish them**, so the live site doesn't change until the release.

## Publish

`release:production` and the CMS's Publish button run the same code. The result says whether the site rebuild started. If `rebuild` comes back `failed` or `not_configured`, the publish still succeeded, and the site picks up the content after each page load. The old copy stays in the bundle and paints first until the next deploy. `SITE_DEPLOY_HOOK_URL` is set on the CMS project, so a publish from anywhere else reports `not_configured`.

A publish with no changes comes back `unchanged: true`, and makes no new version.

## Check the result

```bash
curl https://cms.norav.dev/api/public/manifest
```

Then load the pages you changed at desktop and 375px, with no sign-in, and read them.

## Forgot the CMS password

The owner runs this one, never a session.

```bash
npm --prefix ~/Desktop/projects/webapp/cms run user:add:production -- --email you@example.com
```

Run it in the Mac's Terminal app, not the Terminal panel in the Claude app: the prompt shows what you type, and a session can read that panel. Use the email you sign in with, because any other one creates a second owner account. It should say `Password updated`, and it signs you out everywhere.

Five failed sign-ins for one email from one address lock it for up to 15 minutes after the first failure. A new password doesn't lift that.

## Roll back

Every publication stays available:

```bash
curl "https://cms.norav.dev/api/public/content?v=<previous version>"
```

That only reads it. There's no restore button yet (S10 adds it), so nothing puts an older version back on the site. Until then, a session prepares a re-publish of the earlier version, and rehearses it like any other change. If the site itself is broken, use Instant Rollback in the Vercel dashboard for the site project.
