/** Types for the prerender script, which only its tests import. */
export interface FilledRoute {
  path: string
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  /** The path of the share card the build drew for this page. */
  card?: string
  canonical?: string
  body: string
  theme?: Record<string, string>
  noindex?: boolean
}

export type CardRoute = Omit<FilledRoute, 'body'>

export declare function fillShell(shell: string, route: FilledRoute): string
export declare function fileFor(dist: string, path: string): string
export declare function drawCards<R extends CardRoute>(
  dist: string,
  routes: R[],
  options: { name: string; tokens: Record<string, string> },
): Promise<R[]>
