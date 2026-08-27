# @norav/cms

The admin UI and content API behind norav.dev. Next.js App Router, `pg`, zod —
no CMS framework, no ORM.

## How the site gets its content

```
edit ──► save ──► publish ──► immutable snapshot ──► site
        (draft)   (validated)   (one JSON per locale)
```

1. Editing writes to `blocks` / `block_translations`; nothing is live yet.
2. **Publish** resolves ordering, visibility and locale fallback, validates every
   block against the registry in `@norav/content-schema`, and stores the result
   as one immutable row in `publications`. A publish that would render a broken
   page is refused, naming the block and the field.
3. The site bakes the latest snapshot into its bundle at build time
   (`scripts/fetch-content.mjs`), so the first paint costs no network request.
4. After the page goes idle the site checks `/api/public/manifest`; a newer
   checksum means it pulls the new snapshot and swaps the copy in — no redeploy
   for a typo fix.

Rolling back is picking an older `publications` row: the payload is already
fully resolved.

## Local development

No Docker, no cloud account, no `DATABASE_URL`:

```bash
npm install --prefix ..              # once: links the shared schema workspace
npm install
npm run seed                     # applies db/migrations into cms/.pglite, seeds the home page
npm run user:add -- --email you@example.com
npm run dev                      # http://localhost:3300
```

With `DATABASE_URL` empty the CMS runs on an embedded PGlite database under
`cms/.pglite` (real Postgres, compiled to WASM) and applies `db/migrations`
itself on first boot. Set `DATABASE_URL` and the exact same code talks to Neon.

Stop the dev server with Ctrl-C, not `kill -9`: PGlite writes its data
directory on shutdown, and a hard kill can leave it unopenable (`RuntimeError:
Aborted()` on the next boot). It is disposable either way —

```bash
npm run db:reset                 # wipe .pglite and re-seed
npm run user:add -- --email you@example.com
```

## Working on the site against the CMS

```bash
npm --prefix cms run dev     # the CMS on :3300
npm run dev                  # the site on :5173
```

In development the site assumes the CMS is on `http://localhost:3300`, so a
publish shows up on the next page load — no env var to remember. Set
`VITE_CMS_URL` to point somewhere else; in production it must be set explicitly,
because a build that silently talked to localhost would ship a site that never
updates. The browser console says which snapshot won:

```
[content] swapped in version 6 from http://localhost:3300 (bundle was built with 4)
[content] could not reach http://localhost:3300 — rendering the snapshot baked at build time
```

To bake the current published content into the repo (what the site falls back to
when no CMS is reachable at build time):

```bash
npm run content:pull
```

**Restart `npm run dev` after pulling this branch.** The site gained a workspace
dependency, and a Vite dev server that was already running re-optimises its
dependencies underneath itself — which leaves react-three-fiber with two copies
of its store and throws *"R3F: Hooks can only be used within the Canvas
component!"*, blanking the page.

## Getting the site's files into the library

The images and the CV started life in `public/`, where changing one meant a
deploy. This uploads them through the storage driver, records a library entry
for each, and repoints every reference in the content at the stored copy:

```bash
npm --prefix cms run import:media
```

It forces the embedded database, like `db:reset`. Re-running is safe — a file
already imported is recognised by the original path kept in its alt text.

Publish afterwards to put the new URLs on the site.

Doing the same to the live site is a separate command, because it rewrites
content everyone can see:

```bash
npm --prefix cms run import:media:production
```

It needs both halves of production in `cms/.env` — the Neon `DATABASE_URL`,
which is already there, and `BLOB_READ_WRITE_TOKEN` from the Blob store
connected to `norav-cms`. It refuses to run without the token rather than
writing files to your laptop and recording them as live, which is a failure
whose only symptom is an image that loads for you and nobody else.

## Trying a change safely

`cms/.env` holds the production connection string, so a plain `npm run dev`
edits the live site. Anything that should not is forced onto the embedded
database instead:

```bash
npm --prefix cms run dev:local     # the CMS on :3300, embedded database
npm run dev                        # the site on :5173, which finds it by default
```

`DATABASE_URL=` in front of any script does the same thing — Node's `--env-file`
does not overwrite a variable that is already set, even to nothing:

```bash
DATABASE_URL= npm --prefix cms run user:add -- --email you@example.com
```

A clean slate — wipes the embedded database and rebuilds it from the seed and
the frozen migration inputs — never touches production, whatever `.env` says:

```bash
npm --prefix cms run db:reset
```

To try something against real Postgres without touching live content, branch
the database in Neon and point `cms/.env` at the branch. The same applies to
preview deployments: give `norav-cms` a Preview-scoped `DATABASE_URL` on a Neon
branch, and every pull request gets its own content to break.

## Media

Uploads follow the same two-driver shape as the database. Without
`BLOB_READ_WRITE_TOKEN` they are written to `cms/.media` and served back by this
app at `/api/public/media/<key>`, which is what local development wants. With
the token set they go to Vercel Blob and are served from its CDN. Either way the
media row stores an absolute URL, so the site never learns which driver produced
it.

Images are accepted up to 12 MB (jpeg, png, webp, avif, gif, svg); anything else
is refused before it is stored. Dimensions are read on upload so the site can
reserve layout space. Deleting removes the bytes and soft-deletes the row —
nothing here knows which pages point at a file, so the history stays.

Images that predate the library still live in the site's `public/` folder and
are referenced by path. Image fields keep their text input for exactly that
reason: a path typed by hand is as valid as one chosen from the library.

## API

Public (cached, CORS-enabled for `SITE_ORIGIN`):

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/public/manifest` | `{ version, publishedAt, checksum }` — what the site polls |
| GET | `/api/public/content?locale=&v=` | the published snapshot; `v` makes it immutable |

Admin (session cookie, same-origin only):

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` · `/api/auth/logout` | sign in / out |
| GET | `/api/auth/me` | current user |
| GET | `/api/admin/schema` | the block registry, as form descriptors |
| GET | `/api/admin/pages/:slug` | page with blocks and every translation |
| PATCH | `/api/admin/blocks/:id` | save settings / visibility / one locale |
| POST | `/api/admin/publish` | validate everything and cut a new version |
| GET/POST | `/api/admin/media` | list the library / upload a file |
| DELETE | `/api/admin/media/:id` | remove a file |

Responses are `{ data }` or `{ error: { code, message, fields } }`, where
`fields` carries zod paths so the editor can highlight the input that failed.

## Security posture

- Passwords: scrypt (`node:crypto`), parameters stored with the hash.
- Sessions: 32 random bytes, only the SHA-256 lands in the database.
- Cookie: `httpOnly`, `SameSite=Lax`, `Secure` in production.
- CSRF: every mutating route requires a same-origin `Origin` header.
- Login throttling: 5 failures per (email, IP) per 15 minutes.
- No public sign-up. Accounts exist only via `npm run user:add`.
- Every write and every publish lands in `audit_log`; previous content lands in
  `revisions`.

## Deploying

A second Vercel project with **Root Directory = `cms`**, so publishing content
never touches the portfolio's deployment. See [DEPLOY.md](./DEPLOY.md) for the
full runbook: database, environment variables, and how to tell whether it
worked.
