# norav.dev

Personal portfolio of Norayr Avetisyan — a single-page site with a 3D hero,
interactive case-study widgets, and its own CMS.

Live at **[norav.dev](https://norav.dev)**. The admin is at
**[cms.norav.dev](https://cms.norav.dev)**.

## What is here

This repository holds three things that ship separately.

| Path | What it is |
| --- | --- |
| `src/`, `public/`, `index.html` | the site — Vite 6, React 19, TypeScript |
| `cms/` | the admin — Next.js 15, its own lockfile, its own Vercel project |
| `db/` | numbered SQL migrations and a PGlite test harness |
| `packages/content-schema/` | the block registry and snapshot contract, shared by both |
| `server/`, `api/` | the terminal's `ask` command: one handler, an edge function |

The site is Three.js and React Three Fiber for the hero, GSAP for scroll work,
Tailwind v4 for everything else.

## How content reaches the page

Editing in the CMS writes a draft. **Publish** turns the draft into an
immutable snapshot — every locale, every block, validated once — and stores it
as a numbered publication.

The site gets that snapshot twice over:

- **At build time.** `prebuild` fetches the latest publication and bakes it into
  the bundle, so the first paint needs no network.
- **At run time.** The page checks a manifest and swaps in anything newer,
  without a deploy.

A publish also triggers a rebuild, so the baked copy catches up rather than
staying a version behind.

Nothing the site renders is hardcoded: sections, their order, their visibility,
every image, and the colour palette all come from the snapshot.

## Running it

```bash
npm install
npm run dev            # the site on :5173
```

The site talks to a CMS on `localhost:3300` in development, and falls back to
the snapshot committed under `src/content/` when none is running.

For the admin — its own install, its own database:

```bash
npm --prefix cms install
npm --prefix cms run db:reset                     # embedded database, seeded
DATABASE_URL= npm --prefix cms run user:add -- --email you@example.com
npm --prefix cms run dev:local                    # the admin on :3300
```

`dev:local` and `db:reset` force the embedded database regardless of what
`cms/.env` says. That matters: `cms/.env` holds the production connection
string, so a plain `npm run dev` in `cms/` edits the live site.

See [`cms/README.md`](cms/README.md) for the admin in detail and
[`cms/DEPLOY.md`](cms/DEPLOY.md) for what production needs.

## Tests

```bash
npm test               # the site and the shared schema
npm --prefix cms test  # the admin
npm --prefix db test   # migrations, against real Postgres compiled to WASM
```

The `db` suite applies every migration to an ephemeral PGlite instance and
asserts the invariants the API relies on — no Docker, no local cluster.

## Deploying

Two Vercel projects from one repository: `norav` builds the site from the root,
`norav-cms` builds the admin from `cms/`. Both deploy on a push to `main`.
Postgres lives on Neon; uploaded files live in Vercel Blob.

Migrations are **not** applied automatically on Postgres — only the embedded
database does that. Production takes `npm --prefix db run migrate`.
