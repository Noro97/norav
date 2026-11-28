# S12: Extras

**Status:** in progress, 2026-11-28.

- #152, the snapshot out of the entry chunk, merged at `7692d32`.
- #153, the first post, merged at `6f6948e`. Version 33 live; this snapshot PR bakes it.
- Russian is next.
**Origin:** `docs/plan/prompts/S12-extras.md`, started by the status-review session on 2026-11-28. Branches `claude/s12-snapshot-chunk` (#152), then `claude/s12-first-post`.

## What the prompt assumed, checked

- Production, 2026-11-28: 40 migrations of 40, `publishedVersion` 32, checksum `1ddb1069d878…`. Matches `STATE.md` and the committed snapshot.
- No other S12 session among the linked ones. The one running beside this, on widget accessibility and confetti colours, touches the widgets, not the content pipeline.
- The status review's "Owner's answers to round 1" was empty, so S12 asks its own first round.
- `src/content/snapshot.en.json` was statically imported into the entry chunk: 362.7 KB raw and 118.2 KB gzip of 363 and 119 on CI's Node 20. No post, testimonials or Russian copy could be baked before it left.
- Fonts are `latin-*` only. `/ru` redirects to `/` with a 307, and the Russian rows of every block 0034 rewrote are deleted.
- The site already renders posts (`/writing/<slug>`, `PostPage`) and lists them in `kit_writing` from the `posts` collection. Nothing is published: no `writing` page, no posts. `testimonials` has `quote`, `author` and `role`, and no page places it.

## The owner's answers, 2026-11-28

Round 1, asked with the `grilling` skill. "Да, все три" accepted every recommendation:

- **First post:** topic (a), the publish pipeline, in English, with no Russian version. The session drafts it from the code, the commits and `RETRO.md`, in first person, and marks the places where only the owner can say why. It covers the decisions and their costs, and says nothing about who or what wrote the code. It goes at `/writing`, with one card, linked from the footer and from the end of `/work/norav`. No menu item until there are three posts.
- **Russian:** the whole site, after the post. The session translates it from the final English, and the owner checks every page in one review. The reader is addressed as «вы». Technology names stay in Latin script, and terms are in Russian where Russian developers use the Russian word. The CV, the post and the Lab stay in English.
- **Testimonials:** not in S12. The owner sent none, so the section stays hidden.

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

### 2. The first post (live, version 33)

- **Copy:** `.tasks/active/S12-post.md`, 1,034 words, every claim traced to code, a commit or `RETRO.md`. Written by 0041 as drafts.
- **0041:**
  - the post, dated the day of approval;
  - `/writing` published, with a new heading and search description, and its section row cleared of 0020's placeholders;
  - Writing in the footer's page links only;
  - a link at the end of `/work/norav`.
- **Code:**
  - `footerOnly` on navigation entries (schema, CMS form, menu filter);
  - a drawn share card for a post with no cover, titled with the post's own title;
  - the writing section's title is the page's H1 when it opens the page, and its cards are h2 under it;
  - a kit section that opens a page starts where other pages' first sections do;
  - a prerendered page with a kit section links the kit stylesheet in its head, and `prerender:check` fails without it;
  - the cards' "Read" link uses the accent's 400 step, since the accent itself is 4.3:1;
  - post lines are capped at 68ch, as in the case studies;
  - an unbroken word or address wraps in a post and in its card, and the cards' grid tracks are `minmax(0, 1fr)`.
- **Rehearsal** on a backup taken 2026-11-28 14:42 Yerevan, in a private Postgres. 0041 applies. `release --dry-run` validates with 8 changes, all expected: the post, `/writing`, the footer link and `/work/norav`'s link, each in English and in the Russian fallback. Checksum `745764dd…`.
- **Review:** the owner approved the copy as written on 2026-11-28. The post's date is that day.
- **Release:**
  - #153 merged at `6f6948e` with all six checks green on `d7ef88d`;
  - a fresh backup at 15:17 Yerevan, rehearsed again: the same 8 changes;
  - 0041 on production, 41 of 41;
  - production's dry run identical to the rehearsal's with UUIDs masked;
  - the release waited until the live entry carried `footerOnly`, so the old menu could never show Writing;
  - version 33, published 11:18 UTC, checksum `e7e56cbf60dd`, `rebuild: not_configured`. This PR bakes it.

## Verification

- Site: `tsc`, `lint`, 409 tests, `build`, `prerender:check` (11 routes), `size:check` on Node 20.
- The guard tests were checked against the fault: a static import of the snapshot in `src/content/index.ts` fails `entry-imports.test.ts`.
- Built site in the browser pane (`vite preview`): `/`, `/work/norav` and `/about` hydrate from their prerendered markup; an unknown address renders the not-found page; a client-side link from `/about` to `/work` renders; the terminal's `whoami` reads the profile through `current.ts`. At 375 px `/` hydrates with no sideways scroll. The console was empty except for the deliberate 404. `npm run dev` renders `/` from the dynamic import.
- Post, on the rehearsal's version 33, built locally:
  - 13 routes, 12 cards, `prerender:check` clean;
  - `size:check` on Node 20: JS 320.5 KB raw and 104.5 KB gzip, content 51.5 KB raw and 17.3 KB gzip;
  - headless Chrome at 1440 and 375 px on `/writing`, the post and `/work/norav`: one H1 each, hydrated, no sideways scroll, empty console;
  - worst cases at 320, 375 and 1440 px: an unbroken 70-letter title word, a long address, a long code line, ten tags, three cards. They found clipped titles and cards widened by one word, both fixed.
- Lighthouse 13.6.0, mobile preset, median of 3, local `vite preview` on version 33:
  - `/writing` was 77/93/100/100 with CLS 0.41 before the stylesheet and heading fixes, and 100/100/100/100 after, LCP 0.90 s, CLS 0.001;
  - the post 100/100/100/100, LCP 0.90 s, CLS 0.005;
  - `/about` 96/100/100/100, LCP 2.85 s on its photo. The live `/about` on version 32 reads 99, LCP 2.01 s. Not compared with `main` built locally.
- On version 32 with this code (what deploys on merge): 11 routes, `prerender:check` clean, JS 320.5 KB and 104.5 KB gzip. `/`, `/about` and `/work/norav` at 1440 and 375 px: footer unchanged, no sideways scroll, empty console; `/writing` stays a 404.
- Site: `tsc`, `lint`, 426 tests. CMS: `typecheck`, 118 tests, `build`. `db`: 224 checks, 7 new for 0041.
