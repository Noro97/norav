import type { Locale, Snapshot } from '@norav/content-schema'

/**
 * The published copy, baked into the build by `scripts/fetch-content.mjs`.
 *
 * It renders the first paint with no round trip to the CMS: the prerendered HTML
 * already holds it, and hydration needs the same copy. It is its own chunk, not part
 * of the entry, so that content can grow without eating the code's budget.
 * `index.html` preloads it beside the entry script (see `vite.config.ts`), so the two
 * download together and hydration doesn't wait an extra round trip.
 */
export async function loadBakedSnapshots(): Promise<Record<Locale, Snapshot>> {
  const { default: en } = await import('./snapshot.en.json')
  return bakedSnapshots(en as unknown as Snapshot)
}

/**
 * Every locale's snapshot, from the ones this build bakes.
 *
 * Russian is retired until it is retranslated (docs/plan D13). /ru redirects to
 * English, so this only keeps the locale record whole.
 */
export function bakedSnapshots(en: Snapshot): Record<Locale, Snapshot> {
  return { en, ru: en }
}
