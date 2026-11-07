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

Revision restore isn't built yet. Every `publications` row keeps its resolved
payload, and `/api/public/content?v=<n>` serves any of them, but nothing puts an
older one back on the site. S10 in [the plan](../docs/plan/README.md) adds it.

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
npm --prefix cms run dev:local   # the CMS on :3300, embedded database
npm run dev                      # the site on :5173
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

The scripts that write — `seed`, `import`, `import:media`, `link:images`,
`user:add`, `release` — are forced onto the embedded database the same way, and refuse to
run if `DATABASE_URL` reaches them regardless. Each has a `:production` twin
that is the only way to point it at the live database:

```bash
npm --prefix cms run user:add -- --email you@example.com              # the embedded database
npm --prefix cms run user:add:production -- --email you@example.com   # the live account
```

A clean slate — wipes the embedded database and rebuilds it from the seed and
the frozen migration inputs — never touches production, whatever `.env` says:

```bash
npm --prefix cms run db:reset
```

That is the content as it was when the CMS was born. For the content as it is
*now* — to try a change against what visitors actually see — pull the live
database down instead:

```bash
npm --prefix cms run pull:production          # says what it would replace, stops
npm --prefix cms run pull:production -- --yes # does it
```

It reads every content table from the Neon database in `cms/.env` over a
read-only connection and replaces the embedded copy — pages, blocks, entries,
settings, the media library, the revision and publication history — in one
transaction, so a failure halfway leaves the laptop as it was. Accounts are the
one thing it never moves in either direction: your local login stays, and
production's password hashes stay in production. A revision keeps its content
and loses its author; sign-in attempts in the audit log stay behind. The CMS has
to be stopped while it runs (PGlite is single-writer). The site picks the content
up on its next load.

Both databases have to be on the same migrations, and the embedded one applies
every migration each time it opens. So this refuses while production is behind the
repository. [The publish runbook](../docs/plan/runbook-publish.md) says how to copy
production in the meantime.

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

What's accepted:

| Type | Limit |
| --- | --- |
| jpeg, png, webp, avif, gif, pdf | 12 MB |
| mp4, webm | 50 MB |
| svg | 4 MB |

Anything else is refused before it is stored. Dimensions are read on upload so the
site can reserve layout space, except for video, which reserves its frame from the
block's Portrait switch. Deleting removes the bytes and soft-deletes the row —
nothing here knows which pages point at a file, so the history stays.

**Two ways in.** A Vercel function's request body stops at about 4.5 MB, and the
platform answers past that before the route runs. So on the blob store, every video
and any file over 4 MB goes straight from the browser to the store: `media/direct`
hands out a token for one pathname, one content type and that type's limit, and
`media/register` then records what the store says it received. Everything else goes
through `POST /api/admin/media`, including everything on the embedded setup. An SVG
always takes that route, because the server has to read it to check it's safe.

An image field lists the library's images and documents, and a video field lists its
videos.

## Profile

The facts about the owner are one `settings` row, edited on the Profile screen:
title, location, links, employers, approved numbers. Publishing carries them in the
snapshot like the palette, and validates them first. The page shell, its JSON-LD and
the terminal read them from there. [`docs/plan/facts.md`](../docs/plan/facts.md) stays
as the review record, so change that first.

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
| GET/PUT | `/api/admin/settings/:key` | read or save `theme`, `site` or `profile` |
| GET/POST | `/api/admin/media` | list the library / upload a file |
| POST | `/api/admin/media/direct` | a token to send one file straight to the blob store |
| POST | `/api/admin/media/register` | record a file sent that way, as new or as a replacement |
| POST | `/api/admin/media/:id/replace` | swap a file and carry its references across |
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
