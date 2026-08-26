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
npm install
npm run seed                     # applies db/migrations into cms/.pglite, seeds the home page
npm run user:add -- --email you@example.com
npm run dev                      # http://localhost:3300
```

With `DATABASE_URL` empty the CMS runs on an embedded PGlite database under
`cms/.pglite` (real Postgres, compiled to WASM) and applies `db/migrations`
itself on first boot. Set `DATABASE_URL` and the exact same code talks to Neon.

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
never touches the portfolio's deployment. Environment: `DATABASE_URL` (Neon),
`SITE_ORIGIN` (`https://norav.dev`), `CMS_SECRET`.
