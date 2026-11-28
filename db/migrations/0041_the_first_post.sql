-- =============================================================================
-- norav CMS · 0041 · The first post
--
-- S12's copy, written as drafts. Nothing here is live until a release publishes
-- it, and the owner reviews it on the finished pages first (D23).
--
-- 1. The first post, /writing/baked-content, in English only: how this site's publish
--    pipeline works, and what it costs. Its date is the day it was approved.
-- 2. /writing is published again. Its one section lists the posts, and its
--    heading says what they are. Its stored cards were 0020's placeholders;
--    the site lists the real posts in their place, and the row now holds this
--    one, so no published document names a placeholder.
-- 3. Writing joins the footer's page links, and only the footer's: one post
--    isn't worth a place in a three-item menu (owner, 2026-11-28).
-- 4. /work/norav ends with a link to the post.
--
-- The Russian copy of /writing still says what 0020 wrote. Russian is
-- redirected to English until S12 translates it.
--
-- A second run writes the same values again. A database with no site yet, like
-- the one the schema tests build before their fixtures, is left as it was.
-- =============================================================================

-- Content means a seeded or imported site, which always has a hero.
create temporary table before as
  select exists (select 1 from blocks where type = 'hero' and deleted_at is null) as has_content;

do $migration$
declare
  post uuid;
  writing uuid;
begin
if not (select has_content from pg_temp.before) then
  return;
end if;

-- 1. The post ------------------------------------------------------------------
insert into posts (slug, status, published_at, cover, tags)
values ('baked-content', 'published', '2026-11-28 09:00:00+00', '', '{CMS,Prerendering,Caching}')
-- The unique index is partial, so the conflict target carries the same predicate.
on conflict (slug) where deleted_at is null do update
  set status = 'published', published_at = excluded.published_at, cover = excluded.cover, tags = excluded.tags
returning id into post;

insert into post_translations (post_id, locale, title, excerpt, body_html, seo)
values (
  post,
  'en',
  $copy$Why this site bakes its content into the build$copy$,
  $copy$The first paint makes no request to the CMS, and a CMS outage can't break a deploy. What that bought, four things I got wrong, and what it still costs.$copy$,
  $post$<p>This site is a Vite and React 19 app. Its copy comes from a CMS I wrote, on Next.js and PostgreSQL. Sites built like that usually fetch their content when the page loads. This one doesn't. Each build bakes the published copy in, and every route is prerendered to HTML.</p>
<p>That one choice shaped most of the code on both sides. Here is what it bought, four things I got wrong, and what it still costs.</p>
<h2>One publish, one document</h2>
<p>When I press Publish, the CMS checks every block against a Zod schema. The site takes its types from the same package. A page that would render broken is refused, and the CMS names the field at fault.</p>
<p>Then the CMS does what the site would otherwise do at runtime. It orders sections, drops hidden ones, resolves images, and fills gaps in Russian with English. The result is one JSON document per language, with a SHA-256 checksum. It becomes a new row in the <code>publications</code> table, and rows are never edited. Going back to an older version publishes it again, as a new one.</p>
<p>The site's build starts by fetching the latest document. If the CMS is down, the build keeps the copy committed in the repository and carries on. A content service being down can't cost a deploy.</p>
<p>Next, every route is rendered to a real HTML file. The browser paints the page from that file, before any JavaScript runs. Nothing on that path talks to the CMS.</p>
<p>Once the page is idle, the browser asks the CMS for its manifest: the latest version and its checksum. If the checksum matches the build's, nothing happens. If it doesn't, the new copy is fetched and swapped in.</p>
<p>I wanted the site to survive without its CMS. A visitor gives a portfolio a couple of minutes. A spinner or an error on the first load would be most of the impression. On Lighthouse's mobile preset, the live home page scores 100 in all four categories. Its largest paint lands at 0.95 seconds. That's the median of three runs, on 28 November 2026.</p>
<h2>Four things I got wrong</h2>
<h3>The manifest that kept saying 9</h3>
<p>In August, three publishes in a row changed nothing on the site. The content endpoint served version 12. The manifest insisted the latest was 9.</p>
<p>The query selected <code>version::text</code> and sorted by <code>version</code>. The cast made an output column with the same name, and the sort bound to that. So versions sorted as strings, and "9" came before "12".</p>
<p>The fix was one word: <code>publications.version</code>. The lesson was bigger. A background check that can't see the state looks exactly like one with nothing to do. Nothing failed, and nothing updated.</p>
<h3>A cache keyed on the wrong thing</h3>
<p>A published version never changes, so the site cached each one for a year, as immutable. The address was the version number.</p>
<p>But a version number is only unique within one database. On my laptop the CMS runs on an embedded Postgres, and recreating it counts from one again. Version 36 can come round a second time with different content. A browser told the first one was immutable would keep serving it, reload or not.</p>
<p>The checksum is part of the address now. Ask for a version with the wrong checksum, and the CMS returns nothing rather than the wrong document.</p>
<h3>Prerendered, and still a spinner</h3>
<p>In November I measured the live site and found pages painting a spinner. Their HTML files held all the text. <code>/work</code> shifted by 0.54 as its copy arrived; Google counts anything under 0.1 as good.</p>
<p>React 19.2 streams a large Suspense boundary in two parts. The fallback comes first, then the content and a small script that swaps them. Above about 12.8 KB, a section counted as large. Every check I had passed, because each one read the page after hydration.</p>
<p>One option, <code>progressiveChunkSize</code>, turns that off. The build's prerender check now fails on the marker React leaves when it happens.</p>
<h3>The copy ate the code's budget</h3>
<p>CI fails when the JavaScript every page loads first passes 119 KB, gzipped. The baked copy sat inside that entry file. Every publish that added text took budget from the code. With version 32, the entry file was at 118.2 KB.</p>
<p>The copy is its own file now, about 14 KB gzipped, preloaded beside the entry so both download together. The code came back to 104.4 KB, under a limit of its own. The content has a separate budget, so neither can quietly eat the other's.</p>
<h2>What it still costs</h2>
<ul>
<li><strong>Two copies of the content.</strong> The CMS holds one and the build holds the other. They agree only after a rebuild. Until then, the page paints the old copy and swaps in the new one once it's idle.</li>
<li><strong>A new page waits for the build.</strong> A page published since the last build has no HTML file yet. The not-found page answers, renders the right content in the browser, and still sends a 404 until the rebuild finishes.</li>
<li><strong>Validation checks shape, not truth.</strong> The schema passes a false claim as happily as a true one. So every release starts with a dry run that prints each change. Production only accepts the checksum that dry run printed. One release I expected 58 changes, and the dry run listed 118. The other 60 were a colour theme I had saved and never published, with one colour at 1.37:1 contrast. A release publishes every saved draft, and reading that list is the only check.</li>
<li><strong>Removing a block type takes two releases.</strong> Publish validates every block against the registry. So a type's rows are retired and published first, and only then can its code go.</li>
</ul>
<h2>Would I build it this way again?</h2>
<p>For a site people read for two minutes, yes. The first paint is the part every visitor sees, and nothing between them and it can fail. What I'd change is when I looked. The spinner was invisible on my machine and plain on the live site. I'd measure the live site from the first deploy.</p>
<p>The code is public, in <a href="https://github.com/Noro97/norav">Noro97/norav</a>. The pipeline starts at <code>scripts/fetch-content.mjs</code> and ends in <code>src/content/ContentProvider.tsx</code>.</p>$post$,
  '{}'::jsonb
)
on conflict (post_id, locale) do update
  set title = excluded.title, excerpt = excluded.excerpt, body_html = excluded.body_html, seo = excluded.seo;

