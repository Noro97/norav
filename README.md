# norav.dev

A personal portfolio site, and the small CMS that runs it. One repository, three
deployable pieces, no CMS framework and no ORM anywhere in it.

The site is a Vite + React 19 single page: an interactive terminal in the
footer, and every section — its copy,
its order, whether it appears at all — coming from a database rather than from
JSX. Content is baked into the bundle at build time, so the first paint costs no
network request, and refreshed in the background afterwards, so fixing a typo
does not need a deploy.

## The repository

| Path | What it is | Its own docs |
| --- | --- | --- |
| `src/`, `api/`, `server/` | The site: React 19, Vite 6, Tailwind 4 | this file |
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
2. **`prebuild`** runs `scripts/fetch-content.mjs`, which pulls the latest English
   snapshot into `src/content/snapshot.en.json`. That file is committed: with
   `CMS_URL` unset, or the CMS unreachable, the build uses it and exits
   successfully. A content service being down is not a deploy
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

Revision restore isn't built yet. Every publication stays readable at
`/api/public/content?v=<n>`, but nothing puts an older one back on the site. S10
in [the plan](./docs/plan/README.md) adds it. Until then, see "Roll back" in
[the publish runbook](./docs/plan/runbook-publish.md).

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
| `CMS_URL` | no | Origin for baking the snapshot at build time, and for the profile behind the terminal's `ask` at runtime. Unset = both use what is committed |
| `VITE_CMS_URL` | **yes** | Runtime origin for revalidation. Must be set explicitly in production — a build that silently talked to localhost would ship a site that never updates |

The `VITE_` prefix is the whole rule: prefixed variables are inlined into the
shipped JavaScript, unprefixed ones exist only at build time and inside the API
handler. `ANTHROPIC_API_KEY` must never gain the prefix.

The NexusRoute map draws with Leaflet on Esri's Dark Gray canvas tiles, which
need no key.

## Layout

