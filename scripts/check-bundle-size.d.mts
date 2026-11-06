export interface SizePair {
  raw: number
  gzip: number
}
export interface BundleLimits {
  js: SizePair
  css: SizePair
}
export interface MeasuredFile extends SizePair {
  path: string
}
export const LIMITS: BundleLimits
export function entryAssets(html: string): { js: string[]; css: string[] }
export function measure(dist: string): {
  files: { js: MeasuredFile[]; css: MeasuredFile[] }
  totals: BundleLimits
}
export function overBudget(
  totals: BundleLimits,
  limits?: BundleLimits,
): { kind: 'js' | 'css'; measure: 'raw' | 'gzip'; size: number; limit: number }[]