-- 2. /writing ------------------------------------------------------------------
select id into writing from pages where slug = 'writing';
if writing is null then
  insert into pages (slug, status) values ('writing', 'published') returning id into writing;
end if;

update pages
   set status = 'published',
       seo = jsonb_set(coalesce(seo, '{}'::jsonb), '{en}', $json${"title": "Writing — Norayr Avetisyan", "description": "Notes on the decisions behind software I've shipped, starting with how this site publishes its content."}$json$::jsonb)
 where id = writing;

insert into blocks (page_id, type, position, anchor_id, settings, is_visible)
select writing, 'kit_writing', 1000, 'writing', '{"accent":""}'::jsonb, true
 where not exists (select 1 from blocks where page_id = writing and type = 'kit_writing' and deleted_at is null);

update blocks
   set is_visible = true
 where page_id = writing and type = 'kit_writing' and deleted_at is null;

insert into block_translations (block_id, locale, content, status)
select b.id, 'en', $json${"headGlyph": "✎", "headLabel": "Writing", "title": "Notes on", "titleAccent": "how the software gets built", "titleTail": ".", "readLabel": "Read", "posts": [{"date": "Nov 2026", "reads": "5 min", "title": "Why this site bakes its content into the build", "excerpt": "The first paint makes no request to the CMS, and a CMS outage can't break a deploy. What that bought, four things I got wrong, and what it still costs.", "href": "/writing/baked-content"}]}$json$::jsonb, 'ready'
  from blocks b
 where b.page_id = writing and b.type = 'kit_writing' and b.deleted_at is null
on conflict (block_id, locale) do update set content = excluded.content, status = 'ready';

-- 3. The footer's link ---------------------------------------------------------
insert into entries (collection, slug, position, is_visible, data)
values ('navigation', 'writing', 6500, true, '{"page":"writing","external":"","footerOnly":true}'::jsonb)
on conflict (collection, slug) where deleted_at is null do update
  set is_visible = true, data = excluded.data;

insert into entry_translations (entry_id, locale, data, status)
select e.id, 'en', '{"label":"Writing"}'::jsonb, 'ready'
  from entries e
 where e.collection = 'navigation' and e.slug = 'writing' and e.deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';

-- 4. /work/norav's link --------------------------------------------------------
update block_translations t
   set content = jsonb_set(t.content, '{links}', $json$[{"label": "Writing: why this site bakes its content into the build", "href": "/writing/baked-content"}]$json$::jsonb)
  from blocks b
  join pages p on p.id = b.page_id
 where t.block_id = b.id
   and t.locale = 'en'
   and p.slug = 'work/norav'
   and b.type = 'case_study'
   and b.deleted_at is null;
end
$migration$;

drop table pg_temp.before;
