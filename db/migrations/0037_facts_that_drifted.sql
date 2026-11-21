-- =============================================================================
-- norav CMS · 0037 · Facts that drifted
--
-- Approved by the owner: the first two on 2026-11-21 (S8's questions), the
-- rest on 2026-11-22 (S9's). They ship with S9's release so two releases don't
-- compete for a migration number.
--
-- 1. /work/norav counts the automated tests as "594". Some site tests run once
--    per published page, so the count moved the day it published (597 now).
--    It becomes a floor, "590+", which stays true as content grows.
-- 2. /work/norav counts 35 migrations, in a metric and in a decision. S9 added
--    two. Both become "35+", the same kind of floor.
-- 3. The decision on the block registry counts 28 block types. S9 added one.
--    It says "Each block type" and gives no count.
-- 4. "Vue.js" comes out of the profile's knowsAbout, which feeds the JSON-LD.
--    It isn't in facts.md, the About stack or the CV.
--
-- Each change touches only the exact value or sentence it replaces, keeps the
-- order of the list it sits in, and does nothing where that value is already
-- gone. A second run, or a database with no site, changes nothing.
-- =============================================================================

update block_translations t
   set content = jsonb_set(
         t.content,
         '{metrics}',
         (select jsonb_agg(
                   case
                     when metric ->> 'label' = 'automated tests: site, CMS and schema' and metric ->> 'value' = '594'
                       then jsonb_set(metric, '{value}', '"590+"')
                     when metric ->> 'label' = 'SQL migrations, append-only' and metric ->> 'value' = '35'
                       then jsonb_set(metric, '{value}', '"35+"')
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
          where (metric ->> 'label' = 'automated tests: site, CMS and schema' and metric ->> 'value' = '594')
             or (metric ->> 'label' = 'SQL migrations, append-only' and metric ->> 'value' = '35')
       );

update block_translations t
   set content = jsonb_set(
         t.content,
         '{decisions}',
         (select jsonb_agg(
                   case
                     when jsonb_typeof(decision -> 'body') = 'string'
                       then jsonb_set(decision, '{body}', to_jsonb(
                              replace(
                                replace(
                                  decision ->> 'body',
                                  'Each of the 28 block types is a Zod schema in a shared package.',
                                  'Each block type is a Zod schema in a shared package.'),
                                'There are 35 numbered SQL migrations, never edited once shipped.',
                                'There are 35+ numbered SQL migrations, never edited once shipped.')))
                     else decision
                   end
                   order by position)
            from jsonb_array_elements(t.content -> 'decisions') with ordinality as d(decision, position))
       )
  from blocks b
  join pages p on p.id = b.page_id
 where t.block_id = b.id
   and p.slug = 'work/norav'
   and b.type = 'case_study'
   and b.deleted_at is null
   and jsonb_typeof(t.content -> 'decisions') = 'array'
   and exists (
         select 1 from jsonb_array_elements(t.content -> 'decisions') as d(decision)
          where strpos(decision ->> 'body', 'Each of the 28 block types is a Zod schema in a shared package.') > 0
             or strpos(decision ->> 'body', 'There are 35 numbered SQL migrations, never edited once shipped.') > 0
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
