-- =============================================================================
-- norav CMS · 0027 · The ambient layer is gone
--
-- The site settings row carried three switches for chrome that no longer
-- exists: the film grain, the cursor-reactive grid and the custom cursor. The
-- redesign removes the layers themselves — they were the reason every page
-- read as a blueprint, and the grid alone cost a fixed canvas on every route.
-- A key the site never reads is not harmless: the admin still shows a toggle
-- for it, and a toggle that does nothing teaches an editor to distrust the
-- rest. So the keys go, and the editor loses the two controls in the same
-- change. `navIndicator` stays; the nav still reads it.
-- =============================================================================

update settings
   set value = value - 'grain' - 'dynamicGrid' - 'cursor'
 where key = 'site'
   and value ?| array['grain', 'dynamicGrid', 'cursor'];
