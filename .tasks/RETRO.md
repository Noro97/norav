# Retrospective log

Lessons for this repository. Read after `STATE.md` every session. Newest first. Append, and never delete.

## Lessons

### 2026-11-06: Sessions merge their own PRs now, and nothing checks them

The owner decided this on 2026-11-06 (D20), and no longer reviews or merges PRs. That removes the last person looking before `main` deploys. GitHub won't help: `main` has no branch protection, because that needs GitHub Pro or a public repo, so `gh pr merge` works on a red PR, and auto-merge is off. Read the checks on the latest commit yourself, and pin the merge to that commit. `--match-head-commit` needs the full hash, and a short one fails.

A session also can't be told when CI passes. Auto-fix wakes it on failures and comments only, the app can refuse to turn it on, and sessions don't poll. So if CI is still running when the work is done, the merge waits for the next message, and the final message has to say that. Auto-merge would close this gap, but it's off here, and it needs the branch protection above.

### 2026-11-06: A green CI step can still have done nothing

"Keep the Lighthouse report" passed on its first run and saved nothing. `upload-artifact` skips hidden folders, and `if-no-files-found: ignore` told nobody. It only showed up by reading the run's log after the merge. Read the log of a new CI step on its first run, and don't use `ignore` on output you rely on.

### 2026-11-06: Publish validation checks shape, not truth

On a copy of production, the pending migrations put back 98.4%, TON, Staff, in production and every `[Placeholder`, and validation passed all of it. Nothing automatic stops a false claim from publishing. Compare `buildPublication()` with the latest publication, and read the difference.

### 2026-11-06: A cleanup script is only as good as the database it was written against

`content:honest` had never met production. It refused outright, because `home/bento_grid` and `contact/contact_cta` exist only in a local database built another way. With both names fixed it still left 34 hits, because it was written before the case-study copy mattered. A restored copy found this in minutes, where reading the script would not have. Rehearse any production script on a copy of production first.

### 2026-11-06: Going back to the publication beats correcting the copy

Correcting what the migrations wrote would have meant 70 reviewed edits, on rows S4 deletes and copy S5 replaces. Restoring the drafts from the latest publication needs no new copy and no review, and its success is checkable: the difference from the publication is empty, or it isn't.

### 2026-11-06: A Lighthouse number means nothing without its version

The same build read LCP 3.5s and score 84 on Lighthouse 12, and 1.58s and 99 on Lighthouse 13. Pin the version, and compare a number only with others from that version. `@lhci/cli` 0.16 brings 13 and needs Node 22, so CI gives that one step its own Node.

### 2026-11-06: A budget in the build would let a publish break a deploy

The Vercel build bakes whatever is published into the entry chunk, so a size check inside `npm run build` could fail a deploy because someone published content. It runs as a CI step on the committed snapshot instead. `content:check` stays out of CI for the same kind of reason: it would turn every open PR red after a publish.

### 2026-11-06: `pull:production` can't work while production is behind

It refuses unless both databases have the same migrations, and the embedded database applies all of them every time it opens. So it refused for as long as production sat on 17 of 31. Copy production with `pg_dump` until the catch-up has run.

### 2026-11-06: A migration count isn't a migration list

Production's "17 of 31" read as 0001–0017. It was 0001–0015, 0028 and 0030, and the difference decides whether publishing works at all. Publishing queries `posts`, which 0030 adds. Read `schema_migrations` instead of counting.

### 2026-11-06: Publishing releases every draft

Production drafts held a footer change from 22 Sep that nobody remembered, and publishing would have removed the terminal from the live site. Comparing `buildPublication()` with the latest publication shows what a publish will really do, and comparing each field's old value stopped the script before it wrote anything. Do both before any scripted edit.

### 2026-11-06: Searching for a claim doesn't find a fabricated number

`98.4` was also written as `984 / 10`. Latency was `Math.random()`, a "500 node" test added 40, a hit rate was a literal, and a counter showed 80% of each number until scrolled to, which read as "6+ years" in a screenshot. Read what a widget computes, and read the rendered page.

### 2026-11-06: A publish outside the CMS doesn't rebuild the site

The deploy hook URL exists only on the CMS project. A publish from anywhere else reports `not_configured`, so the old copy stays in the bundle and paints first until the next deploy.

### 2026-11-06: The session rules can't finish in one PR when a publish comes after the merge

"These updates go in the same PR" doesn't fit a session whose last stage runs after its merge. S1 needed a small second PR for state, the refreshed snapshot and cleanup. Expect the same in S3–S6, and rebake the snapshot in it.

### 2026-11-06: The owner delegated S1's production steps, once

The owner told the S1 session in chat to run the production steps and publish. That covers S1 only. The rule stands: sessions prepare and verify, and the owner runs production.

### 2026-11-05: Nothing counts until it's published

The September rebuild merged 21 PRs in three days and stopped before its copy or content reached production. Six weeks later the live site still had the old content. Publishing is now an early and repeated step, not the last one.

### 2026-11-05: `main` deploys, and production content can be far behind

Production had 17 of 31 migrations and content from 11 Sep while `main` kept moving. Code that merges has to work with what's published now, not with the local database. Check `https://cms.norav.dev/api/health` first.

### 2026-11-05: Text in a file named "honest" can still be wrong

`honest-content.data.mts` carries "92% test coverage" for a repo with no test files. Check claims against their source, including claims in files meant to fix claims.

### 2026-11-05: The tracker can lag or overclaim

In earlier projects, `STATE.md` claimed things were real that were stubs, and missed work that had shipped. The September checkbox plans here show 8 of 91 boxes ticked after most of that work merged. Read the code before believing any tracker, including this one.

### 2026-11-05: Tool notes

- The default shell is zsh, and unquoted variables don't split into words. `for x in $LIST` runs once. Pipe to `while read -r x` instead.
- zsh has no `PIPESTATUS`, so a piped command's exit code comes back blank. Check `$?` without the pipe.
- This machine runs Node 26, and CI runs 20. Gzip sizes differ by about 0.3% between them. Use `PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"` to match CI.
- A private Postgres on macOS needs `LC_ALL=en_US.UTF-8`, or it stops with "postmaster became multithreaded during startup".
- A CMS script that imports `src/lib/db` statically crashes on Node 20 once `DATABASE_URL` is set: `tsx` can't resolve `pg` from there. Import it dynamically, as `pull-production.mts` and `catch-up.mts` do.
- Any edit in the worktree reloads the Vite page, because Tailwind watches it. Don't edit files while a browser check is running.
- `npm --prefix cms install` rewrites `cms/package-lock.json` on this machine. Restore it, and don't commit the noise.
- The anonymous PageSpeed API quota runs out. Run Lighthouse locally.
- Without `-L`, `curl` on `norav.dev` assets can return an empty body.
- `select version::text ... order by version` sorts as text, so 9 beats 26. Qualify it as `publications.version`.
- `cd` in one Bash call carries into the next. Use a subshell or an absolute path.
- Vercel previews sit behind Vercel sign-in. Check redirects on production after the merge, with `curl` without `-L`.
- Another project's Vite can already hold port 5173, and `.claude/launch.json` pins `site` to it. Check with `lsof -nP -iTCP:5173 -sTCP:LISTEN` before trusting what's on that port.
- The dev console is never empty: it logs web vitals and, with no local CMS, a refused connection to `localhost:3300`. For the empty-console check, use `npm run build` then `npm run preview`, which calls no CMS unless `VITE_CMS_URL` is set.
