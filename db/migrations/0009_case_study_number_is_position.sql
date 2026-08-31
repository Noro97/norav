-- =============================================================================
-- norav CMS · 0009 · The case study number is a position, not a word
--
-- Each of the five case studies had its number typed into its eyebrow — "Case
-- Study 01" through "Case Study 05". That made the number a fact about the copy
-- instead of a fact about the page: hiding the first one left the second still
-- calling itself 02, with no 01 anywhere above it.
--
-- The site derives it from position now and drops any number it finds in the
-- label, so this migration changes nothing a reader sees. It is for the editor:
-- a field showing "Case Study 01" invites someone to correct it to 02, and
-- nothing they type there will have any effect.
--
-- Publications are left alone, as ever.
-- =============================================================================

update block_translations bt
   set content = jsonb_set(
         bt.content,
         '{sectionLabel}',
         to_jsonb(regexp_replace(bt.content ->> 'sectionLabel', '\s*[0-9]+\s*$', ''))
       )
  from blocks b
 where b.id = bt.block_id
   and b.type in ('logistics', 'merch', 'ecommerce', 'omnigrid', 'proof')
   and bt.content ? 'sectionLabel'
   and bt.content ->> 'sectionLabel' ~ '[0-9]+\s*$';
