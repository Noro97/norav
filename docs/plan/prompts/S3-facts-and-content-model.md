# S3: Facts and content model

You're giving the site one source of truth for facts about the owner, adding what case studies need, and bringing production up to date. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D3, D4, D10, D17
- `docs/plan/facts.md`, `docs/plan/runbook-publish.md`
- `README.md` ("How a page reaches the screen"), `cms/README.md`, `db/README.md`
- "Content model" in `docs/archive/2026-09-redesign/specs/2026-09-22-site-redesign-design.md`

## 2. Where we are

- The title, years, employers and numbers are repeated across CMS blocks, `index.html` metadata and JSON-LD, `src/i18n/locales`, and the terminal's prompt in `src/lib/portfolio-context.ts`. They've drifted apart before.
- The five `*_detail` blocks have thin fields. The spec's `context`, `problem`, `retro` and `widgetCaption` aren't built.
- CMS uploads allow images, SVG and PDF up to 12 MB, and no video.
- Production is behind on migrations. The rehearsed sequence is in the runbook. The pending migrations write claims from "Do not use" back into drafts, and `content:catch-up` then puts the drafts back to the latest publication, so catching up changes nothing a visitor sees. Your own migrations run after that step, or it would hide what they add.
- `site_footer` on the `site` page stays hidden, with default copy that says "Frontend-focused". `content:catch-up` moves the terminal back to `site`, so pages keep it at the bottom as they do now. S5 does the real footer.

## 3. Goal and principles

- **One source:** site, terminal prompt and metadata all read profile facts from CMS content.
- **Additive only.** Nothing is removed in this session, and the live site must look the same until the owner publishes.
- A case study has context, problem, decisions, outcome and retro. It works with a widget (Proof App) and without one (Nova Prism, norav.dev).
- Prefer the smallest model that holds. Don't build a general page builder.

## 4. Reference

- Block schemas: `packages/content-schema/src/blocks`. Components: `src/content/blocks.tsx`. Publish: `cms/src/lib/publish.ts`.
- Migrations: new numbered files in `db/migrations`, idempotent, with a test block in `db/tests/schema.test.mjs`. The spec's numbering is out of date, so number from the highest file.
- Vercel limits function request bodies to about 4.5 MB. Check how the 12 MB limit works today. Video may need direct client upload to Blob.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Running the production catch-up is gate G2, and publishing is gate G3.

## 6. Tasks in order

### Stage 0: design

1. Propose where profile facts live, their schema, and how each consumer reads them, including the terminal prompt at runtime and metadata at build time.
2. Propose the case-study model: extend `*_detail`, add one `case_study` block, or both, with your reasoning.
3. Propose how video gets stored, uploaded and played. Playback must not autoplay under reduced motion, and must not load until needed.

**Report to me and wait** if any choice is a real trade-off. Otherwise continue and note it in the PR.

### Stage 1: facts

4. Add the facts source, seeded from `facts.md`. Add a CMS screen or use the existing settings UI, whichever is smaller.
5. Point the terminal prompt, JSON-LD and page metadata at it, and remove the hardcoded copies.
6. Add a test that fails if "Do not use" items from `facts.md` appear in `src/`, `index.html` or the seed data. Allow the docs that list them.

### Stage 2: case studies

7. Build the model and its rendering, unplaced for now. Empty fields hide rather than render blank.

### Stage 3: video

8. Add video to media handling, with poster images and size limits, and a player component.

### Stage 4: docs and PR

9. Bring the READMEs into line with what now exists.
10. Open the PR. Before merging, confirm it renders correctly against the currently published snapshot and works on production's current schema, then merge it.

### Stage 5: production catch-up

11. After merge, give the owner the exact sequence from the runbook, updated for this session's migrations.

**Report to me and wait for the owner to run it.**

12. Verify: `api/health` shows every migration applied, the published version moved, no `[Placeholder` text, nothing from "Do not use", and the pages still load at desktop and 375px. Refresh the committed snapshots in a small follow-up commit or PR, and delete `cms/scripts/catch-up.mts` and `cms/src/lib/restore-published.ts` with its test there too.

## 7. At the end

Update `.tasks/`. Production should now be current. Say so with the numbers from `api/health`. S4 is next.
