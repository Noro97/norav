/**
 * A demo's or case study's eyebrow, as written: "Case Study 01" → "Case Study",
 * "Кейс 03" → "Кейс". Labels once carried a number counted across the site; with
 * case studies and demos on separate lists, a running count across both
 * numbered neither, and older copy still has the number typed in.
 */
export function withoutNumber(label: string): string {
  return label.replace(/\s*\d+\s*$/, '')
}
