export interface SizePair {
  raw: number
  gzip: number
}
export interface BundleLimits {
  js: SizePair
  css: SizePair
  content: SizePair
}
export interface MeasuredFile extends SizePair {
  path: string
}
export const LIMITS: BundleLimits
export function entryAssets(html: string): { js: string[]; css: string[]; content: string[] }
export function measure(dist: string): {
  files: { js: MeasuredFile[]; css: MeasuredFile[]; content: MeasuredFile[] }
  totals: BundleLimits
}
export function codeWithSnapshot(dist: string, files: MeasuredFile[], checksum: string): string[]
export function overBudget(
  totals: BundleLimits,
  limits?: BundleLimits,
): { kind: 'js' | 'css' | 'content'; measure: 'raw' | 'gzip'; size: number; limit: number }[]
