-- =============================================================================
-- norav CMS · 0037 · Two facts that drifted
--
-- Both approved by the owner on 2026-11-21 (S8's questions), shipped with S9's
-- release so two releases don't compete for a migration number:
--
-- 1. /work/norav counts the automated tests as "594". Some site tests run once
--    per published page, so the count moved the day it published (597 now).
--    It becomes a floor, "590+", which stays true as content grows.
-- 2. "Vue.js" comes out of the profile's knowsAbout, which feeds the JSON-LD.
--    It isn't in facts.md, the About stack or the CV.
--
-- Each change touches only the exact value it replaces, keeps the order of the
-- list it sits in, and does nothing where that value is already gone. A second
-- run, or a database with no site, changes nothing.
-- =============================================================================

update block_translations t
   set content = jsonb_set(
         t.content,
         '{metrics}',
         (select jsonb_agg(
                   case
                     when metric ->> 'label' = 'automated tests: site, CMS and schema' and metric ->> 'value' = '594'
                       then jsonb_set(metric, '{value}', '"590+"')
                     else metric
                   end
                   order by position)
            from jsonb_array_elements(t.content -> 'metrics') with ordinality as m(metric, position))
       )
  from blocks b
  join pages p on p.id = b.page_id
 where t.block_id = b.id
   and p.slug = 'work/norav'
   and b.type = 'case_study'
   and b.deleted_at is null
   and jsonb_typeof(t.content -> 'metrics') = 'array'
   and exists (
         select 1 from jsonb_array_elements(t.content -> 'metrics') as m(metric)
          where metric ->> 'label' = 'automated tests: site, CMS and schema' and metric ->> 'value' = '594'
       );

update settings s
   set value = jsonb_set(
         s.value,
         '{knowsAbout}',
         coalesce(
           (select jsonb_agg(topic order by position)
              from jsonb_array_elements(s.value -> 'knowsAbout') with ordinality as k(topic, position)
             where topic ->> 'name' <> 'Vue.js'),
           '[]'::jsonb
         )
       )
 where s.key = 'profile'
   and jsonb_typeof(s.value -> 'knowsAbout') = 'array'
   and exists (
         select 1 from jsonb_array_elements(s.value -> 'knowsAbout') as k(topic)
          where topic ->> 'name' = 'Vue.js'
       );
