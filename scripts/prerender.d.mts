/** Types for the prerender script, which only its tests import. */
export interface FilledRoute {
  path: string
  title?: string
  description?: string
  image?: string
  imageAlt?: string
  /** The path of the share card the build drew for this page. */
  card?: string
  /** What the drawn card says, when it isn't the title. */
  cardTitle?: string
  canonical?: string
  body: string
  theme?: Record<string, string>
  noindex?: boolean
  /** Stylesheets this page links beyond the shell's: the kit's, when it renders a kit section. */
  styles?: string[]
}

export type CardRoute = Omit<FilledRoute, 'body'>

export declare function fillShell(shell: string, route: FilledRoute): string
export declare function fileFor(dist: string, path: string): string
export declare function kitStylesheets(dist: string): string[]
export declare function hasKitSection(body: string): boolean
export declare function drawCards<R extends CardRoute>(
  dist: string,
  routes: R[],
  options: { name: string; tokens: Record<string, string> },
): Promise<R[]>
