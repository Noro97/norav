-- =============================================================================
-- norav CMS · 0038 · A new palette
--
-- The owner asked for a new theme on 2026-11-22 and approved this one (D5).
-- It keeps the direction of the draft saved in the CMS on 2026-11-21: green on
-- deep navy, with a rust second accent. The green is a step darker, so white
-- text on a button reads 4.77:1 instead of 4.01:1. The rust is lighter, so
-- the chosen state in a widget shows on the background at all (3.55:1 for its
-- border, where the draft's was 1.37:1).
--
-- It replaces the saved theme, the draft included, and publishes nothing:
-- the site changes at the release. Publish derives every token from these
-- three colours. A second run writes the same values. A database with no site
-- yet is left as it was.
-- =============================================================================

do $migration$
begin
if not exists (select 1 from blocks where type = 'hero' and deleted_at is null) then
  return;
end if;

insert into settings (key, value)
values ('theme', $json${
  "accent": "#338316",
  "secondary": "#C32C14",
  "background": "#010123"
}$json$::jsonb)
on conflict (key) do update set value = excluded.value;
end
$migration$;
