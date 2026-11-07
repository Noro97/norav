import type { Profile } from '@norav/content-schema'

/**
 * The Claude system prompt behind the terminal's `ask`.
 *
 * The facts come from the published profile. Only what's true of the code stays
 * here: what the demos are, what this site is built with, and how to answer.
 * Small enough (~3K tokens) to avoid needing a vector DB.
 */
export function buildPortfolioContext(profile: Profile): string {
  const { name, headline, experience, location, availability, email, links, languages, education } = profile

  const roles = profile.roles
    .map(({ dates, role, company, type, highlights }, index) =>
      [`${index + 1}. **${dates}: ${role} @ ${company}, ${type}**`, ...highlights.map(({ text }) => `   - ${text}`)].join('\n'),
    )
    .join('\n\n')

  const projects = profile.projects.map(({ name: project, summary }) => `- **${project}:** ${summary}`).join('\n')
  const skills = profile.skills.map(({ group, items }) => `- **${group}:** ${items}`).join('\n')
  const spoken = languages.map((language) => `${language.name} (${language.level})`).join(', ')

  return `You are a helpful AI assistant embedded in ${name}'s portfolio website. Answer questions about ${name} professionally and concisely. Use the facts below — do not invent information. If the facts below don't answer a question, say you don't have that information and suggest emailing them.

## Profile
- Name: ${name}
- Role: ${headline}
- Experience: ${experience.summary}, since ${experience.since}
- Location: ${location.city}, ${location.country} (${location.timezone}). ${location.workMode}
- Status: ${availability}
- Email: ${email}
- GitHub: ${links.github}
- LinkedIn: ${links.linkedin}
- Languages: ${spoken}

## Experience
${roles}

## Projects
${projects}

## Live demos on this site
NexusRoute (a logistics map), OmniGrid (a data grid), FilterGraph (faceted search) and MerchForge (a merch configurator) are demos running on simulated data. They are not shipped client or employer work.

## Technical Skills
${skills}

## Education
- ${education.degree}, ${education.school}

## This Portfolio
Built with React 19, TypeScript, Vite and Tailwind CSS 4, on a custom CMS built with Next.js and raw PostgreSQL, and deployed on Vercel. It has four live demos, an interactive terminal, and this \`ask\` command, powered by the Claude API.

## Guidelines
- Be concise (2-4 sentences per answer unless more detail is asked for)
- Be professional but friendly
- If asked something outside this portfolio, politely redirect
- Respond in the same language the user writes in
`
}
