# norav.dev

A personal portfolio site, and the small CMS that runs it. One repository, three
deployable pieces, no CMS framework and no ORM anywhere in it.

The site is a Vite + React 19 single page: a WebGL constellation behind the
content, an interactive terminal in the footer, and every section — its copy,
its order, whether it appears at all — coming from a database rather than from
JSX. Content is baked into the bundle at build time, so the first paint costs no
network request, and refreshed in the background afterwards, so fixing a typo
does not need a deploy.

## The repository

| Path | What it is | Its own docs |
| --- | --- | --- |
| `src/`, `api/`, `server/` | The site: React 19, Vite 6, Tailwind 4, R3F, GSAP | this file |
| `packages/content-schema/` | Block registry and snapshot contract shared by both sides | — |
| `cms/` | Admin UI and content API — Next.js App Router, `pg`, zod | [cms/README.md](./cms/README.md), [cms/DEPLOY.md](./cms/DEPLOY.md) |
| `db/` | PostgreSQL schema — numbered SQL migrations, PGlite-tested | [db/README.md](./db/README.md) |

Only `packages/*` is an npm workspace of the root project. `cms/` and `db/`
carry their own lockfiles and are installed separately — they deploy separately
too, and a content service must never be able to break the portfolio's build.

`@norav/content-schema` is the seam between the halves. It defines each block's
fields once, in zod; the CMS renders form inputs from it, the publish step
validates against it, and the site reads the result with those types. A block
type is added in one place.

## How a page reaches the screen

```
CMS edit ──► publish ──► immutable snapshot (one JSON per locale)
                              │
              build time ─────┼─────► baked into the bundle (scripts/fetch-content.mjs)
                              │
              page idle ──────┴─────► checksum differs? swap the new copy in, no redeploy
```

1. **Publish** resolves ordering, visibility and locale fallback, validates every
   block against the registry, and writes one immutable row to `publications`.
   A publish that would render a broken page is refused, naming the field.
2. **`prebuild`** runs `scripts/fetch-content.mjs`, which pulls the latest
   snapshot for each locale into `src/content/snapshot.{en,ru}.json`. Those files
   are committed: with `CMS_URL` unset, or the CMS unreachable, the build uses
   them and exits successfully. A content service being down is not a deploy
   failure. `scripts/generate-sitemap.mjs` then writes `public/sitemap.xml` from
   whichever snapshot won, so the map always describes the content that shipped.
   It strikes the same bargain: an unreadable snapshot is reported and stepped
   around, never a failed build.
3. **At runtime** `ContentProvider` waits for the page to go idle, then asks
   `/api/public/manifest` for the current checksum. If it differs from the baked
   one it fetches the new snapshot and swaps it in mid-session. Compared by
   checksum rather than version, because a rollback republishes older copy under
   a newer number.
4. **Previews** arrive as `#preview=<token>` in the fragment — never the query,
   so the token stays out of access logs and `Referer` headers. A draft renders
   through the real site with a fixed `DRAFT PREVIEW` badge, and is forgotten on
   the next reload.

Rolling content back is picking an older `publications` row. It needs no deploy.

## Quick start

Node 20 (what CI uses). The site alone needs nothing else:

```bash
npm install
npm run dev
```

That serves <http://localhost:5173> against the snapshots committed in
`src/content`. Everything renders; nothing is editable.

To edit content you need the CMS as well. It runs on an embedded PGlite
database — real Postgres compiled to WASM — so there is no Docker, no cloud
account and no `DATABASE_URL` involved:

```bash
npm install --prefix cms
npm --prefix cms run seed                            # applies db/migrations into cms/.pglite
npm --prefix cms run user:add -- --email you@example.com
npm --prefix cms run dev:local                       # the CMS on :3300, embedded database
npm run dev                                          # the site on :5173, which finds it
```

In development the site assumes the CMS is at `http://localhost:3300`, so a
publish shows up on the next page load with no env var to remember. The console
says which snapshot won:

```
[content] swapped in version 6 from http://localhost:3300 (bundle was built with 4)
[content] could not reach http://localhost:3300 — rendering the snapshot baked at build time
```

To commit the current published content as the offline fallback:

```bash
npm run content:pull
```

