-- =============================================================================
-- norav CMS · 0024 · Illustrations in the palette
--
-- Every image on the experience entries, the project cards and the bento
-- tiles was a product mockup painted in another site's red, and each one
-- fought the palette around it. They are replaced by drawings the repository
-- generates in the palette it publishes (scripts/generate-illustrations.mjs),
-- served from /assets/illustrations and committed, so they need no upload
-- and repaint when the accent changes.
--
-- Only a slot still holding an uploaded file (an https:// address) is
-- rewritten. A slot already pointing at a path was set by hand and is left as
-- it is, which also makes the file safe to run twice. The photo on the About
-- page, the Proof badges and the CV are not images of products and are not
-- touched.
-- =============================================================================

-- Experience entries: the image lives in `data`, one per role.
update entries
   set data = data || jsonb_build_object('image', seeded.path)
  from (values
    ('proof-app',        '/assets/illustrations/proof-mini-app.svg'),
    ('vizogen',          '/assets/illustrations/vizogen-pipeline.svg'),
    ('mts-web-services', '/assets/illustrations/mts-design-system.svg'),
    ('appfox',           '/assets/illustrations/appfox-realtime.svg'),
    ('tirsoft-lead',     '/assets/illustrations/tirsoft-portfolio.svg'),
    ('tirsoft-frontend', '/assets/illustrations/tirsoft-responsive.svg')
  ) as seeded(slug, path)
 where entries.collection = 'experience'
   and entries.slug = seeded.slug
   and entries.deleted_at is null
   and coalesce(entries.data ->> 'image', '') like 'https://%';

-- The bento grid: project cards by their project key, tiles by the file they
-- held, the two named illustrations by their key. Every locale row is walked,
-- since the fields are not localised but a locale may carry its own copy.
with mapped as (
  select t.block_id,
         t.locale,
         (
           select jsonb_agg(
             case
               when coalesce(project.value ->> 'image', '') like 'https://%'
                and project.value ->> 'project' in ('nexusroute', 'merchforge', 'filtergraph', 'omnigrid')
                 then project.value || jsonb_build_object('image',
                   case project.value ->> 'project'
                     when 'nexusroute'  then '/assets/illustrations/nexusroute-map.svg'
                     when 'merchforge'  then '/assets/illustrations/merchforge-editor.svg'
                     when 'filtergraph' then '/assets/illustrations/filtergraph-search.svg'
                     when 'omnigrid'    then '/assets/illustrations/omnigrid-grid.svg'
                   end)
               else project.value
             end
             order by project.ordinality)
             from jsonb_array_elements(t.content -> 'projects') with ordinality as project
         ) as projects,
         (
           select jsonb_agg(
             case
               when tile.value ->> 'image' like 'https://%/26394992-%' then tile.value || '{"image":"/assets/illustrations/tile-performance.svg"}'::jsonb
               when tile.value ->> 'image' like 'https://%/63d3cac5-%' then tile.value || '{"image":"/assets/illustrations/tile-types.svg"}'::jsonb
               when tile.value ->> 'image' like 'https://%/30c43378-%' then tile.value || '{"image":"/assets/illustrations/tile-ux.svg"}'::jsonb
               else tile.value
             end
             order by tile.ordinality)
             from jsonb_array_elements(t.content -> 'tiles') with ordinality as tile
         ) as tiles,
         coalesce(t.content -> 'illustrations', '{}'::jsonb)
           || case when coalesce(t.content #>> '{illustrations,omnigrid}', '') like 'https://%'
                   then '{"omnigrid":"/assets/illustrations/omnigrid-illustration.svg"}'::jsonb else '{}'::jsonb end
           || case when coalesce(t.content #>> '{illustrations,gamification}', '') like 'https://%'
                   then '{"gamification":"/assets/illustrations/proof-gamification.svg"}'::jsonb else '{}'::jsonb end
           as illustrations
    from block_translations t
    join blocks b on b.id = t.block_id
   where b.type = 'bento_grid'
     and b.deleted_at is null
)
update block_translations t
   set content = t.content
                 || case when mapped.projects is not null then jsonb_build_object('projects', mapped.projects) else '{}'::jsonb end
                 || case when mapped.tiles is not null then jsonb_build_object('tiles', mapped.tiles) else '{}'::jsonb end
                 || case when t.content ? 'illustrations' then jsonb_build_object('illustrations', mapped.illustrations) else '{}'::jsonb end
  from mapped
 where t.block_id = mapped.block_id
   and t.locale = mapped.locale;

-- The map that stands in when Google Maps cannot load.
update block_translations t
   set content = t.content || '{"mapFallback":"/assets/illustrations/nexusroute-fallback.svg"}'::jsonb
  from blocks b
 where b.id = t.block_id
   and b.type = 'logistics'
   and b.deleted_at is null
   and coalesce(t.content ->> 'mapFallback', '') like 'https://%';
