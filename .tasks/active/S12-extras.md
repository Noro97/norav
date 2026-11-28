# S12: Extras

**Status:** in progress, 2026-11-28. The first PR, code only, moves the snapshot out of the entry chunk. The owner's first round of questions is open.
**Origin:** `docs/plan/prompts/S12-extras.md`, started by the status-review session on 2026-11-28. Branch `claude/s12-snapshot-chunk`, cut from `main` at `c43eb7d`.

## What the prompt assumed, checked

- Production, 2026-11-28: 40 migrations of 40, `publishedVersion` 32, checksum `1ddb1069d878…`. Matches `STATE.md` and the committed snapshot.
- No other S12 session among the linked ones. The one running beside this, on widget accessibility and confetti colours, touches the widgets, not the content pipeline.
- The status review's "Owner's answers to round 1" was empty, so S12 asks its own first round.
- `src/content/snapshot.en.json` was statically imported into the entry chunk: 362.7 KB raw and 118.2 KB gzip of 363 and 119 on CI's Node 20. No post, testimonials or Russian copy could be baked before it left.
- Fonts are `latin-*` only. `/ru` redirects to `/` with a 307, and the Russian rows of every block 0034 rewrote are deleted.
- The site already renders posts (`/writing/<slug>`, `PostPage`) and lists them in `kit_writing` from the `posts` collection. Nothing is published: no `writing` page, no posts. `testimonials` has `quote`, `author` and `role`, and no page places it.

## Plan

1. **Snapshot out of the entry chunk** (this PR, no content change). Then whatever the owner chooses, each with one review on the finished pages before its publish (G3):
2. the first post;
3. Russian;
4. testimonials, only if the owner has real quotes with permission.

## Done

### 1. The snapshot is its own chunk

- `src/content/baked.ts` loads `snapshot.en.json` with a dynamic import. `main.tsx` waits for it, then applies the theme and hydrates; `entry-server.tsx` imports it statically, since Node isn't budgeted. `ContentProvider` takes the snapshots as a `baked` prop, and `current.ts` is set by each entry before the first render.
- A build plugin in `vite.config.ts` preloads the chunk from `index.html`, so every prerendered page and `404.html` fetch it beside the entry. In the built site it starts 1 ms after the entry.
- `scripts/check-bundle-size.mjs` measures it as `content`, with a budget of its own (64 KB raw, 20 KB gzip), and fails when `index.html` doesn't preload it or a code chunk carries its checksum. `entry-imports.test.ts` fails if `main.tsx` reaches a snapshot by static import.
- Entry on Node 20: JS 320.2 KB raw and 104.4 KB gzip, down from 362.7 and 118.2. The JS limit comes down with it, to 321 KB and 105 KB. Content: 43.0 KB raw, 14.1 KB gzip.

## Verification

- Site: `tsc`, `lint`, 409 tests, `build`, `prerender:check` (11 routes), `size:check` on Node 20.
- The guard tests were checked against the fault: a static import of the snapshot in `src/content/index.ts` fails `entry-imports.test.ts`.
- Built site in the browser pane (`vite preview`): `/`, `/work/norav` and `/about` hydrate from their prerendered markup; an unknown address renders the not-found page; a client-side link from `/about` to `/work` renders; the terminal's `whoami` reads the profile through `current.ts`. At 375 px `/` hydrates with no sideways scroll. The console was empty except for the deliberate 404. `npm run dev` renders `/` from the dynamic import.
