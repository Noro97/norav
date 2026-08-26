import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Bot, Component, Gauge, Layers, Rocket, Sparkles, type LucideIcon } from 'lucide-react'
import { useBlock } from '@/content/ContentProvider'
import type { CapabilitiesContent } from '@norav/content-schema'

/** The icons the CMS offers, resolved to components the section can render. */
const ICONS: Record<string, LucideIcon> = { Layers, Bot, Component, Gauge, Sparkles, Rocket }

export function Capabilities({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<CapabilitiesContent>('capabilities')
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    const cards = sectionRef.current!.querySelectorAll('.cap-card')
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
      }
    )
  }, { scope: sectionRef })

  if (!block) return null
  const { content } = block

  return (
    <section
      ref={sectionRef}
      {...(anchorId ? { id: anchorId } : {})}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">{content.sectionLabel}</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
          {content.title}
        </h2>
        <p className="text-white/40 text-base max-w-xl mb-12">{content.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.cards.map((card, index) => {
            const Icon = ICONS[card.icon] ?? Layers
            return (
            <div
              key={index}
              className="cap-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-crimson-500/20 hover:shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--color-crimson-500)_15%,transparent)]"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-crimson-500/10" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-crimson-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{card.body}</p>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