## Environment

Copy `.env.example` to `.env`. Nothing here is required to run the site.

| Variable | Reaches the browser | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | no | Powers the terminal's `ask`. Unset, the command reports itself switched off rather than broken |
| `CMS_URL` | no | Build-time origin for baking the snapshot. Unset = build with what is committed |
| `VITE_CMS_URL` | **yes** | Runtime origin for revalidation. Must be set explicitly in production — a build that silently talked to localhost would ship a site that never updates |
| `VITE_GOOGLE_MAPS_API_KEY` | **yes** | Maps needs it browser-side. Restrict it by domain in Google Cloud Console |
| `VITE_GOOGLE_MAPS_MAP_ID` | **yes** | Map styling |

The `VITE_` prefix is the whole rule: prefixed variables are inlined into the
shipped JavaScript, unprefixed ones exist only at build time and inside the API
handler. `ANTHROPIC_API_KEY` must never gain the prefix.

## Layout

```
api/chat.ts              Vercel edge entry — a four-line adapter
server/chat.ts           the actual /api/chat handler, shared by both environments
vite-api-plugin.ts       serves that same handler in dev, so the two cannot drift

scripts/
  fetch-content.mjs      bakes the published snapshot into src/content
  generate-sitemap.mjs   writes public/sitemap.xml from it — both run in prebuild

src/
  content/               the CMS boundary
    index.ts             the baked snapshots
    ContentProvider.tsx  revalidation, preview, the useBlock/useCollection hooks
    blocks.tsx           block type ──► React component
    BlockRenderer.tsx    walks the published page and renders it
    current.ts           the same snapshot, reachable outside React (the terminal)
    theme.ts             paints the published palette onto :root
  components/
    canvas/              R3F scene, particle field, GLSL shaders
    sections/            one folder or file per block type
    ui/  navigation/
  i18n/locales/{en,ru}/  interface chrome only — see below
  lib/                   terminal commands, SSE reader, web vitals, the AI system prompt
  hooks/  store/  types/

packages/content-schema/src/
  blocks/                one zod schema per block type
  collections/           repeatable content (experience entries)
  snapshot.ts            the contract the publish step produces
```

## How the site is put together

**Blocks.** `BlockRenderer` walks the published page and looks each block type up
in `BLOCK_COMPONENTS`. A type the site does not know is skipped rather than
throwing, which is what lets the CMS ship a block type before the site that
renders it. The hero stays in the entry chunk because it is the LCP element;
every other section is a lazy import.

