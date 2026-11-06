# Publish runbook

How production content changes. **The owner runs every command here.** Sessions prepare and verify, and never run them. S2 rehearsed the catch-up below on a restored copy of production on 2026-11-06.

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

On 2026-11-06, production had 17 migrations applied of the 31 in the repo (0001–0015, 0028 and 0030), with content version 26.

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

`npm --prefix cms run pull:production` also copies production, into the embedded database. It refuses while production is behind the repository, because both sides have to be on the same migrations and the embedded one always applies all of them. It works again after the catch-up.

## Catch up production

S3 runs this once. It brings production to every migration **without changing anything a visitor sees**.

**Why it needs two steps.** Migrations 0016–0027 write the September copy. Publishing straight after them passes validation, and on the copy it did this:

- 15 new sections on existing pages, and 2 new pages, `contact` and `writing`, all carrying unreviewed copy.
- S1's corrected text on About overwritten, with "Seven-plus years" and "Open to senior/staff roles" back.
- All five case-study pages filled in, including 98.4%, "TON only for the premium tier", `<1 ms` and Google Maps.
- `[Placeholder` testimonials, press, awards, a show reel, FAQ answers and articles.
- The terminal gone from every page but `/contact`, with no footer, because `site_footer` stays hidden.
- 72 hits in a search for "Do not use" claims and placeholders. Version 26 has 4, all approved facts.

So the migrations run as written, and `content:catch-up` then puts the drafts back to the latest publication. It writes no new copy and deletes nothing. S5 brings the new copy, with the owner's review.

**Do steps 2–5 in one sitting, and don't publish until step 5 has passed.** After step 3 the drafts hold all of the above, and a publish would release it.

1. Take the backup above, and check the state:
   ```bash
   curl https://cms.norav.dev/api/health
   ```
   Expect `"migrations":17`, and note `publishedVersion`.

2. Update the main checkout:
   ```bash
   cd ~/Desktop/projects/webapp && git switch main && git pull
   ```

3. Apply the migrations that write old copy. Stop at 0031, because S3's own migrations come after the restore:
   ```bash
   npm --prefix db run migrate -- --through=0031
   ```
   Expect 14 lines ending in `ok`, then `Applied 14 migration(s).`

4. See what the restore would change. This writes nothing:
   ```bash
   npm --prefix cms run content:catch-up:production
   ```
   On the copy it listed 44 changes: 2 pages unpublished, 17 sections and 1 menu item hidden, the terminal moved back to `site`, `tech_marquee` back on About, and the copy of About, the bento grid, the home hero's Russian, the five case studies, the experience images and the Contact menu item restored.

5. Write it:
   ```bash
   npm --prefix cms run content:catch-up:production -- --yes
   ```
   Expect `A publish now differs from version 26 in 20 values`, all of them marked expected, then `Nothing a visitor can see changes.` The 20 are menu anchors (0031) and ambient-layer settings (0027), counted across two languages, and nothing on the site reads them. **If it prints `NOT expected`, stop and send the output to a session.**

6. Apply the rest. S3 replaces this line if its own migrations need more:
   ```bash
   npm --prefix db run migrate
   ```

7. Check, then publish as below:
   ```bash
   curl https://cms.norav.dev/api/health
   ```
   Expect every migration applied, and `publishedVersion` unchanged. On the copy, the publish made version 27 with `purged: 0`. The 11 published pages rendered at 1440px and 375px with no claim and no broken image, apart from one OmniGrid error in the dev build, logged in `.tasks/bugs/omnigrid-render-loop.md`, which isn't caused by the content.

The script refuses if a migration through 0031 is still pending, or if a later one has already run, because it would hide what that migration added. Rerunning it is safe. S3 deletes it afterwards.

## Small content edit

1. Sign in at `cms.norav.dev`.
2. Make the edits from the session's list.
3. Preview, then publish.
4. Check the result, as described below.

## Apply migrations

**Until the catch-up has run, don't use this. It releases everything above into the drafts.** After that, from the main checkout, on the commit the session names:

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

## Roll back

Every publication stays available:

```bash
curl "https://cms.norav.dev/api/public/content?v=<previous version>"
```

That only reads it. There's no restore button yet (S10 adds it), so nothing puts an older version back on the site. Until then, ask a session to prepare a re-publish of the earlier version. If the site itself is broken, use Instant Rollback in the Vercel dashboard for the site project.
