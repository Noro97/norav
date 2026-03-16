import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'

gsap.registerPlugin(ScrollTrigger)

const SOCIAL_LINKS = [
  { label: 'GitHub', href: '#', icon: 'GH' },
  { label: 'LinkedIn', href: '#', icon: 'LI' },
  { label: 'Twitter / X', href: '#', icon: 'X' },
  { label: 'Email', href: 'mailto:alex@mercer.dev', icon: '@' },
]

const QUICK_FACTS = [
  { label: 'Location', value: 'San Francisco, CA' },
  { label: 'Experience', value: '6+ years' },
  { label: 'Focus', value: 'Frontend & WebGL' },
  { label: 'Status', value: 'Open to offers' },
]

export function AboutHero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('about', sectionRef)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.about-avatar', {
        opacity: 0, scale: 0.8, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
      gsap.from('.about-content > *', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
      gsap.from('.about-facts > *', {
        opacity: 0, y: 20, duration: 0.5, stagger: 0.08,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <span className="label-mono">About Me</span>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 mt-8">
          {/* Left — Avatar + Social */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            {/* Avatar */}
            <div className="about-avatar relative w-48 h-48 rounded-2xl overflow-hidden border border-white/8">
              <div className="absolute inset-0 bg-gradient-to-br from-crimson-700/40 via-[#0d0d1f] to-crimson-900/30 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/10 font-mono select-none">AM</span>
              </div>
              {/* Status badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[9px] text-green-400/80">Available</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  title={link.label}
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
              Download CV
            </button>
          </div>

          {/* Right — Bio */}
          <div className="about-content space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Alex Mercer
            </h2>
            <p className="font-mono text-sm text-crimson-400 tracking-wider">
              Senior Frontend Engineer
            </p>

            <div className="space-y-4 text-white/50 text-base leading-relaxed max-w-2xl">
              <p>
                I build interfaces that feel alive. My work sits at the crossroads of
                <span className="text-white/80"> engineering rigor</span> and
                <span className="text-crimson-400"> visual craft</span> — from
                real-time logistics dashboards processing 50K events/sec to
                GPU-accelerated particle systems running custom GLSL shaders.
              </p>
              <p>
                With 6+ years of experience shipping production code at scale, I've led
                frontend architecture at startups where performance budgets and pixel-perfect
                design aren't trade-offs — they're requirements. I think in systems, animate
                with purpose, and obsess over the 16.6ms frame budget.
              </p>
              <p>
                Currently seeking senior or staff-level roles at companies pushing the
                boundaries of what's possible on the web.
              </p>
            </div>

            {/* Quick facts */}
            <div className="about-facts grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {QUICK_FACTS.map((fact) => (
                <div key={fact.label} className="glass-card p-3">
                  <span className="font-mono text-[10px] text-white/30 tracking-wider uppercase block">
                    {fact.label}
                  </span>
                  <span className="font-mono text-sm text-white/80 mt-1 block">
                    {fact.value}
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
