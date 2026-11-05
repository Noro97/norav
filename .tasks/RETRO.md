# Retrospective log

Lessons for this repository. Read after `STATE.md` every session. Newest first. Append, and never delete.

## Lessons

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
