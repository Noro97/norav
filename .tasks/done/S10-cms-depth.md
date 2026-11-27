# S10: CMS depth

**Status:** done, 2026-11-23. PR #146. Migration 0039 on production with the owner's yes, given in this session; version 31 unchanged.
**Origin:** `docs/plan/prompts/S10-cms-depth.md`, started by S9 under D24. Branch `claude/blissful-wiles-520702`, cut from `main` at `6ac43ec`.

## What the prompt assumed, checked

- Production: 38 migrations, version 31, published 2026-11-21 22:06 UTC (`api/health`, 2026-11-22). Matches `STATE.md`.
- `publications`: immutable rows, readable by `?v=`, nothing restored one. True.
- `revisions`: written before every save of a block translation, a collection entry and a setting. Nothing read it except `pull:production`, which copies it.
- Page metadata: a search title and description per page and locale were already editable in the page's settings dialog, and the prerender already wrote them. `seo.ogImage` was accepted by the API and read by the site, but no field set it, and publish passed `seo` through without resolving library ids.
- `audit_log`: written by every admin write and every publish.
- The norav.dev case study says "35+" migrations and "28" CMS API routes. Before S10: 38 and 28.

## Done

1. **Publication history and restore.** History in the admin's Library lists the last 100 versions: when, by whom, the note, which is live and which are restores. Restore… checks the old content against today's registry, profile and media, lists what changes page by page against the live version, and publishes it again as a new version with `restored_from` (migration 0039) and an audit entry `publication.restore`. Refused: a removed block type, invalid content, a missing language, an invalid profile, a file swept from storage, a stale confirmation (409). Same content as live: no new version.
2. **Publishing over a restore asks first.** The drafts stay as they were, so `POST /api/admin/publish` answers 409 `restore_live` until the caller passes `replaceRestore`. The five editors' copies of the publish call are one helper, `lib/publish-client.ts`, which asks with `confirm()`. History says whether the drafts match the live site.
3. **Block revisions:** small, so built. History in a section's editor lists its last 30 earlier texts in the language on screen, each diffed against the form. Choosing one fills the form; Save validates it and keeps the current text as a revision. Collection rows and settings keep revisions too, with no screen: not built.
4. **Share image per page.** Settings dialog: a share image (library file, site path or https URL; PNG, JPEG or GIF) and its alt text, per language. Publish resolves the library id and refuses a file that left the library. The prerender writes `og:image`, `twitter:image` and both alts, and drops the shell's 1200×630 size for a page's own image. The shell's card and alt stay for every page without one.
5. **Release script:** `--restore <version>`, with the same dry run and `--expect` as a release. A release's dry run says when the live version is a restore.
6. **Small fixes found on the way:** `dev:local` blanks `SITE_DEPLOY_HOOK_URL`; `pull:production` copies publications oldest first, for the new self-reference; at 375 px the admin's tables no longer widen the page, and wide dialogs fit.
7. **Docs:** `README.md`, `cms/README.md`, the runbook's "Roll back".

## Verification

- `db`: 211 checks, 3 new for 0039.
- CMS: `typecheck`, 118 tests (26 new: restore and history 17, block revisions 5, share image 4), `build` on Node 20.
- Site: `tsc`, `lint`, 373 tests (6 new), `build`, `prerender:check` (11 of 11), `size:check`: JS 362.6 KB of 363 raw, 118.2 KB of 119 gzip (was 362.4 and 118.1).
- Built pages without their own image keep `og.png`, its size and its alt, byte for byte.
- Browser, CMS on the embedded database at 1440 and 375 px: publish, block History and "Put in the form", History, the restore dialog, a restore to version 3, the manifest serving version 1's checksum, Publish asking over a restore from the Palette screen, the share image refusing SVG and saving PNG. Console: only the expected 401s before sign-in, the 409 and 422 tested on purpose, and 404s for a site path's thumbnail (known debt).
- Release script on the embedded database: dry runs, a wrong `--expect` refused, a real restore.
- Not run: anything on production.

## Production, 2026-11-23

Through the runbook, with the owner's yes:

1. Backup `~/Desktop/norav-content-2026-11-23.dump`, 498 KB, at 38 migrations and version 31.
2. Rehearsal on a private Postgres restored from it: 0039 applied; a release's dry run showed 0 changes against version 31, same checksum; `--restore 30` showed its changes page by page and wrote version 32 with version 30's own checksum, so today's checks changed nothing in it; the release after it said the live version was a restore and put 31's content back as version 33.
3. 0039 on production: 39 of 39, `publishedVersion` 31. Nothing published.

## Case study counts

Recounted on the merged code: 32 API routes in the CMS (28 before S10) and 39 migrations. `/work/norav` says "28" routes, which is now out of date, and "35+" migrations, which holds. "590+" tests holds: 389 site, 118 CMS and 211 schema checks make 718. Making the routes "30+" is a copy question for the owner, asked and not yet answered, so nothing was published.

## Left

- "28" routes becomes "30+" in S11's release. The owner answered on 2026-11-27.
