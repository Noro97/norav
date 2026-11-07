-- =============================================================================
-- norav CMS · 0033 · What nothing places any more
--
-- The block types the September spec removes. Their rows go first and the code
-- follows in a later PR, because publish validates every live block against the
-- registry, and the site renders a type it doesn't know as nothing.
--
-- Nothing published holds one of these, so the next publish doesn't change a page.
--
-- `tech_marquee`, `projects_intro` and `bento_grid` are on the same list and aren't
-- here. They're what /about and /work show today, and /work would become a 404
-- without them. S5 soft-deletes them when it replaces them.
--
-- A row already deleted keeps its date, so a second run changes nothing.
-- =============================================================================

update blocks
   set deleted_at = now()
 where deleted_at is null
   and type in (
     'vibecoding',
     'skills',
     'workflow',
     'recruiter_cta',
     'gallery',
     'metrics',
     'cta_banner',
     'portfolio_section',
     'kit_stats_marquee',
     'kit_services',
     'kit_pricing',
     'kit_press',
     'kit_awards',
     'kit_big_marquee',
     'kit_show_reel',
     'kit_timeline',
     'kit_visual_feed'
   );