```
api/chat.ts              Vercel edge entry — a four-line adapter
server/chat.ts           the actual /api/chat handler, shared by both environments
vite-api-plugin.ts       serves that same handler in dev, so the two cannot drift
vite-profile-plugin.ts   fills index.html from the published profile
vite-preview-plugin.ts   makes `vite preview` answer the way Vercel does

scripts/
  fetch-content.mjs      bakes the published snapshot into src/content
  prerender.mjs          writes one HTML file per route, and 404.html, into dist
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
    sections/            one folder or file per block type
    ui/  navigation/
  i18n/locales/{en,ru}/  interface chrome only — see below
  lib/                   terminal commands, SSE reader, web vitals, the AI system prompt, the shell's metadata
  hooks/  store/  types/

packages/content-schema/src/
  blocks/                one zod schema per block type
  collections/           repeatable content (experience entries)
  profile.ts             the facts about the owner: their schema and their form
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
code change anyway, it belongs in i18n. The site serves English only for now: `/ru`
redirects to English, and the Russian files and CMS rows wait for S12.

**Theme.** The published palette is a set of `--color-*` custom properties
written onto `:root`, so every Tailwind utility referencing them repaints and no
component learns that a colour changed. Only `--color-*` names are accepted — a
published theme must not be able to set arbitrary CSS. Applied before first
paint, and remembered by version so a reload does not flash the shipped palette.
`src/content/theme.ts` also dispatches a `norav:themechange` event when the palette
changes.

**The facts.** The title, the years, the employers and the approved numbers live
in one `settings` row, edited on the CMS's Profile screen and published in the
snapshot. `vite-profile-plugin.ts` fills the page shell and its JSON-LD from it at
build time, `server/chat.ts` builds the terminal's prompt from it at runtime, and
the terminal's commands and a few components read it through `useProfile`. Page
copy, like the hero and the career timeline, stays in its own block or collection
and is reviewed as copy. A test fails if anything from "Do not use" in
[`docs/plan/facts.md`](./docs/plan/facts.md) appears in the source, the shell or
the seed data.

**What the head says.** Every link unfurler that matters — Telegram, Slack,
LinkedIn, Facebook, X — fetches the HTML and never executes it. So
`scripts/prerender.mjs` writes one HTML file per published route after the build,
from the server build of `src/entry-server.tsx`: the page's real content, its own
title, description, canonical and Open Graph tags, and the published palette on
`<html>`. `index.html` holds the site's defaults, filled from the profile, and a
prerendered page keeps them in `data-shell`. As the reader moves between pages,
`PageHead` **rewrites those tags in place**, rather than rendering copies beside
them. A live demo needs the DOM, a clock and random numbers, so it only exists in
a browser: its route carries the demo's own words, from `WidgetPlaceholder`, until
it mounts. `public/sitemap.xml` is generated, never edited: it lists every published
page in each language baked into `src/content`, and skips the `site` page and any
page with no sections, which the site renders as a 404.

**What an address answers.** There is no catch-all rewrite. A real file wins, a
folder's `index.html` answers without a redirect, and everything else gets
`dist/404.html` with a 404. That file is the shell with the not-found page in it,
and `main.tsx` only hydrates markup written for the address it's on, so on a 404
the browser renders from scratch. A page published since the last build therefore
still shows up for a reader once the manifest answers, while its status is 404
until the rebuild finishes. `vite preview` answers the same way, through
`vite-preview-plugin.ts`. Files in `/assets/` with a hash in their name are cached
for a year as `immutable`. The ones in `/assets/img/` have no hash and aren't.

**Motion.** The hiring path has one entrance: a 300ms fade and rise from
`useReveal` (`src/hooks/useReveal.ts`), in CSS, applied once to whatever starts off
screen. Numbers are final from the first frame, and hovers are colour changes.
`prefers-reduced-motion: reduce` turns the entrance off without touching the
widgets' own motion. Framer Motion stays inside `ecommerce`, `omnigrid` and
`bento_grid`, which get it and its reduced-motion switch through `animated` in
`src/content/blocks.tsx`. GSAP stays inside `bento_grid`, and Leaflet inside
NexusRoute. A test keeps all three out of what the first page loads.

**Fonts.** Inter, Inter Tight and JetBrains Mono are self-hosted from `@fontsource`,
Latin subset only, in the weights the site uses. Russian needs the Cyrillic subsets
added when it comes back in S12.

**The terminal.** `help`, `ls`, `cat`, `whoami`, `date`, `echo`, `neofetch`,
`pwd`, `cd`, `sudo` and `clear` are local. `ask` streams from Claude through
`/api/chat`, with the system prompt built by `src/lib/portfolio-context.ts` from the
profile the CMS publishes now, kept for five minutes per instance, and from the baked
snapshot if the CMS doesn't answer in two seconds. That
handler lives in `server/chat.ts` and is imported by both the Vite dev plugin and the edge
function, because it once existed only in dev and production answered "could not
reach AI service" to everyone. It caps the model at 512 tokens, keeps the last
10 messages, truncates each to 600 characters, and rate-limits 5 requests per
minute per IP — in memory, so it bounds a loop from one machine and nothing
more.

**Case studies.** `case_study` is one block type placed once per study, reading its
own row by id. It holds context, the problem, footage, decisions, the outcome and what
you'd do differently, and every empty part hides. A study with a demo places the
widget's block above it and leaves its heading empty. The live demos keep their
`*_detail` blocks, which only need a short explanation.

**Video.** `src/components/ui/VideoPlayer.tsx` loads only the poster with the page.
The `<video>` doesn't exist until someone presses play or, for a clip marked to
autoplay, until it nears the screen. Under reduced motion it always waits for a
click. Every clip has a poster, because a figure can't be saved without an image.

## Checks

```bash
npm run lint          # eslint over src packages server api and the configs; a warning fails it
npx tsc --noEmit      # the build runs this first anyway
npm test              # vitest + jsdom
npm --prefix db test  # every migration applied to an ephemeral PGlite, invariants asserted
npm --prefix cms test
npm run build && npm run size:check # entry JS and CSS against their limits
npm run prerender:check # every route is real HTML with a head of its own, after a build
npm run content:check # the committed snapshots still match what the CMS publishes
```

`.github/workflows/ci.yml` runs on every push and pull request to `main`: typecheck,
lint, tests, build, `size:check` and `prerender:check` for the site, Lighthouse on `/`
as a failure at D11's targets, plus schema tests and a Next build for the CMS. It does not deploy. `claude.yml`
answers `@claude` mentions in issues and reviews.

Two choices there are deliberate. `content:check` stays out of CI, because a publish
would turn every open pull request red until someone rebaked the snapshot. And
`size:check` stays out of `npm run build`, because the Vercel build bakes whatever is
published, and publishing content must never be able to fail a deploy. For the same
reason, a route that fails to prerender keeps the empty shell and the build goes on.

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

**`cms/.env` holds the production connection string.** A plain
`npm --prefix cms run dev` therefore edits the live site. `dev:local` forces the
embedded database; so does `DATABASE_URL=` in front of any script, because
Node's `--env-file` will not overwrite a variable that is already set, even to
nothing.

**Stop the CMS with Ctrl-C, not `kill -9`.** PGlite writes its data directory on
shutdown and a hard kill can leave it unopenable. It is disposable —
`npm --prefix cms run db:reset` — but you will have to re-add your user.

**Do not render a `<title>`, an `og:` tag or a canonical that the HTML already has.**
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
