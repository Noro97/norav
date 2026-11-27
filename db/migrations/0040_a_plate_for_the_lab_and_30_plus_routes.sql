-- =============================================================================
-- norav CMS · 0040 · A plate for the Lab, and 30+ routes
--
-- 1. /work/norav counts the CMS's API routes as "28". S10 made them 32. It
--    becomes a floor, "30+", like the tests and migrations beside it. The
--    owner chose it on 2026-11-27.
--
-- Each change touches only the exact value it replaces and does nothing where
-- that value is already gone. A second run, or a database with no site,
-- changes nothing.
-- =============================================================================

update block_translations t
   set content = jsonb_set(
         t.content,
         '{metrics}',
         (select jsonb_agg(
                   case
                     when metric ->> 'label' = 'API routes in the CMS' and metric ->> 'value' = '28'
                       then jsonb_set(metric, '{value}', '"30+"')
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
          where metric ->> 'label' = 'API routes in the CMS' and metric ->> 'value' = '28'
       );
