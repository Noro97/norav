# S9: Lab teaser and catalog

You're connecting Creative-Lab to the main site properly, now that both are live. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D7, D8, D11, D12
- What S7 left in `.tasks/done/`

## 2. Where we are

`/lab` should be live with an approved set of exhibits, and has no presence on the landing page. If it isn't live, stop and say so, because S7 comes first.

## 3. Goal and principles

- One short teaser on the landing page, editable in the CMS. It must not affect D11: a static poster or a short muted clip that loads on demand, and no Lab code.
- The CMS holds a small Lab catalog (title, one line, poster, link), so the teaser and any future index don't need a code change.
- In the `creative-lab` repo, split the all-scenes stylesheet, so each exhibit loads only its own CSS.

## 4. Reference

- Real captures of real exhibits only (D12).
- Stylesheet entry: `packages/catalog/src/styles.css` in `~/Desktop/projects/pet-pr/creative-lab`.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Publishing is gates G2 and G3.

## 6. Tasks in order

1. Add the catalog model and CMS editing, with a migration and tests.
2. Add the teaser block to the home page. Measure Lighthouse before and after.
3. Capture posters and clips from the live exhibits.
4. Open the PR. **Report to me and wait** for merge and publish.
5. In a separate PR in the `creative-lab` repo, split the stylesheet. Measure the size before and after, and check every public exhibit.

## 7. At the end

Update `.tasks/`, with the Lighthouse result and the stylesheet size.
