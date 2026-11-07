/** Types for the prerender script, which only its test imports. */
export interface FilledRoute {
  path: string
  title?: string
  description?: string
  image?: string
  canonical?: string
  body: string
  theme?: Record<string, string>
  noindex?: boolean
}

export declare function fillShell(shell: string, route: FilledRoute): string
export declare function fileFor(dist: string, path: string): string
