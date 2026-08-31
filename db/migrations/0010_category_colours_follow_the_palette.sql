-- =============================================================================
-- norav CMS · 0010 · Skill category colours follow the palette
--
-- Each category carried a hex typed into the CMS, seeded with the old brand
-- crimson and one violet. Those five values survived every palette change, so
-- the skills panel showed four shades of a red the site had stopped using next
-- to a purple that was never in it.
--
-- The field is gone. Nobody needs to hand-pick five colours whose only job is
-- telling five rows apart, and a field whose only correct answer is "whatever
-- the palette says" should not be a field — the site mixes each dot from the
-- accent and the second colour now.
--
-- Dropping the key is tidiness rather than necessity: the schema no longer
-- names it, so a publish would strip it anyway. Doing it here means the editor
-- and the database agree today instead of after the next publish.
-- =============================================================================

update block_translations bt
   set content = jsonb_set(
         bt.content,
         '{categories}',
         (
           select coalesce(jsonb_agg(category - 'color'), '[]'::jsonb)
             from jsonb_array_elements(bt.content -> 'categories') category
         )
       )
  from blocks b
 where b.id = bt.block_id
   and b.type = 'skills'
   and jsonb_typeof(bt.content -> 'categories') = 'array';
