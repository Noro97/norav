import type { Profile } from '@norav/content-schema'
import { profileOf } from '@/lib/profile'
import { useContent } from './ContentProvider'

/** The published facts about the owner, following whichever snapshot is on the page. */
export function useProfile(): Profile {
  return profileOf(useContent().snapshot.settings)
}
