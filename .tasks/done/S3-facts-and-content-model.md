# S3: Facts and content model

- **Status:** Done, 2026-11-07. Production has every migration and version 27. The owner's test uploads are left
- **Origin:** `docs/plan/prompts/S3-facts-and-content-model.md`, started from `main` at `1ae3c3f`, after merging #111
- **Branches:** `claude/s3-facts-and-content-model` (#112), `claude/s3-after-catch-up` (the follow-up)

## What's being done

- One source for profile facts: `settings.profile` in the CMS, read by the terminal's prompt, JSON-LD, the page shell and the terminal's own commands.
- A `case_study` block, unplaced, with context, problem, decisions, outcome and retro.
- Video in the media library, with direct upload to Blob and a player that loads nothing until needed.
- Production caught up by the owner, using the runbook.

## Decisions

**Facts: one `settings` row, not a block or a collection.** Nothing in it has a place on a page, `settings` already reaches the snapshot, and the table exists on production, so the CMS works on the current schema when this merges. It isn't localized, and D13 keeps Milestone 1 in English. S12 can decide what a translated title needs.

**The profile holds roles and approved numbers, not only identity.** The prompt says the title, years, employers and numbers are what drifted. The Experience collection can't be the source, because it doesn't hold the approved numbers: Vizogen's entry has no 500+ users and no LCP figures. So it stays as page copy, and S5 rewrites it from `facts.md`.

**Metadata at build time, the prompt at runtime.** Link unfurlers never run JavaScript, so `vite-profile-plugin.ts` fills `index.html` from the baked snapshot. `/api/chat` reads what the CMS publishes now, kept for 5 minutes, and uses the baked snapshot if the CMS doesn't answer in 2 seconds, so a corrected fact doesn't depend on a rebuild succeeding.

**A temporary fallback.** `main` deploys on merge, and version 26 had no profile, so the site needed values until the catch-up had run. `DEFAULT_PROFILE` held them, and the follow-up deleted it. A publish with no profile is now refused.

**`cat experience.txt` prints the whole profile.** It used to hold its own shorter list in `src/i18n/locales`. Choosing two highlights per role would have been a second editorial decision hidden in code, so it prints every one, wrapped to 50 columns, and the Profile screen controls it. That includes Proof App's "It has not been in production" and "It has no TON transaction code", which until now only the prompt used.

**Case studies: one new `case_study` block, and `*_detail` left alone.** A study with no demo can't hang under one, and five more types per study is what the factory was already straining at. New defaulted fields on `*_detail` would also have shown up as `NOT expected` in `content:catch-up`. With a widget, as on Proof App, the page places the widget's block above `case_study` and leaves its heading empty. The spec's `widgetCaption` is dropped, because a figure's caption and the widget's own header cover it.

**Video: Blob, direct from the browser.** There's no new service. The token names one pathname, one type and that type's limit. 50 MB per clip, mp4 or webm. Posters are ordinary library images: a figure's `image` is the poster when it has a `video`, so a clip can't be saved without one.

## How it'll be verified

- Site, CMS and schema checks on Node 20.
- `dist/index.html` compared with the one built from `main`.
- The whole catch-up sequence on a private Postgres at production's 17 migrations.
- Desktop and 375px in a browser, against the published snapshot and against a draft preview of a `case_study` block.
- After the owner's catch-up: `api/health`, the manifest, the claim search, and the pages at both widths. See below.

## Progress

### Checked at the start

`STATE.md` was accurate: `api/health` read 17 migrations and version 26. `#111` passed all five checks and was merged at `c537d52`.

### Done

- **Shell:** `dist/index.html` differs from `main`'s only in asset hashes, a comment, and the JSON-LD's whitespace. Parsed, the JSON-LD is the same, and a test holds it.
- **Terminal:** `cat about.txt` and `sudo hire` print the same text as before, checked in the built site and held by a test.
- **Rehearsal, on a private Postgres at 17 migrations:** publish works with no profile. `--through=0031` applied 14. The catch-up reported no `NOT expected`. 0032 applied 1, making 32. The next publish differs only by the expected values and `settings.profile`. The catch-up then refuses to run. The content was seeded, not a copy of production, and S2 rehearsed on that copy.
- **Built site on version 26:** `/`, `/about`, `/work`, `/work/proof` at 1440px, and `/`, `/about`, `/work/proof` at 375px. No console errors, no overflow, no broken images.
- **Draft preview of `case_study`:** both widths. Two posters loaded and no video before interaction. A pressed clip plays with controls. An autoplay clip plays muted, pauses off screen and resumes.
- **CMS, on the embedded database:** Profile screen, library, block form. The video field's picker lists only videos. Refused: signed out, other origin, wrong type, a clip with no poster, an empty name.

### Production catch-up, run by the owner on 2026-11-07

- Backup: `~/Desktop/norav-content-2026-11-07.dump`, 385 KB, 12 tables, no accounts or sessions.
- `--through=0031` applied 14, making 31. The catch-up listed 44 places and wrote them, leaving 20 expected values and no `NOT expected`. 0032 applied 1, making 32. All as rehearsed.
- The owner reset the CMS password with `user:add:production`, and published version 27 at 11:46 UTC.

### Checked after the publish

- `api/health`, uncached: 32 migrations, version 27. Manifest checksum `ea9a635bbe9a`.
- Against version 26: the same pages and block order. In each language, 3 ambient-layer settings and 7 menu anchors are gone and `settings.profile` is added, and nothing else differs.
- The published profile equals the seed the owner reviewed.
- Search of the live English content for "Do not use" claims and `[Placeholder`: 0 hits.
- The site rebuilt: the live entry baked 2026-11-07T11:46:15Z, 407.6 KB raw, 137.4 KB gzip, no zod. The shell has no placeholder left, its JSON-LD parses, and `/api/chat` answers a bad request with 400.
- `/`, `/about`, `/work`, `/experience`, `/skills` and the five `/work/*` pages in Chrome at 1470px, and in a 375px iframe: no page overflow, no broken image, no `[Placeholder`. The only "98.4" is "6,598.4 kg" in an OmniGrid demo row.
- `cat about.txt` and `sudo hire` on the live site print what they did before.

### Not verified

- Reduced motion has unit tests only. The browser pane can't emulate it.
- The browser's PUT to Blob. No local setup has a blob store, so the first real one is the owner's test upload.
- `/api/chat` end to end. `ask` is switched off, so only the handler's tests and a bad-request probe cover it.

### Left for the owner

Make two clips, upload both under Media, check their thumbnails, delete them, and report any failure. The second is over the 4.5 MB a Vercel function accepts, so it proves the direct upload.

```bash
ffmpeg -loglevel error -y -f lavfi -i testsrc2=size=1280x720:rate=30:duration=2 -c:v libx264 -pix_fmt yuv420p ~/Desktop/norav-test-small.mp4
```

```bash
ffmpeg -loglevel error -y -f lavfi -i testsrc2=size=1280x720:rate=30:duration=10 -vf noise=alls=60:allf=t -c:v libx264 -b:v 10M -pix_fmt yuv420p ~/Desktop/norav-test-large.mp4
```
