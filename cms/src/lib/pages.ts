/**
 * What a page may be called, and therefore what a URL may be: the site maps the
 * path straight onto the slug.
 *
 * Segments of lowercase words joined by slashes — `work`, `work/merch`. No
 * leading or trailing slash, because the site adds neither; nothing that would
 * need escaping, because a slug that needs escaping is a slug nobody can type.
 */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/

/**
 * The page the site serves at its root. The site's own routing calls it this,
 * so the two must agree — renaming it here would not move the homepage, it
 * would leave the site without one.
 */
export const ROOT_SLUG = 'home'

/**
 * The page whose blocks render below every other one — the site's chrome.
 * Named here so the admin can say so rather than showing it as an ordinary
 * page nobody understands the purpose of.
 */
export const SITE_SLUG = 'site'
