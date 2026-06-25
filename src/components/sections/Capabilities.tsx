import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Layers, Bot, Component, Gauge, type LucideIcon } from 'lucide-react'

const CARDS: { icon: LucideIcon; key: string }[] = [
  { icon: Layers, key: '0' },
  { icon: Bot, key: '1' },
  { icon: Component, key: '2' },
  { icon: Gauge, key: '3' },
]

export function Capabilities() {
  const { t } = useTranslation('extra')
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

  return (
    <section ref={sectionRef} className="relative px-6 md:px-16 py-24">
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">{t('cap.label')}</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
          {t('cap.title')}
        </h2>
        <p className="text-white/40 text-base max-w-xl mb-12">{t('cap.description')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="cap-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-6 transition-all duration-300 hover:border-crimson-500/20 hover:shadow-[0_0_40px_-12px_rgba(181,26,43,0.15)]"
            >
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-crimson-500/10" />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-crimson-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{t(`cap.${key}.title`)}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{t(`cap.${key}.body`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
