# S1: Truth patch

You're making the live site truthful, quickly, ahead of everything else. This is a small patch and not a redesign. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, including "Session rules"
- `docs/plan/facts.md`
- `docs/plan/runbook-publish.md`

## 2. Where we are

- Production has 17 of 31 migrations and content version 25, from 11 Sep. Confirm with `curl https://cms.norav.dev/api/health`.
- Published content and code both carry claims listed under "Do not use" in `facts.md`, and Fendr is missing.
- Claims live in two places:
  - **CMS content:** `curl "https://cms.norav.dev/api/public/content?locale=en"`.
  - **Code:** at least `index.html`, `src/i18n/locales/*`, `src/lib/portfolio-context.ts` and `src/components/sections/BentoGrid/BentoMicroTile.tsx`. Search for yourself, because this list may be incomplete.
- The CV link is `cvHref` in the about block's settings. It points at a PDF of unknown version in Vercel Blob.
- **Unknown:** whether the production CMS can still edit and publish with only 17 migrations applied, if it's deployed from a recent `main`. This may be why the September work stalled.

## 3. Goal and principles

When this is done, nothing on the live site contradicts `facts.md`, Fendr appears in the experience list, and the CV is current at `/cv`.

- Smallest change that makes it true. Keep the current design and structure.
- Hide what can't be made true, rather than rewriting it: the Vibe Coding block, the automation page, and skill percentage bars if they imply claims.
- Don't start the brief's new copy. That's S5.

## 4. Reference

- CV source: `~/Desktop/noro/CV/Fullstack_2026-11/Norayr_Avetisyan_Fullstack_CV.html`, with `fonts/` beside it.
- Build the site's copy in your scratchpad, not in that folder. Copy the HTML and `fonts/`, remove the `tel:` link and its separator, then print:
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run --no-default-browser-check --user-data-dir="$SCRATCH/chrome" --no-pdf-header-footer --print-to-pdf="$SCRATCH/cv.pdf" "file://$SCRATCH/cv.html"
  ```
- `vercel.json` has a catch-all rewrite to `index.html`. Vercel serves real files before rewrites, and redirects run before both.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Also:

- No migrations in this session.
- Don't run or recommend `content:honest:production` until you've read what it writes against a schema of 17 migrations. It's meant for a newer schema.
- Correct `cms/scripts/honest-content.data.mts` too, so it can't bring the old claims back.

## 6. Tasks in order

### Stage 0: find the route

1. Compare what `cms/src` queries with what migrations 0018–0031 add, and list what would fail on a schema of 17.
2. Ask the owner which commit the CMS project on Vercel is running.
3. Recommend one route, with evidence:
   - **A:** the owner edits in the production CMS and publishes.
   - **B:** specific migrations are applied first, if they're needed and safe. Say which ones write content rows.
   - **C, last resort:** an owner-run script that creates a new publication from v25 with targeted replacements.

**Report to me and wait.**

### Stage 1: inventory

4. Search published content and code, case-insensitively, for everything under "Do not use", and for any other number that isn't in `facts.md`.
5. Produce a table: location, current text, replacement or "hide", and whether it's a CMS edit or a code change. Include the new Fendr entry, the corrected Proof App entry, and `cvHref`.

**Report to me and wait.** This is gate G3.

### Stage 2: the code PR

6. Apply the code changes, and update any tests that assert the old strings.
7. Add the CV PDF to `public/` and add a `/cv` redirect to it in `vercel.json`, above the rewrite.
8. Check the PDF: one page, no phone number in its extracted text, links working.
9. Open the PR. List the owner's steps in order: merge, then the CMS edits, then publish.

**Report to me and wait for the owner to publish.**

### Stage 3: verify

10. When the owner says it's published:
    - Confirm the new version from the manifest.
    - Search the published content and the live JS bundles again for every "Do not use" item.
    - Load the changed pages at desktop and 375px, and check `/cv`.
11. Report anything still wrong.

## 7. At the end

Update `.tasks/` as the session rules say, including production's new version. Your final message states what's live, what's left, and that S2 is next.
