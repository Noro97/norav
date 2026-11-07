import type { Profile } from '@norav/content-schema'

/** The published profile. Publish refuses a version without one, so it's always there. */
export function profileOf(settings: Record<string, unknown>): Profile {
  return settings.profile as Profile
}

/** `https://www.linkedin.com/in/x/` as a person would write it: `linkedin.com/in/x`. */
export function bareUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

/** Breaks text between words, for the terminal's fixed-width lines. */
export function wrapWords(text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines
}
