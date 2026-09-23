import { useRef } from 'react'
import { Bot, Component, Gauge, Layers, Rocket, Sparkles, type LucideIcon } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import { EffectCard } from '@/components/ui/effects/EffectCard'
import type { CapabilitiesContent, CapabilitiesSettings } from '@norav/content-schema'

/** The icons the CMS offers, resolved to components the section can render. */
const ICONS: Record<string, LucideIcon> = { Layers, Bot, Component, Gauge, Sparkles, Rocket }

export function Capabilities({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CapabilitiesContent, CapabilitiesSettings>('capabilities')
  const sectionRef = useRef<HTMLElement>(null)

  useReveal(sectionRef, '.cap-card')

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-content mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3 mb-4">
          {content.title}
        </h2>
        <p className="text-tertiary-ink/40 text-body-regular max-w-xl mb-12">{content.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.cards.map((card, index) => {
            const Icon = ICONS[card.icon] ?? Layers
            return (
            <EffectCard
              key={index}
              effect={settings.cardEffect}
              className="cap-card group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-primary-500/20 hover:shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--color-primary-500)_15%,transparent)]"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary-500/10" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-tertiary-ink font-semibold text-body-regular mb-2">{card.title}</h3>
                <p className="text-tertiary-ink/40 text-body-small leading-relaxed">{card.body}</p>
              </div>
            </EffectCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
