-- =============================================================================
-- norav CMS · 0036 · The Lab on the home page
--
-- S9's copy, written as drafts. Nothing here is live until a release publishes
-- it, and the owner reviews it on the finished page first (D23).
--
-- 1. The `lab` collection gets nine of the ten exhibits norav.dev/lab serves, in
--    the order the teaser shows them: the first three are on the home page. Each
--    is a title and one line, drawn from the Lab's own catalog, a link into the
--    Lab, and a poster. The first three also have a clip. The tenth, the
--    inflatable wallet-onboarding concept, stays in the Lab and out of this list:
--    its name is a claim "Do not use" in facts.md bans, and a card with it on
--    this site would read as that claim.
-- 2. The home page gets the teaser, between the experience list and the contact
--    block: craft, shown briefly, after the work and before the ask.
--
-- Posters and clips are files in the site's public folder, named by path, as the
-- case studies' footage is. Every one is a capture of the live exhibit (D12).
--
-- A second run writes the same values again. A database with no site yet, like
-- the one the schema tests build before their fixtures, is left as it was.
-- =============================================================================

-- Content means a seeded or imported site, which always has a hero.
create temporary table before as
  select exists (select 1 from blocks where type = 'hero' and deleted_at is null) as has_content;

do $migration$
declare
  home uuid;
  teaser uuid;
  after_position numeric;
  before_position numeric;
  teaser_position numeric;
begin
if not (select has_content from pg_temp.before) then
  return;
end if;

-- 1. The exhibits ---------------------------------------------------------------
insert into entries (collection, slug, position, is_visible, data)
values
  ('lab', 'thermal',         1000, true, '{"href":"/lab/#thermal","poster":"/assets/lab/thermal-v1.webp","clip":"/assets/lab/thermal-v1.mp4"}'::jsonb),
  ('lab', 'globe',           2000, true, '{"href":"/lab/#globe","poster":"/assets/lab/globe-v1.webp","clip":"/assets/lab/globe-v1.mp4"}'::jsonb),
  ('lab', 'axiom',           3000, true, '{"href":"/lab/#axiom","poster":"/assets/lab/axiom-v1.webp","clip":"/assets/lab/axiom-v1.mp4"}'::jsonb),
  ('lab', 'camera',          4000, true, '{"href":"/lab/#camera","poster":"/assets/lab/camera-v1.webp","clip":""}'::jsonb),
  ('lab', 'avatar',          5000, true, '{"href":"/lab/#avatar","poster":"/assets/lab/avatar-v1.webp","clip":""}'::jsonb),
  ('lab', 'tactile-glitch',  6000, true, '{"href":"/lab/#tactile-glitch","poster":"/assets/lab/tactile-glitch-v1.webp","clip":""}'::jsonb),
  ('lab', 'legal',           7000, true, '{"href":"/lab/#legal","poster":"/assets/lab/legal-v1.webp","clip":""}'::jsonb),
  ('lab', '2048',            8000, true, '{"href":"/lab/#2048","poster":"/assets/lab/2048-v1.webp","clip":""}'::jsonb),
  ('lab', 'bomber',          9000, true, '{"href":"/lab/#bomber","poster":"/assets/lab/bomber-v1.webp","clip":""}'::jsonb)
-- The unique index is partial, so the conflict target carries the same predicate.
on conflict (collection, slug) where deleted_at is null do update
  set position = excluded.position, is_visible = true, data = excluded.data;

insert into entry_translations (entry_id, locale, data, status)
select e.id, 'en', t.copy::jsonb, 'ready'
  from entries e
  join (values
    ('thermal',        '{"title":"Aeris Thermal Zero","line":"A city''s heat and airflow, simulated in the browser, with the city generated in a Web Worker."}'),
    ('globe',          '{"title":"Logistics 3D Globe","line":"A globe drawn from coastline data, with flight arcs between hubs and labels laid over it."}'),
    ('axiom',          '{"title":"AXIOM//GRID","line":"An infrastructure dashboard: a 3D network of nodes, a plan view, and synthetic telemetry with alarms."}'),
    ('camera',         '{"title":"Optic Lab","line":"A camera on a workbench: focal length, aperture and focus drive a thin-lens model and a live depth of field."}'),
    ('avatar',         '{"title":"Holographic Avatar","line":"A cloud of GPU particles that changes shape with sound, analysed live with Web Audio."}'),
    ('tactile-glitch', '{"title":"Tactile Type · Glitch","line":"Inflated 3D letters that react to the pointer, over a glitch field, for an imaginary studio''s home page."}'),
    ('legal',          '{"title":"Adaptive AI Legal OS","line":"An interface study for a contract-review workspace, with a live hex data stream and a layout that packs itself."}'),
    ('2048',           '{"title":"2048 3D","line":"The sliding-number puzzle on a 3D board, with sound and keyboard or swipe controls."}'),
    ('bomber',         '{"title":"Blast Haulers","line":"An arcade game: drive a bomb cart through a generated arena and clear it before the fuse runs out."}')
  ) as t(slug, copy) on t.slug = e.slug
 where e.collection = 'lab' and e.deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';

-- 2. The teaser -----------------------------------------------------------------
select id into home from pages where slug = 'home';
if home is null then
  return;
end if;

select id into teaser
  from blocks
 where page_id = home and type = 'lab_teaser' and deleted_at is null
 order by position
 limit 1;

-- After the experience list and before the contact block, wherever those are now.
select position into after_position
  from blocks where page_id = home and type = 'experience' and deleted_at is null order by position limit 1;
select position into before_position
  from blocks where page_id = home and type = 'contact_cta' and deleted_at is null order by position limit 1;

if after_position is not null and before_position is not null and after_position < before_position then
  teaser_position := (after_position + before_position) / 2;
elsif before_position is not null then
  teaser_position := before_position - 1;
else
  teaser_position := coalesce((select max(position) from blocks where page_id = home and deleted_at is null), 0) + 1000;
end if;

if teaser is null then
  insert into blocks (page_id, type, position, anchor_id, settings, is_visible)
  values (home, 'lab_teaser', teaser_position, 'lab', '{"count":3,"linkHref":"/lab/"}'::jsonb, true)
  returning id into teaser;
else
  update blocks
     set position = teaser_position,
         anchor_id = 'lab',
         settings = '{"count":3,"linkHref":"/lab/"}'::jsonb,
         is_visible = true,
         version = version + 1
   where id = teaser;
end if;

insert into block_translations (block_id, locale, content, status)
values (teaser, 'en', $json${
  "sectionLabel": "Lab",
  "title": "Experiments I build to learn.",
  "description": "Simulations, 3D and games that run in the browser. They live in a separate app, so none of their code loads until you open one.",
  "linkLabel": "Open the Lab"
}$json$::jsonb, 'ready')
on conflict (block_id, locale) do update set content = excluded.content, status = 'ready';

delete from block_translations where block_id = teaser and locale <> 'en';
end
$migration$;

drop table pg_temp.before;
