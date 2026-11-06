# S2 branches and worktrees (gate G4)

Counted 2026-11-06 against `origin`. The owner approved this list as proposed on 2026-11-06, and it was carried out the same day.

## Result

- **`origin`:** 59 branches deleted. `main` and this session's branch remain.
- **Local:** 56 branches deleted. `main`, this session's branch and `claude/s1-after-publish` remain.
- **Worktrees:** 4 removed. The main checkout, this session's and `sweet-darwin-0ff567` remain.
- **Still to do:** `sweet-darwin-0ff567` and its branch `claude/s1-after-publish` go once the S1 session is archived.
- **Not on the list, so left alone:** one old stash, `WIP on feat/cms-theme`.

Tips of the unmerged branches, for as long as GitHub or a local clone still holds the commits:

| Branch | Tip |
| --- | --- |
| `claude/react-components-animations-l7oltw` | `b2dd4cc` |
| `claude/relaxed-mccarthy-eqacxq` | `b1f4195` |
| `feat/cms-media` | `1abbed7` |
| `feat/motion-that-can-be-grabbed` | `54ee22c` |
| `feat/the-routes-are-the-structure` (local only) | `3e9677e` |

The routes worktree's ignored working notes (`.superpowers/`, 104 KB) were copied out of the repo first, to `deleted-worktree-notes/` in the session notes folder.

The sections below are what the owner was shown.

## Merged into `main`: 55 remote branches

Proposed for deletion on `origin`, together with the local branch of the same name where there is one.

```
2026-08-27  feat/cms-foundation
2026-08-27  feat/cms-deploy-readiness
2026-08-27  fix/cms-require-database-url
2026-08-27  fix/importer-must-not-clobber
2026-08-31  chore/readme-and-leftovers
2026-08-31  chore/switch-off-ask
2026-09-01  fix/no-flash-of-a-menu-about-to-change
2026-09-01  fix/the-site-says-where-it-lives
2026-09-01  fix/planning-notes-stay-out-of-the-repository
2026-09-01  chore/bake-the-published-content
2026-09-01  chore/take-out-what-nothing-uses
2026-09-01  feat/every-page-says-what-it-is
2026-09-01  feat/a-case-study-shows-its-decisions
2026-09-17  feat/pull-live-content-into-the-embedded-database
2026-09-21  feat/a-recruiter-can-hire-from-the-first-screen
2026-09-21  feat/proof-next-to-the-work-it-proves
2026-09-21  feat/the-founder-story-is-evidence
2026-09-21  feat/skills-say-where-they-were-used
2026-09-21  feat/the-site-speaks-in-the-readme-voice
2026-09-21  feat/case-studies-say-why
2026-09-21  feat/a-place-to-write
2026-09-21  feat/a-footer-and-a-contact-page
2026-09-21  feat/illustrations-in-the-palette
2026-09-21  feat/home-and-about-say-more
2026-09-22  feat/work-skills-experience-say-more
2026-09-22  feat/three-colours-and-one-type-scale
2026-09-22  feat/tokens-are-a-file
2026-09-22  fix/the-kit-on-a-phone
2026-09-22  feat/the-kit-on-the-scale
2026-09-22  chore/sprint-one-cleanup
2026-09-22  fix/scripts-default-to-the-embedded-database
2026-09-22  docs/site-redesign-spec
2026-09-22  feat/the-ambient-layer-is-gone
2026-09-22  feat/motion-that-can-be-grabbed-rebased
2026-09-23  fix/keep-files-the-live-site-still-shows
2026-09-23  fix/svgs-show-in-the-library
2026-09-23  fix/say-why-a-page-cannot-go
2026-09-23  fix/an-empty-page-has-settings-too
2026-09-23  fix/a-link-is-not-a-thumbnail
2026-09-23  fix/pull-test-counts-what-is-live
2026-09-23  fix/a-laptop-never-deletes-live-files
2026-09-23  feat/media-by-id
2026-09-23  feat/posts-in-the-cms
2026-09-23  feat/posts-on-the-site
2026-09-23  fix/publish-means-the-post-too
2026-09-23  fix/one-content-width
2026-09-23  fix/post-and-tool-stack-widths
2026-09-23  refactor/router-only-navigation
2026-09-23  feat/norav-logo
2026-09-25  fix/counters-show-the-number
2026-09-25  feat/every-page-says-only-what-is-true
2026-09-25  feat/leaflet-yerevan-map
2026-11-05  docs/portfolio-plan
2026-11-05  claude/sweet-darwin-0ff567
2026-11-06  claude/s1-after-publish
```

