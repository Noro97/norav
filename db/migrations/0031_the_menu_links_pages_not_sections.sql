-- =============================================================================
-- norav CMS · 0031 · The menu links pages, not sections
--
-- When the site was one long page, the menu scrolled to sections and wrote
-- their anchors into the address, and links in the copy pointed at them the
-- same way: a "Get in touch" button held `#contact`. Every one of those
-- sections is a page of its own now. The site navigates by route only, and
-- /about#about said the same thing twice.
--
-- Two cleanups follow, both of data the site already copes without:
--
-- 1. Menu items lose their `anchor`. The admin no longer shows the field, and
--    a key nobody can see or edit is dead data.
-- 2. A JSON string that is exactly `#<anchor>` of a live section becomes the
--    path of the page that section is on — `#contact` → `/contact`, and the
--    home page's sections → `/`. The site gives a path its language prefix, so
--    the Russian copy needs no second rewrite. Matching the quoted value, so a
--    hash inside a sentence is left alone; anchors are lowercase words, so no
--    colour value can collide with one.
-- =============================================================================

update entries
   set data = data - 'anchor'
 where collection = 'navigation'
   and data ? 'anchor';

do $$
declare
  target record;
  needle text;
  replacement text;
begin
  for target in
    select distinct on (b.anchor_id) b.anchor_id, p.slug
      from blocks b
      join pages p on p.id = b.page_id
     where b.anchor_id is not null
       and b.deleted_at is null
     order by b.anchor_id, (p.status = 'published') desc, b.updated_at desc
  loop
    needle      := to_jsonb('#' || target.anchor_id)::text;
    replacement := to_jsonb(case when target.slug = 'home' then '/' else '/' || target.slug end)::text;

    update blocks
       set settings = replace(settings::text, needle, replacement)::jsonb
     where strpos(settings::text, needle) > 0;

    update block_translations
       set content = replace(content::text, needle, replacement)::jsonb
     where strpos(content::text, needle) > 0;

    update entries
       set data = replace(data::text, needle, replacement)::jsonb
     where strpos(data::text, needle) > 0;

    update entry_translations
       set data = replace(data::text, needle, replacement)::jsonb
     where strpos(data::text, needle) > 0;
  end loop;
end
$$;
