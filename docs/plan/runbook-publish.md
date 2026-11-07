# Publish runbook

How production content changes. **The owner runs every command here.** Sessions prepare and verify, and never run them.

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

On 2026-11-07, production had all 32 migrations in the repo applied, with content version 27.

## Before any production change

1. Note the current `publishedVersion`. That's your rollback point.
2. Take a backup. This leaves out accounts, sessions, preview tokens and the audit log, so the file holds no password hashes:
   ```bash
   cd ~/Desktop/projects/webapp/cms && node --env-file=.env -e "require('node:child_process').execFileSync('pg_dump',[process.env.DATABASE_URL,'--format=custom','--no-owner','--no-privileges','--exclude-table-data=admin_users','--exclude-table-data=sessions','--exclude-table-data=login_attempts','--exclude-table-data=preview_tokens','--exclude-table-data=audit_log','--file='+process.env.HOME+'/Desktop/norav-content-'+new Date().toISOString().slice(0,10)+'.dump'],{stdio:'inherit'})"
   ```
   It only reads production. Keep the file outside this repo, and delete it once the change has been checked.
3. Check that the session's report lists exactly what will change, and that you've reviewed the copy.

## Copy production for a rehearsal

The backup command above is the copy. Give it a path the session names, and the session restores the file into a private Postgres. The restore has to clear `author_id` on `revisions` and `publications` before foreign keys go on, because `admin_users` stays behind.

`npm --prefix cms run pull:production` also copies production, into the embedded database. It refuses while production is behind the repository, because both sides have to be on the same migrations and the embedded one always applies all of them. To rehearse a migration that hasn't reached production, use the backup above.

## Small content edit

1. Sign in at `cms.norav.dev`.
2. Make the edits from the session's list.
3. Preview, then publish.
4. Check the result, as described below.

## Apply migrations

From the main checkout, on the commit the session names:

```bash
cd ~/Desktop/projects/webapp && git switch main && git pull
```

```bash
npm --prefix db run migrate:status
```

```bash
npm --prefix db run migrate
```

```bash
curl https://cms.norav.dev/api/health
```

Some migrations write content rows. **Writing them doesn't publish them**, so the live site doesn't change until someone publishes.

## Publish

Sign in at `cms.norav.dev`, preview the affected pages, then publish. The response says whether the site rebuild started. If `rebuild` comes back `failed` or `not_configured`, the publish still succeeded, and the site picks up the content after each page load. The old copy stays in the bundle and paints first until the next deploy. `SITE_DEPLOY_HOOK_URL` is set on the CMS project, so a publish from anywhere else reports `not_configured`.

A publish with no changes comes back `unchanged: true`, and makes no new version.

## Check the result

```bash
curl https://cms.norav.dev/api/public/manifest
```

Then open the site in a private window, at desktop and phone widths, and check the pages the session named.

## Forgot the CMS password

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

That only reads it. There's no restore button yet (S10 adds it), so nothing puts an older version back on the site. Until then, ask a session to prepare a re-publish of the earlier version. If the site itself is broken, use Instant Rollback in the Vercel dashboard for the site project.