**Colour is a role, type is a scale.** A component names one of three colour
roles — `primary-*`, `secondary-*`, `tertiary-*` — or `status-*` for state,
and one size from the display/body scale; Tailwind's own palette and sizes are
switched off and the lint rule says so aloud. The roles are aliases onto the
palette the CMS publishes, which is how a theme change repaints the site
without a component knowing. [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

**Copy lives in two places, deliberately.** Section content — headings, project
descriptions, the terminal's narrative — comes from the CMS. Interface chrome
that has no editorial meaning stays in `src/i18n/locales`. If a non-developer
would ever want to change a string, it belongs in the CMS; if changing it is a
code change anyway, it belongs in i18n. Both halves are English and Russian.

**Theme.** The published palette is a set of `--color-*` custom properties
written onto `:root`, so every Tailwind utility referencing them repaints and no
component learns that a colour changed. Only `--color-*` names are accepted — a
published theme must not be able to set arbitrary CSS. Applied before first
paint, and remembered by version so a reload does not flash the shipped palette.
Canvas and WebGL copy their colours on mount, so they listen for a
`norav:themechange` event instead.

**What the head says.** Two audiences read it and they do not overlap. Google
runs the JavaScript and sees whatever `PageHead` ends up writing; every link
unfurler that matters — Telegram, Slack, LinkedIn, Facebook, X — fetches
`index.html` and never executes it, so the static tags are the only card it will
ever see. Both are served by having one tag each: `index.html` carries the
site's own title, description and card, and `PageHead` **rewrites those tags in
place** once React runs, rather than rendering copies beside them. The tags that
exist only per page — `canonical`, the `hreflang` alternates, `og:url` — are
rendered normally, because there is nothing in the shell for them to collide
with. `public/sitemap.xml` is generated, never edited: it lists every published
page in both languages, and skips the `site` page and any page with no sections,
which the site renders as a 404.

**Motion.** GSAP ScrollTrigger for scroll work, Framer Motion for component
transitions, R3F for the constellation. `prefers-reduced-motion: reduce` drops
the canvas, the grain, the floating artifacts and the dynamic grid entirely —
they are not merely stilled. Three, GSAP, Maps, Spline and Framer Motion are
each split into their own chunk in `vite.config.ts`.

**The terminal.** `help`, `ls`, `cat`, `whoami`, `date`, `echo`, `neofetch`,
`pwd`, `cd`, `sudo` and `clear` are local. `ask` streams from Claude through
`/api/chat`, with the system prompt in `src/lib/portfolio-context.ts`. That
handler lives in `server/chat.ts` and is imported by both the Vite dev plugin and the edge
function, because it once existed only in dev and production answered "could not
reach AI service" to everyone. It caps the model at 512 tokens, keeps the last
10 messages, truncates each to 600 characters, and rate-limits 5 requests per
minute per IP — in memory, so it bounds a loop from one machine and nothing
more.

## Checks

```bash
npm run lint          # eslint over src packages server api and the configs
npx tsc --noEmit      # the build runs this first anyway
npm test              # vitest + jsdom
npm --prefix db test  # every migration applied to an ephemeral PGlite, invariants asserted
npm --prefix cms test
npm run content:check # the committed snapshots still match what the CMS publishes
```

`.github/workflows/ci.yml` runs all of it on every push and pull request to
`main`: typecheck, tests and build for the site, plus schema tests and a Next
build for the CMS. It does not deploy. `claude.yml` answers `@claude` mentions
in issues and reviews.

## Deployment

Two Vercel projects on this repository:

| Project | Root directory | Deploys |
| --- | --- | --- |
| `norav` | `.` | norav.dev — push to `main` goes straight to production |
| `norav-cms` | `cms` | cms.norav.dev — `noindex`, no public sign-up |

The site is a static bundle plus one edge function (`api/chat.ts`); the CMS is a
Next app against Neon with Vercel Blob for media. Full runbook — database,
variables, and how to tell whether it worked — is in
[cms/DEPLOY.md](./cms/DEPLOY.md).

Because `main` is production, work goes through a branch and a pull request.

## Things that will bite you

**Restart the Vite dev server after pulling a change to the workspace package.**
A running dev server re-optimises dependencies underneath itself, which leaves
react-three-fiber with two copies of its store and throws *"R3F: Hooks can only
be used within the Canvas component!"*, blanking the page.

**`cms/.env` holds the production connection string.** A plain
`npm --prefix cms run dev` therefore edits the live site. `dev:local` forces the
embedded database; so does `DATABASE_URL=` in front of any script, because
Node's `--env-file` will not overwrite a variable that is already set, even to
nothing.

**Stop the CMS with Ctrl-C, not `kill -9`.** PGlite writes its data directory on
shutdown and a hard kill can leave it unopenable. It is disposable —
`npm --prefix cms run db:reset` — but you will have to re-add your user.

**Do not render a `<title>` or an `og:` tag that `index.html` already has.**
React 19 hoists meta into the head by appending, not replacing, and a browser —
like a crawler — reads the first one it finds. A second tag is therefore not an
override but dead weight: for a while every address on the site answered to the
home page's title this way, and it looked correct on the only page whose title
happened to match. `PageHead` writes those tags imperatively for exactly this
reason; add a new one to `applySeo`, not to the JSX.

**The committed snapshots go stale, and nothing tells you.** Publishing needs no
deploy, so the copy under `src/content` — what `npm run dev`, the tests and an
offline build render — drifts from production until someone runs
`npm run content:pull`. It was three weeks and four versions behind once. Run
`npm run content:check` when a section you placed in the CMS is not on the page
locally, and pull before a branch that touches `src/content`.

**A failed content fetch at build time is not an error.** If `npm run build`
prints `keeping the committed snapshots`, the deploy succeeded with whatever is
in `src/content`. Check that before wondering why an edit did not ship.
