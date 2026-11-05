# S10: CMS depth

You're filling the CMS's real gaps, so it's a product worth showing and safer to operate. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D10
- `docs/plan/runbook-publish.md`, `cms/README.md`

## 2. Where we are

- Every publish is an immutable row in `publications`, and any version can be read, but there's no way to restore one from the admin UI.
- A `revisions` table exists. Check what writes to it and whether anything reads it.
- Page metadata should be reading from facts since S3, and per-route tags should exist since S4, but not be editable per page.

## 3. Goal and principles

- **Restore** is safe and obvious. It creates a new publication from an old one, and never rewrites history.
- **Metadata** can be edited per page, with sensible fallbacks.
- Don't add features nobody asked for.

## 4. Reference

- `cms/src/lib/publish.ts`, `cms/src/app/api/admin/publish`, `cms/src/components/ViewSwitcher.tsx`.
- `audit_log` exists. Restoring should write to it.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Don't test restore on production. Use the embedded database.

## 6. Tasks in order

1. Add a publication history view and a restore action, with confirmation and an audit entry, and with tests.
2. Decide what a block-level revision restore would need. Build it only if it's small. Otherwise say so and leave it.
3. Add per-page title, description and Open Graph fields, and make prerendering use them.
4. Update `README.md`, `cms/README.md` and the rollback section of the runbook.
5. Open the PR. **Report to me and wait** for merge and any production migration.
6. After it merges, recount the routes and migrations mentioned in the site's norav.dev case study, and report any that changed.

## 7. At the end

Update `.tasks/`.
