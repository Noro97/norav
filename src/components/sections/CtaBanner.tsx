import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useBlock } from '@/content/ContentProvider'
import { StarBorderButton } from '@/components/ui/effects/StarBorderButton'
import { ClickSpark } from '@/components/ui/effects/ClickSpark'
import { OrbBackground } from '@/components/ui/effects/OrbBackground'
import { ParticlesBackground } from '@/components/ui/effects/ParticlesBackground'
import { ThreadsBackground } from '@/components/ui/effects/ThreadsBackground'
import { BeamsBackground } from '@/components/ui/effects/BeamsBackground'
import type { CtaBannerContent, CtaBannerSettings } from '@norav/content-schema'

/** Wraps the button in ClickSpark only when the setting is on. */
function MaybeSpark({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <ClickSpark>{children}</ClickSpark> : <>{children}</>
}

/** Wraps the button in the spinning star border only when that style is chosen. */
function MaybeStarBorder({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <StarBorderButton className="rounded-full">{children}</StarBorderButton> : <>{children}</>
}

const BUTTON_CLASS =
  'press group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-crimson-500/90 hover:bg-crimson-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-[0_0_30px_-6px_color-mix(in_srgb,_var(--color-crimson-500)_60%,_transparent)]'

export function CtaBanner({ anchorId, blockId }: { anchorId?: string | null; blockId?: string }) {
  const block = useBlock<CtaBannerContent, CtaBannerSettings>('cta_banner', blockId)
  if (!block) return null
  const { content, settings } = block

  // A path stays inside the app; anything else — a full URL, a mailto — leaves
  // it, and a router Link would only break those.
  const internal = settings.href.startsWith('/')
  const label = (
    <>
      {content.buttonLabel}
      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </>
  )

  return (
    <section {...(anchorId ? { id: anchorId } : {})} className="relative px-6 md:px-16 py-20">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-crimson-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl px-8 py-14 md:px-14 md:py-16 text-center">
          {settings.background === 'orb' && <OrbBackground />}
          {settings.background === 'particles' && <ParticlesBackground />}
          {settings.background === 'threads' && <ThreadsBackground />}
          {settings.background === 'beams' && <BeamsBackground />}

          <div className="relative">
            {content.label && <span className="label-mono block">{content.label}</span>}
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-5">
              {content.title}
            </h2>
            {content.body && (
              <p className="text-white/45 text-base max-w-xl mx-auto mb-9 leading-relaxed">
                {content.body}
              </p>
            )}

            <MaybeSpark enabled={settings.clickSpark}>
              <MaybeStarBorder enabled={settings.ctaStyle === 'star-border'}>
                {internal ? (
                  <Link to={settings.href} className={BUTTON_CLASS}>
                    {label}
                  </Link>
                ) : (
                  <a href={settings.href} className={BUTTON_CLASS}>
                    {label}
                  </a>
                )}
              </MaybeStarBorder>
            </MaybeSpark>
          </div>
        </div>
      </div>
    </section>
  )
}
