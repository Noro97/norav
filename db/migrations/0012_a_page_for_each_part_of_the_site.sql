-- =============================================================================
-- norav CMS · 0012 · A page for each part of the site
--
-- 0011 gave the five case studies pages of their own and left the other
-- thirteen sections stacked on the home page. This finishes the split: each
-- part of the site gets an address, and the home page becomes a front door
-- rather than the whole building.
--
-- `site` is the exception and the reason this works at all. Its blocks render
-- below every page, so the footer stays a footer instead of belonging to
-- whichever page it happened to land on. It is an ordinary page otherwise —
-- editable, previewable, reachable at /site.
--
-- The placement below is a starting point, not a verdict. Every one of these
-- can be moved in the admin now, which is the whole point of the page that
-- shipped before this one.
-- =============================================================================

insert into pages (slug, status, seo)
values
  ('site',       'published', '{}'::jsonb),
  ('about',      'published', '{}'::jsonb),
  ('experience', 'published', '{}'::jsonb),
  ('skills',     'published', '{}'::jsonb),
  ('work',       'published', '{}'::jsonb),
  ('automation', 'published', '{}'::jsonb)
on conflict (slug) do nothing;

-- Position restarts per page and keeps the order these had on the home page,
-- so a page holding two sections shows them the way they were read.
with placement(type, page, rank) as (
  values
    -- The front door: who, the numbers, and a way to get in touch.
    ('hero',            'home',       1),
    ('impact_strip',    'home',       2),
    ('contact_cta',     'home',       3),

    ('about',           'about',      1),
    ('vibecoding',      'about',      2),
    ('tech_marquee',    'about',      3),

    ('experience',      'experience', 1),

    ('capabilities',    'skills',     1),
    ('skills',          'skills',     2),

    -- The index that introduces the case studies, and the tiles that summarise
    -- them. The five studies themselves already live under work/.
    ('projects_intro',  'work',       1),
    ('bento_grid',      'work',       2),

    ('workflow',        'automation', 1),

    ('terminal_footer', 'site',       1)
)
update blocks b
   set page_id = p.id, position = placement.rank * 1000
  from placement
  join pages p on p.slug = placement.page
 where b.type = placement.type
   and b.deleted_at is null;
