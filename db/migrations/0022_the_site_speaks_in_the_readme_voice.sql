-- =============================================================================
-- norav CMS · 0022 · The site speaks in the README voice
--
-- The repository's README is written the way a staff engineer writes: a
-- number where an adjective would go, the constraint named beside the win.
-- The hero and the bio are not — "engineering precision and visual
-- storytelling" says nothing a reader can check. This rewrites the two
-- sentences a visitor reads first so they carry a figure and a claim that
-- can be checked against the rest of the site, and narrows the status line
-- from "open to offers" to the roles actually being looked for.
--
-- Only the copy that shipped is replaced. Each update is guarded on the
-- sentence it overwrites, so a line already reworded in the admin is left as
-- it stands, and the file can be run again without undoing anyone's edit.
-- Everything else in each block — the name, the scroll hint, the socials,
-- the photo — is untouched: the writes go through jsonb_set on the keys named
-- and nothing more.
-- =============================================================================

-- Hero: the subtitle and the tagline.

update block_translations t
   set content = t.content || $json${
     "subtitle": "Fullstack Engineer, frontend-focused",
     "tagline": [
       { "text": "I build interfaces that hold up under real load — from", "accent": "main" },
       { "text": "50K WebSocket events a second", "accent": "highlight" },
       { "text": "to enterprise design systems used by teams I never meet.", "accent": "main" }
     ]
   }$json$::jsonb
  from blocks b
 where b.id = t.block_id
   and b.type = 'hero'
   and b.deleted_at is null
   and t.locale = 'en'
   and t.content ->> 'subtitle' in ('Fullstack Engineer', 'Frontend-Focused Fullstack Engineer');

update block_translations t
   set content = t.content || $json${
     "subtitle": "Fullstack-инженер с фокусом на фронтенд",
     "tagline": [
       { "text": "Создаю интерфейсы, которые держат реальную нагрузку — от", "accent": "main" },
       { "text": "50K WebSocket-событий в секунду", "accent": "highlight" },
       { "text": "до enterprise дизайн-систем, которыми пользуются команды, с которыми я не знаком.", "accent": "main" }
     ]
   }$json$::jsonb
  from blocks b
 where b.id = t.block_id
   and b.type = 'hero'
   and b.deleted_at is null
   and t.locale = 'ru'
   and t.content ->> 'subtitle' in ('fullstack-инженер', 'Frontend-focused fullstack-инженер');

-- About: the role line under the name, so it reads as the hero does; then the
-- lead, the first paragraph, and the status fact. The second paragraph —
-- "currently seeking senior or staff-level roles" — already says the right
-- thing and is kept as it is.

update block_translations t
   set content = t.content || '{"role":"Fullstack Engineer, frontend-focused"}'::jsonb
  from blocks b
 where b.id = t.block_id
   and b.type = 'about'
   and b.deleted_at is null
   and t.locale = 'en'
   and t.content ->> 'role' = 'Frontend-Focused Fullstack Engineer';

update block_translations t
   set content = t.content || '{"role":"Fullstack-инженер с фокусом на фронтенд"}'::jsonb
  from blocks b
 where b.id = t.block_id
   and b.type = 'about'
   and b.deleted_at is null
   and t.locale = 'ru'
   and t.content ->> 'role' = 'Frontend-focused fullstack-инженер';

update block_translations t
   set content = jsonb_set(
                   jsonb_set(
                     t.content,
                     '{bio,lead}',
                     $json$[
                       { "text": "I build interfaces that hold up under production load, and the systems underneath them. Seven-plus years split across", "accent": "main" },
                       { "text": "enterprise UI architecture, generative-AI platforms and high-load fintech", "accent": "highlight" },
                       { "text": "— lately a Telegram Mini App with real-time and AI-verification traffic that I designed, built and operate alone.", "accent": "main" }
                     ]$json$::jsonb),
                   '{bio,paragraphs,0}',
                   $json${ "text": "I have led frontend architecture at companies where a performance regression is a production incident, not a nitpick. That is the standard I hold my own code to, whether I am the only engineer on it or one of forty." }$json$::jsonb)
  from blocks b
 where b.id = t.block_id
   and b.type = 'about'
   and b.deleted_at is null
   and t.locale = 'en'
   and t.content #>> '{bio,lead,0,text}' like 'I build interfaces that feel alive%';

update block_translations t
   set content = jsonb_set(
                   jsonb_set(
                     t.content,
                     '{bio,lead}',
                     $json$[
                       { "text": "Я строю интерфейсы, которые держат продакшен-нагрузку, и системы под ними. Семь с лишним лет — это", "accent": "main" },
                       { "text": "enterprise UI-архитектура, генеративные AI-платформы и высоконагруженный финтех", "accent": "highlight" },
                       { "text": "— а в последнее время Telegram Mini App с трафиком реального времени и AI-верификацией, который я спроектировал, построил и поддерживаю один.", "accent": "main" }
                     ]$json$::jsonb),
                   '{bio,paragraphs,0}',
                   $json${ "text": "Я руководил фронтенд-архитектурой в компаниях, где регрессия производительности — инцидент в продакшене, а не придирка. По этой планке я меряю и собственный код — один ли я на проекте или один из сорока." }$json$::jsonb)
  from blocks b
 where b.id = t.block_id
   and b.type = 'about'
   and b.deleted_at is null
   and t.locale = 'ru'
   and t.content #>> '{bio,lead,0,text}' like 'Я создаю интерфейсы, которые оживают%';

-- The status fact is found by its current value rather than its index, so a
-- reordered facts list still gets the right one and nothing else.

with rebuilt as (
  select t.block_id,
         t.locale,
         jsonb_agg(
           case
             when fact.value ->> 'value' = 'Open to offers'
               then fact.value || '{"value":"Open to senior/staff roles"}'::jsonb
             when fact.value ->> 'value' = 'Открыт к предложениям'
               then fact.value || '{"value":"Открыт к senior/staff-ролям"}'::jsonb
             else fact.value
           end
           order by fact.ordinality) as facts
    from block_translations t
    join blocks b on b.id = t.block_id
   cross join lateral jsonb_array_elements(t.content -> 'facts') with ordinality as fact
   where b.type = 'about'
     and b.deleted_at is null
     and jsonb_typeof(t.content -> 'facts') = 'array'
   group by t.block_id, t.locale
)
update block_translations t
   set content = jsonb_set(t.content, '{facts}', rebuilt.facts)
  from rebuilt
 where t.block_id = rebuilt.block_id
   and t.locale = rebuilt.locale;
