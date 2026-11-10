import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router'
import './i18n'
import App from './App'
import { BAKED_SNAPSHOTS } from '@/content'
import { ContentProvider } from '@/content/ContentProvider'
import { resolveSeo, SITE, type ResolvedSeo } from '@/content/PageHead'
import { postSeo, postsOf, WRITING_SLUG } from '@/content/posts'
import { DEFAULT_LOCALE, hrefFor, SITE_SLUG } from '@/content/routing'
import { profileOf } from '@/lib/profile'

/**
 * What `scripts/prerender.mjs` needs from the site, built by Vite for Node. It renders
 * the same App the browser hydrates, from the snapshot baked into this build.
 */
export interface PrerenderRoute extends ResolvedSeo {
  path: string
  canonical: string
}

const snapshot = BAKED_SNAPSHOTS.en

/** An address no page can have, for the markup of 404.html. */
export const NOT_FOUND_PATH = '/__not-found__'

/** Every page and post that has an address of its own, with what it says in the head. */
export function routes(): PrerenderRoute[] {
  const addressOf = (slug: string) => hrefFor(slug, DEFAULT_LOCALE)
  const pages = snapshot.pages
    // An empty page renders as not found. `site` is the chrome every page ends with,
    // not a page: nothing links to it, and vercel.json sends its address home.
    .filter((page) => page.blocks.length > 0 && page.slug !== SITE_SLUG)
    .map((page) => ({
      path: addressOf(page.slug),
      canonical: `${SITE}${addressOf(page.slug)}`,
      ...resolveSeo(page, DEFAULT_LOCALE),
    }))
  const posts = postsOf(snapshot).map((post) => {
    const path = addressOf(`${WRITING_SLUG}/${post.slug}`)
    return { path, canonical: `${SITE}${path}`, ...postSeo(post, profileOf(snapshot.settings).name, SITE) }
  })
  return [...pages, ...posts]
}

/** The published palette, so the first paint already has it. Only colour tokens, as in applyTheme. */
export function themeTokens(): Record<string, string> {
  const theme = snapshot.settings.theme as { tokens?: Record<string, string> } | undefined
  return Object.fromEntries(Object.entries(theme?.tokens ?? {}).filter(([name]) => name.startsWith('--color-')))
}

export async function renderRoute(path: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={path}>
        <ContentProvider>
          <App />
        </ContentProvider>
      </StaticRouter>
    </StrictMode>,
    // By default React writes a large section as its fallback, with the content after it
    // and a script to swap them. That shows a spinner first and shifts the page.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  )
  const chunks: Buffer[] = []
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk as Uint8Array))
  return Buffer.concat(chunks).toString('utf8')
}
