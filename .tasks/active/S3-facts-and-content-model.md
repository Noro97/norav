# S3: Facts and content model

**Status:** in progress
**Origin:** `docs/plan/prompts/S3-facts-and-content-model.md`, started 2026-11-06 from `main` at `1ae3c3f`, after merging #111.

## What's being done

- One source for profile facts: `settings.profile` in the CMS, read by the terminal's prompt, JSON-LD, the page shell and the terminal's own commands.
- A `case_study` block, unplaced, with context, problem, decisions, outcome and retro.
- Video in the media library, with direct upload to Blob and a player that loads nothing until needed.
- Production caught up by the owner, using the runbook.

## How it'll be verified

- Site, CMS and schema checks on Node 20.
- `dist/index.html` compared with the one built from `main`: the same apart from asset hashes.
- The whole catch-up sequence run on an embedded database at production's 17 migrations.
- Desktop and 375px in a browser, with an empty console, against the published snapshot and against a draft preview of a `case_study` block.
- After the owner's catch-up: `api/health`, the manifest, the claim search, and the pages at both widths.

## Where it got to

Stage 0.
