import type { ReactNode } from 'react'
import { TiltGlareCard } from './TiltGlareCard'
import { SpotlightCard } from './SpotlightCard'

export type CardEffect = 'none' | 'tilt' | 'spotlight'

interface Props {
  effect: CardEffect
  children: ReactNode
  className?: string
}

/**
 * Picks the right hover treatment for a `CARD_EFFECT_OPTIONS`-driven setting,
 * so section components branch on a single prop instead of repeating the
 * none/tilt/spotlight switch themselves.
 */
export function EffectCard({ effect, children, className }: Props) {
  if (effect === 'tilt') return <TiltGlareCard className={className}>{children}</TiltGlareCard>
  if (effect === 'spotlight') return <SpotlightCard className={className}>{children}</SpotlightCard>
  return <div className={className}>{children}</div>
}
