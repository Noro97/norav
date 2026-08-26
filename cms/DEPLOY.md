# Deploying the CMS

Two Vercel projects share this repository: the existing **site** (root
directory `.`) and a new **cms** (root directory `cms`). They are deployed
separately on purpose — publishing content must never be able to break the
portfolio's build.

Everything below needs accounts and keys that only the owner has. The code is
ready for all of it; nothing here is a code change.

## 1. Database

Neon, or any Postgres. The schema uses no extensions.

```bash
cp db/.env.example db/.env          # fill in DATABASE_URL
npm --prefix db install
npm --prefix db run migrate:status  # six pending
npm --prefix db run migrate
```

Then populate it. The import is idempotent and reads the frozen namespaces in
`cms/scripts/legacy-i18n`, so a brand-new database ends up with exactly the
content this repository shipped:

```bash
cp cms/.env.example cms/.env        # the same DATABASE_URL
npm --prefix cms run seed
npm --prefix cms run import
npm --prefix cms run user:add -- --email you@example.com
```

The password is prompted for. There is no public sign-up, and no default
account exists.

These scripts read `cms/.env`, so the connection string goes in that file — not
only in Vercel. Without it they fall back to the embedded database and appear to
succeed while writing nowhere useful.

## 2. The CMS project

New Vercel project, same repository, **Root Directory `cms`**.

| Variable | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | yes | Without it the app falls back to the embedded database, which on a serverless filesystem means losing everything between requests |
| `SITE_ORIGIN` | yes | The origin allowed to read the content API. `*` if unset — fine locally, wrong in production |
| `CMS_PUBLIC_URL` | with local media | Absolute origin, used to build URLs for uploads the CMS serves itself |
| `BLOB_READ_WRITE_TOKEN` | for uploads | Vercel Blob. Without it uploads go to the container's disk and vanish on redeploy |
| `SITE_DEPLOY_HOOK_URL` | optional | Publishing asks the site to rebuild. Without it the site still picks up new content, one page load later |

Give it a domain — `cms.norav.dev` — and keep it out of search: the app already
sends `noindex`.

## 3. The site project

Two variables on the existing project:

- `CMS_URL` — read at build time, bakes the published snapshot into the bundle.
- `VITE_CMS_URL` — shipped to the browser, lets a running page pick up content
  published after the build.

Both point at the CMS origin. Redeploy to pick them up.

## 4. Check it worked

```bash
curl https://cms.norav.dev/api/health
```

```json
{ "status": "ok", "database": "reachable", "migrations": 6,
  "publishedVersion": 1, "storage": "blob" }
```

`migrations: 0` means the runner never ran. `storage: "local"` in production
means the blob token is missing and uploads will not survive a redeploy.

Then sign in, change a word, publish, and load the site. If `rebuild` comes
back `failed` in the publish response, the deploy hook URL is wrong — the
publish itself still succeeded.

## Operating it

**Schema changes** are new files in `db/migrations`, applied with
`npm --prefix db run migrate`. Migrations are append-only; never edit one that
has shipped.

**Rolling back content** does not need a deploy. Every publish is an immutable
row in `publications`, and `/api/public/content?v=<n>` serves any of them.

**Backups**: the content of record is the `publications` table. `pg_dump` of it
is enough to reconstruct the site; the rest of the schema is working state.

**Do not run the local scripts against a running local CMS.** PGlite is a
single-writer database and the scripts refuse, with an explanation, rather than
corrupting the directory.
