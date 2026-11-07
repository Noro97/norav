# S7: Creative-Lab at /lab

You're working in the `creative-lab` repo, at `~/Desktop/projects/pet-pr/creative-lab`. You're auditing its 30 exhibits, publishing the best 8–10, and serving them at `norav.dev/lab`. This runs after S6 and doesn't block launch. Reply in whichever language the owner writes in.

## 1. Read first

From the Norav repo at `~/Desktop/projects/webapp`:

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D7, D8, D11, D18

From this repo:

- `README.md` and any `CLAUDE.md` or `AGENTS.md`
- `packages/catalog/src/catalog.ts`

## 2. Where we are

- Turborepo with pnpm 12 and Node 22.18 or newer. A Vite SPA in `apps/portfolio`, with hash routes `#design-lab` and `#<id>`, plus Storybook.
- 30 exhibits in six groups. JavaScript loads lazily, but `packages/catalog/src/styles.css` imports every scene into one stylesheet of about 535 KB.
- 54 asset files, 51.6 MB. It has no deployment or live URL.
- Eight exhibits are Russian-only, according to the docs. Verify that.
- The checkout is on `feat/github-actions-ci`, one commit ahead of `main`. Check whether that's ready to merge before branching.
- Scanned helmets, GLB models and other assets may have licensing questions.

## 3. Goal and principles

- Visitors experience one site. `norav.dev/lab` works and has a clear way back.
- **Nothing here touches the hiring path:** no shared code, no shared bundle. The only change on the main site is a rewrite and a link.
- Fewer, better exhibits. An exhibit that stutters on a mid-range phone or has unclear asset rights stays out.
- Accept the big stylesheet for now if it would take long to fix. The Lab is allowed to be heavy, and S9 can shrink it.

## 4. Reference

- The main site's `vercel.json` has a catch-all rewrite to `index.html`. A `/lab` rewrite must come before it, pointing at the Lab's Vercel deployment.
- The Lab's Vite `base` must become `/lab/`, including assets and workers.
- Exhibits use `document.body` in 8 places, and `eyewear` and `health` need `ToastProvider` from the host. These matter only for exhibits you keep.
- **Skills:** this repo doesn't load the Norav project's skills, so read them from `~/Desktop/projects/webapp/.claude/skills/<name>/SKILL.md`. Use `animation-performance` for the smoothness check in task 2, `performance` for the asset sizes, and `accessibility` for task 5.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Making this repo public is gate G5, and only the owner says yes to it. `merge-when-green` exists only in the Norav repo, so here, read the checks and merge yourself.

## 6. Tasks in order

### Stage 0: baseline

1. Install, build, test and lint with the repo's own scripts, and report the state.

### Stage 1: audit

2. For each exhibit, at desktop and 375px, check:
   - does it run?
   - does it stay smooth, by an actual measurement or an honest visual judgement?
   - is it in English?
   - are there console errors?
   - what's its asset size?
   - where do its assets come from, and what's the licence?
3. Choose 8–10, with at least one from most groups, and record your reasons. The owner sees the list with the result, and can veto any of them then (D8).

### Stage 2: publish the set

4. Add a public allow-list to the catalog, so only the chosen exhibits are listed and routable in production. Keep the others for development.
5. Set the base path, add a title and metadata, and a link back to `norav.dev`. Handle reduced motion, and give a clear message where WebGL isn't available.
6. Fix what the chosen exhibits need to work under `/lab/`.
7. Open a PR in this repo.

### Stage 3: deploy

8. Create the Vercel project with the `vercel` CLI, which the owner approved on 2026-11-07: root directory, Node version, build command and output directory. Never sign in yourself. If the CLI isn't signed in, give the owner those steps in one message and wait.
9. Check the deployment at its own URL.
10. Open a second small PR in the Norav repo, with the `/lab` rewrite above the catch-all. Add a footer link only if S5 has merged. Otherwise leave a note for S9.
11. After both merge, check `norav.dev/lab` and each exhibit at desktop and 375px, and confirm the main site's bundles are unchanged.

### Stage 4: going public

12. Scan this repo's full history for secrets, printing masked results only. Check asset licences again for anything in the history that couldn't be published.

**Report to me and wait.** Making it public is the owner's decision (D18).

## 7. At the end

Update `.tasks/` in the Norav repo through its PR: the chosen list, the live URL, and what's left for S9. Then start S8 (D24).
