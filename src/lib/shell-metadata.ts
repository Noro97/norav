import type { Profile } from '@norav/content-schema'

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function personJsonLd(profile: Profile) {
  const { links, education, location } = profile
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.jobTitle,
    url: links.site,
    email: profile.email,
    sameAs: [links.github, links.linkedin, links.telegram].filter(Boolean),
    knowsAbout: profile.knowsAbout.map((topic) => topic.name),
    knowsLanguage: profile.languages.map((language) => language.name),
    alumniOf: { '@type': 'CollegeOrUniversity', name: education.school },
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.city,
      addressCountry: location.countryCode,
    },
  }
}

/**
 * Fills the page shell's placeholders from the profile.
 *
 * At build time rather than at runtime, because the link unfurlers that read these
 * tags never run JavaScript. See "What the head says" in the README.
 */
export function renderShell(html: string, profile: Profile): string {
  const values: Record<string, string> = {
    '%PROFILE_TITLE%': escapeAttribute(`${profile.name} — ${profile.jobTitle}`),
    '%PROFILE_NAME%': escapeAttribute(profile.name),
    '%PROFILE_DESCRIPTION%': escapeAttribute(profile.description),
    // `<` can't appear raw, or a value holding </script> would end the block.
    '%PROFILE_JSON_LD%': JSON.stringify(personJsonLd(profile)).replace(/</g, '\\u003c'),
  }
  return html.replace(/%PROFILE_[A-Z_]+%/g, (placeholder) => values[placeholder] ?? placeholder)
}
