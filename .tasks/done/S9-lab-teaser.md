# S9: Lab teaser and catalog

- **Status:** Done, 2026-11-22. Version 31 is live, with migrations 0036–0038
- **Origin:** `docs/plan/prompts/S9-lab-teaser.md`, started from `main` at `5746560` (S8's state, #136)
- **PRs:**
  - #138: the schema, the teaser, 0036 and the media;
  - #140: 0037, facts that drifted;
  - #141: 0038, the new palette;
  - `creative-lab` #3: each exhibit loads its own stylesheet;
  - `claude/s9-close-d53729`: the snapshot, the size limit and this record.
- **Production at the start:** 35 migrations, `publishedVersion` 29, then 30 (the owner's publish of 2026-11-21 18:20 UTC, a trailing space in the hero)
- **Production at the end:** 38 migrations, `publishedVersion` 31, published 2026-11-21 22:06 UTC, checksum `ba5964f38581…`

## What shipped

1. **A Lab catalog in the CMS.** It is a `lab` collection with a title, one line, a link, a poster and a clip, edited in the generic collection editor. A link must start with `/lab/` or `https://`. Poster and clip are paths or library references and stay out of translation.
2. **A teaser on `/`.** The `lab_teaser` block sits between the experience list and contact and shows the first `count` rows that have a poster (default 3). It is a lazy 1.3 KB chunk with plain `<a>` links, because a router link to `/lab/` would land on this app's 404.
   - Posters are lazy below the fold.
   - A clip mounts only while a card is pointed at with a mouse or focused. It never plays under reduced motion or on a touch screen. No Lab code loads (D11).
3. **Migration 0036.** It writes nine catalog rows and places the teaser. Its copy was approved by the owner on 2026-11-22.
   - Order: thermal, globe, axiom (these three have clips), then camera, avatar, tactile-glitch, legal, 2048, bomber.
   - web3 stays out of the catalog by the owner's choice. Its title names a "Do not use" claim, and the card would read as a Web3 claim. It stays in the Lab.
4. **Media.** `public/assets/lab/` holds nine WebP posters (960×600, 368 KB in all) and three H.264 clips (800×500, 5 s, no audio: 279, 112 and 246 KB). All were captured from the live exhibits (D12).
5. **Migration 0037, facts that drifted on `/work/norav` and in the profile**:
   - "594" tests becomes "590+";
   - "35" migrations becomes "35+", both as a metric and in a decision;
   - "Each of the 28 block types" becomes "Each block type";
   - Vue.js comes out of `knowsAbout`.
   The first two fixes were approved in S8, the rest in S9. `facts.md` is recounted for 2026-11-22: 37 migrations, 28 CMS API routes, 29 block types, 653 tests.
6. **Migration 0038, the new palette (D5):** green `#338316` on deep navy `#010123`, with a rust second accent `#C32C14`. See "The theme" below.
7. **`creative-lab`: each exhibit's scene stylesheet loads with the exhibit.** The utilities stay in one sorted sheet, and the public build leaves out the hidden exhibits' sources.

## The theme

The first rehearsal's dry run showed 60 more changes than 0036 and 0037 explain. They came from a theme saved in the CMS on 2026-11-21 between 18:21 and 18:22 UTC, two minutes after version 30, and never published: `#389118`, `#4F1208` and `#010123`. A release would have shipped it with the Lab, so the release stopped there. The owner wanted a new theme.

Built on the release's content and measured with the real `deriveThemeTokens`:

| | Draft | B, shipped | Needs |
| --- | --- | --- | --- |
| White on the accent: "See the work", "Email me" | 4.01:1 | 4.77:1 | 4.5 |
| Chosen-state border on a card | 1.37:1 | 3.55:1 | 3 |
| Chosen-state text on its tint | 3.74:1 | 5.85:1 | 4.5 |
| Lighthouse on `/`, mobile | 100 / **96** / 100 / 100 | 100 / 100 / 100 / 100 | |

B keeps the draft's hues and background. The green is one lightness step darker, and the rust is lighter. The owner picked it from side-by-side screenshots ("Да, B"). 0038 writes it the way 0034 wrote the last palette, and the closing snapshot bakes it, so the first paint and the mobile `theme-color` are the new palette too.

The defaults in `packages/design-tokens` (`tokens.css`, `tokens.json`, `index.ts`), `DEFAULT_THEME` and the two fallbacks in `src` still hold the crimson palette. The prerender inlines the published palette on every route, so they don't paint. They follow in their own PR once the chosen-state fix, which may touch `tokens.css`, has landed.

## Release

| Step | Result |
| --- | --- |
| Backup | `norav-content-2026-11-21.dump`, taken at 22:00 UTC and deleted after the live check. The runbook names the file by UTC date, so it had replaced S9's earlier dump from the same day |
| Rehearsal, 0036–0038 on a private Postgres | 118 changes: 40 for the Lab (teaser, catalog, contact moving one place) and 18 for the facts (9 each in `en` and `ru`, which serves English until S12), plus 60 for the theme |
| Production dry run after `migrate` | The same 118 lines with UUIDs masked. The checksum differs only because 0036 inserts rows |
| Release | Version 31, `rebuild: not_configured` as expected |
| Live check, no sign-in, puppeteer at 1440 and 375 px: `/`, `/work/norav`, `/work/proof`, `/about` | Palette B, three Lab cards, "590+", "35+" and "Each block type is" present, none of the old wording. No errors, no failed requests, no sideways scroll |
| Content API, `en` and `ru` | Version 31, no Vue.js, metrics `35+ 28 590+ 1.3s`, nine Lab rows, theme B |

## Measured

**Lighthouse 13.6.0, mobile preset, median of 3, local `vite preview` of `dist`:**

| `/` | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Before: version 29 baked | 100 | 100 | 100 | 100 | 0.90s | 0.000 | 0 ms | 263 KB |
| Lab only: version 30 from the first rehearsal | 100 | 100 | 100 | 100 | 0.90s | 0.004 | 0 ms | 267 KB |
| Shipped: version 31, palette B, the closing PR's build | 100 | 100 | 100 | 100 | 0.90s | 0.004 | 0 ms | 267 KB |

`/work/norav` on the same build: 100 / 100 / 100 / 100, LCP 0.90s, CLS 0.000, 307 KB. At load Lighthouse requests no poster and no clip. The extra 4 KB on `/` are the `LabTeaser` chunk and the catalog in the snapshot.

**Entry bundle, version 31 baked, Node 20:**
- JS: 362.4 KB raw, 118.1 KB gzip. The raw limit goes from 362 to 363 KB in the closing PR. Gzip has 0.9 KB left, so the next sizeable publish should move the snapshot out of the entry chunk.
- CSS: 96.5 KB raw, 14.3 KB gzip.

**`creative-lab`'s stylesheet, public build:**
- The page sheet went from 536,441 B (94,169 gzip) to 183,483 B (49,322 gzip).
- The scenes are now eight separate files of 290–2,713 B, each loaded with its exhibit.
- The build went from 186 files (6.4 MB) to 194 files (6.0 MB).
- All ten public exhibits and the Lab home were checked on the live site at 1440 and 375 px: no errors, no failed requests, no overflow. Each loads the index sheet plus its own scene.

## Verified along the way

- Site: `tsc`, lint, 359 tests, build, `size:check` and `prerender:check`, on Node 20.
- CMS: 92 tests. `db`: 207 checks, with 0036–0038 each replayed on the fixtures and then again.
- CMS editor on the embedded database: a new Lab row saves (201). `/work` as a link is refused with "Starts with /lab/ or https://" (422). Once fixed, it saves (200).
- Teaser on a built site with headless Chrome:
  - Nothing comes from `/assets/lab/` at load, and posters load as the section nears the screen.
  - No `.mp4` loads until a mouse or Tab reaches a card. The clip plays muted and pauses on leave.
  - At 375 px a tap follows the link and loads no clip. Under reduced motion no clip plays.

## Noticed, not in scope

- **The chosen-state classes never compiled.** `CHOSEN` in `src/components/ui/selection.ts` named `cyan-*`, which the stylesheet resets, so the chosen option in the Proof and Merch widgets showed only a light border, in either palette. #142 fixed it from a session S9 started.
- The CMS can't preview a path into the site's public folder: posters and case-study figures show as broken images in the admin.
- Two backups from S6 are still on the Desktop (`norav-content-2026-11-10.dump`, `norav-content-2026-11-12.dump`).