Four of these are checked out in worktrees (below), and git won't delete a local branch while a worktree holds it. Remove the worktree first.

## Local branches with no remote

| Branch | State | Proposal |
| --- | --- | --- |
| `code-quality/perf-robustness` | Merged. Its remote is gone | Delete |
| `feat/a-sidebar-that-reads-as-a-site-map` | Merged. Never had a remote | Delete |
| `claude/strange-sinoussi-0fecb9` | This session's branch | Keep until its PR merges |

The prompt counted 92 merged remote branches. There are 55 today, because the rest had already been deleted on `origin`. `git fetch --prune` cleared their stale local references on 2026-11-06, which changes nothing on GitHub.

## Not merged: 5 branches

The prompt listed four. The fifth, `feat/the-routes-are-the-structure`, exists only on this laptop, so deleting it can't be undone from GitHub.

| Branch | Holds | Worth keeping? | Proposal |
| --- | --- | --- | --- |
| `feat/cms-media` | One empty merge commit from 27 Aug. No file differs from its merge base | Nothing | Delete |
| `feat/motion-that-can-be-grabbed` | The original of `-rebased`, which merged as `a0968ce`, `645f99f` and `8e67c51`. The one extra commit makes the vibe slider throwable, and `db36949` removed that on purpose. S4 deletes the block anyway | Nothing | Delete |
| `feat/the-routes-are-the-structure` | 5 commits from 22 Sep giving every menu item an address, with its own `0028` migration. `refactor/router-only-navigation` (#100) and migration 0031 solved this differently, and its `0028` collides with the real one | Nothing | Delete, with its worktree |
| `claude/react-components-animations-l7oltw` | One commit from 4 Sep reading real colours for canvas-confetti and Google Maps. The map half is obsolete since Leaflet | The confetti bug is still on `main`, and is logged in `.tasks/bugs/confetti-colours.md` | Delete |
| `claude/relaxed-mccarthy-eqacxq` | 8 commits from 21–22 Sep: a redesign audit, a CV generator, an Open Graph card generator, a footer redesign and a grid colour fix. 72 commits behind `main` | One idea: `scripts/generate-og-card.mjs`. `main` still points `og:image` at an SVG, which link unfurlers drop. S11 plans OG images. The rest is replaced by S1's CV and the plan, and its CV generator carries old claims | Delete once S11 has the reference below |

To get the generator back after deletion: `git show b1f4195:scripts/generate-og-card.mjs`. That only works while GitHub or a local clone still holds the commit, so S11 should copy the idea, not rely on the hash.

Checked across all five: no phone number in added lines (one pattern match was a card-number placeholder in a checkout demo), no secrets. All five CV PDFs anywhere in the repo's history hold no phone number either.

## Worktrees: 7

| Worktree | Branch | State | Proposal |
| --- | --- | --- | --- |
| `webapp` (main checkout) | `main` | | Keep |
| `strange-sinoussi-0fecb9` | `claude/strange-sinoussi-0fecb9` | This session | Keep until its PR merges |
| `sweet-darwin-0ff567` | `claude/s1-after-publish` | Merged, clean. The S1 session still points at it | Remove after archiving that session |
| `docs-site-redesign-spec` | `docs/site-redesign-spec` | Merged, clean | Remove |
| `motion-that-survives` | `feat/motion-that-can-be-grabbed-rebased` | Merged, clean | Remove |
| `the-ambient-layer-is-gone` | `feat/the-ambient-layer-is-gone` | Merged, clean | Remove |
| `the-routes-are-the-structure` | `feat/the-routes-are-the-structure` | Not merged, clean | Remove, with its branch |
