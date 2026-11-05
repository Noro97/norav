# Publish runbook

How production content changes. **The owner runs every command here.** Sessions prepare and verify, and never run them. S2 rehearses this and corrects anything that's wrong.

## How production works

- Merging to `main` deploys the site. The site bakes the latest published snapshot at build time and picks up newer ones at runtime.
- The CMS at `cms.norav.dev` is a separate Vercel project with its own database.
- Publishing writes an immutable row to `publications`. Publish validates every block against the registry and refuses a page that would render broken.
- The production scripts read `cms/.env` and `db/.env` in the main checkout. Worktrees don't have those files.

## Check the current state

```bash
curl https://cms.norav.dev/api/health
curl https://cms.norav.dev/api/public/manifest
npm --prefix db run migrate:status
```

On 2026-11-05, production had 17 migrations applied of the 31 in the repo, with content version 25, published 2026-09-11.

## Before any production change

1. Note the current `publishedVersion`. That's your rollback point.
2. Take a backup:
   ```bash
   pg_dump "$DATABASE_URL" --table=publications --file=publications-$(date +%F).sql
   ```
   Keep the file outside this repo.
3. Check that the session's report lists exactly what will change, and that you've reviewed the copy.

## Small content edit

1. Sign in at `cms.norav.dev`.
2. Make the edits from the session's list.
3. Preview, then publish.
4. Check the result, as described below.

## Apply migrations

Run from the main checkout, on the commit the session names:

```bash
git switch main && git pull
npm --prefix db run migrate:status
npm --prefix db run migrate
curl https://cms.norav.dev/api/health
```

Some of the pending migrations write content rows. **Writing them doesn't publish them**, so the live site doesn't change until someone publishes.

## Publish

Sign in at `cms.norav.dev`, preview the affected pages, then publish. The response says whether the site rebuild started. If `rebuild` comes back `failed`, the publish still succeeded, and the site picks up the content one page load later.

## Check the result

```bash
curl https://cms.norav.dev/api/public/manifest
```

Then open the site in a private window, at desktop and phone widths, and check the pages the session named.

## Roll back

Content doesn't need a deploy to roll back, because every publication stays available:

```bash
curl "https://cms.norav.dev/api/public/content?v=<previous version>"
```

There's no restore button yet (S10 adds it). Until then, ask a session to prepare a re-publish of the earlier version. If the site itself is broken, use Instant Rollback in the Vercel dashboard for the site project.
