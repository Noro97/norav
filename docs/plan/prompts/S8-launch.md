# S8: Launch

You're doing the last checks and getting the repo ready to go public. Find what's wrong, don't add features. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, `docs/plan/facts.md`, `docs/plan/runbook-publish.md`
- `.tasks/done/`, to see what each session claims it did

## 2. Where we are

- S1–S6 should be merged and published. S7 may or may not be. Check all of this against the live site, not the tracker.
- The earlier secrets scan was pattern-based and only covered history up to 5 Nov. It doesn't count.

## 3. Goal and principles

Milestone 1 is met: the site is true, fast and clear, and the repo is safe to read. If something fails, report it and fix what's small. Anything larger goes back to the owner with a recommendation, rather than expanding this session.

## 4. Reference

- D11 for targets.
- **Skills:** `web-quality-audit` for the shape of Stage 1, using `STATE.md`'s Lighthouse method, with `seo` for task 6 and `accessibility` for task 7. Use `best-practices` for headers and source maps, and `web-design-guidelines` for a last pass over the UI code. They find problems. They don't widen this session.
- `gitleaks` isn't installed. Ask before installing it. If the owner declines, write a pattern scan in your scratchpad that covers keys, tokens, database URLs and private keys across `git log --all -p`. Print masked results only.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Making the repo public is gate G5. It's the owner's yes, and hard to undo, because public history can be copied.

## 6. Tasks in order

### Stage 0: content

1. Read every live page as a hiring manager would.
2. Check every claim against `facts.md` or the code. Search the live content, built output and `src/` for each "Do not use" item.
3. Recount code-derived numbers on the site.

### Stage 1: quality

4. Run Lighthouse on the live `/`, `/about`, `/work` and each case study, using the method in `STATE.md`.
5. Crawl for broken links, and check `/cv`, every redirect, and `/lab` if it's live.
6. Check per-route metadata and link previews.
7. Test keyboard-only use, reduced motion, 375px, and a slow connection.
8. Confirm with the owner that the terminal's API key has a spending cap, then try `ask` with a few questions and check its answers against `facts.md`.

### Stage 2: repo readiness

9. Refresh the committed snapshots. Old claims in them are what a reader would find first.
10. Run the full-history secrets scan.
11. Scan tracked files and history for phone numbers and other personal data, printing masked results only. Include `.tasks/` and `docs/`.
12. Check `README.md` as a stranger's first read. It should say what this is, how it works and how to run it.
13. List remaining branches and worktrees.
14. Ask the owner whether they want a licence file. Without one, the code stays all rights reserved even when public.

### Stage 3: report

15. Give a pass or fail against each item above.

**Report to me and wait.** List what must be fixed before going public, and what can follow.

### Stage 4: go public

16. Fix what's approved, then open the PR.
17. When the owner says yes, give them the command, or run it if they ask:
    ```bash
    gh repo edit --visibility public --accept-visibility-change-consequences
    ```
18. Log out of GitHub in a private window, or use `curl`, to confirm the repo is visible and renders properly.

## 7. At the end

Update `.tasks/` and mark Milestone 1 done in `STATE.md`. Tell the owner whether the CV's norav.dev line still matches the recounted numbers, and that their private checklist is in `~/Desktop/noro/CV/Fullstack_2026-11/AFTER_LAUNCH.md`.
