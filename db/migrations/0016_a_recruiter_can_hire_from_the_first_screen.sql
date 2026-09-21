-- =============================================================================
-- norav CMS · 0016 · A recruiter can hire from the first screen
--
-- The home page opens with a name and closes with an email button. Everything
-- a reader deciding whether to write needs — which role, why this person, the
-- CV — is on the site, but spread across About, Experience and Skills, and a
-- reader on a phone assembles it themselves or does not.
--
-- This places the `recruiter_cta` card between the numbers and the closing
-- call to action: role, three reasons, and the CV, the inbox and the profile.
-- Position 2500 sits between impact_strip (2000) and contact_cta (3000), which
-- 0012 fixed at rank × 1000.
--
-- The CV link is read off the About block so the two never point at different
-- files; a database with no About block gets an empty link, which the site
-- renders as no button rather than a dead one.
-- =============================================================================

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id,
       'recruiter_cta',
       2500,
       'hire',
       jsonb_build_object(
         'cvHref', coalesce(
           (select existing.settings->>'cvHref'
              from blocks existing
             where existing.type = 'about'
               and existing.deleted_at is null
             limit 1),
           ''),
         'email', 'noroavetisyan@gmail.com',
         'linkedinHref', 'https://www.linkedin.com/in/norayravetisyan/')
  from pages page
 where page.slug = 'home'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'recruiter_cta'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'ready'
  from blocks block
  join (values
    ('en', $json${
      "label": "Looking for",
      "title": "Senior or staff frontend and fullstack roles",
      "points": [
        { "text": "Led frontend architecture on products reaching 10M+ monthly users" },
        { "text": "Designed, shipped and operates a production AI-native platform end to end" },
        { "text": "Built the CMS and the infrastructure this site runs on" }
      ],
      "cvLabel": "Download CV",
      "emailLabel": "Email",
      "linkedinLabel": "LinkedIn"
    }$json$),
    ('ru', $json${
      "label": "Ищу",
      "title": "Senior и staff роли: frontend и fullstack",
      "points": [
        { "text": "Руководил фронтенд-архитектурой продуктов с 10M+ пользователей в месяц" },
        { "text": "Спроектировал, выпустил и поддерживаю production AI-платформу от начала до конца" },
        { "text": "Написал CMS и инфраструктуру, на которых работает этот сайт" }
      ],
      "cvLabel": "Скачать CV",
      "emailLabel": "Написать",
      "linkedinLabel": "LinkedIn"
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'recruiter_cta'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;
