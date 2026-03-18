import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'

const SOCIAL_LINKS = [
  { key: 'social.github', href: '#', icon: 'GH' },
  { key: 'social.linkedin', href: '#', icon: 'LI' },
  { key: 'social.twitter', href: '#', icon: 'X' },
  { key: 'social.email', href: 'mailto:alex@mercer.dev', icon: '@' },
]

const QUICK_FACTS = [
  { labelKey: 'facts.location.label', valueKey: 'facts.location.value' },
  { labelKey: 'facts.experience.label', valueKey: 'facts.experience.value' },
  { labelKey: 'facts.focus.label', valueKey: 'facts.focus.value' },
  { labelKey: 'facts.status.label', valueKey: 'facts.status.value' },
]

export function AboutHero() {
  const { t } = useTranslation(['about', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('about', sectionRef)

  useGSAP(() => {
    const section = sectionRef.current!
    const avatar = section.querySelector('.about-avatar')
    if (avatar) {
      gsap.fromTo(avatar,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8,
          scrollTrigger: { trigger: section, start: 'top 85%' } }
      )
    }
    const content = section.querySelector('.about-content')
    if (content) {
      gsap.fromTo(content.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 85%' } }
      )
    }
    const facts = section.querySelector('.about-facts')
    if (facts) {
      gsap.fromTo(facts.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 80%' } }
      )
    }
  }, { scope: sectionRef })

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">{t('about:sectionLabel')}</span>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 mt-8">
          {/* Left — Avatar + Social */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            {/* Avatar */}
            <div className="about-avatar relative w-48 h-48 rounded-2xl overflow-hidden border border-white/8">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                alt="Alex Mercer"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Status badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[9px] text-green-400/80">{t('common:status.available')}</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  title={t(`about:${link.key}`)}
                  className="w-10 h-10 rounded-lg border border-white/8 flex items-center justify-center font-mono text-xs text-white/40 hover:text-crimson-400 hover:border-crimson-500/30 transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>

            {/* Download CV */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-crimson-500/10 border border-crimson-500/25 text-crimson-400 font-mono text-xs tracking-wider uppercase rounded-lg hover:bg-crimson-500/20 transition-all">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v9M4.5 7.5L8 11l3.5-3.5M3 13h10" />
              </svg>
              {t('common:buttons.downloadCv')}
            </button>
          </div>

          {/* Right — Bio */}
          <div className="about-content space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {t('about:name')}
            </h2>
            <p className="font-mono text-sm text-crimson-400 tracking-wider">
              {t('about:role')}
            </p>

            <div className="space-y-4 text-white/50 text-base leading-relaxed max-w-2xl">
              <p>
                {t('about:bio.paragraph1.before')}
                <span className="text-white/80">{t('about:bio.paragraph1.highlight1')}</span>
                {t('about:bio.paragraph1.conjunction')}
                <span className="text-crimson-400">{t('about:bio.paragraph1.highlight2')}</span>
                {t('about:bio.paragraph1.after')}
              </p>
              <p>
                {t('about:bio.paragraph2')}
              </p>
              <p>
                {t('about:bio.paragraph3')}
              </p>
            </div>

            {/* Quick facts */}
            <div className="about-facts grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {QUICK_FACTS.map((fact) => (
                <div key={fact.labelKey} className="glass-card p-3">
                  <span className="font-mono text-[10px] text-white/30 tracking-wider uppercase block">
                    {t(`about:${fact.labelKey}`)}
                  </span>
                  <span className="font-mono text-sm text-white/80 mt-1 block">
                    {t(`about:${fact.valueKey}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
