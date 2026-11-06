# Retrospective log

Lessons for this repository. Read after `STATE.md` every session. Newest first. Append, and never delete.

## Lessons

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
- The anonymous PageSpeed API quota runs out. Run Lighthouse locally.
- Without `-L`, `curl` on `norav.dev` assets can return an empty body.
- `select version::text ... order by version` sorts as text, so 9 beats 26. Qualify it as `publications.version`.
- `cd` in one Bash call carries into the next. Use a subshell or an absolute path.
- Vercel previews sit behind Vercel sign-in. Check redirects on production after the merge, with `curl` without `-L`.
