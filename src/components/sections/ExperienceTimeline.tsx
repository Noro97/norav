import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'

gsap.registerPlugin(ScrollTrigger)

interface Experience {
  period: string
  role: string
  company: string
  type: string
  description: string
  achievements: string[]
  stack: string[]
}

const EXPERIENCES: Experience[] = [
  {
    period: '2022 — Present',
    role: 'Senior Frontend Engineer',
    company: 'NexusLogistics',
    type: 'Full-time',
    description:
      'Leading frontend architecture for a real-time logistics platform serving 200+ enterprise clients across 18 global hubs.',
    achievements: [
      'Architected real-time dashboard handling 50K+ WebSocket events/sec',
      'Built Mapbox-based fleet visualization with 2000+ concurrent markers at 60fps',
      'Reduced initial bundle size by 42% through code splitting & tree shaking',
      'Led migration from CRA to Vite, cutting CI build times from 8min to 90sec',
    ],
    stack: ['React', 'TypeScript', 'Mapbox GL', 'WebSocket', 'Zustand', 'Vite'],
  },
  {
    period: '2020 — 2022',
    role: 'Frontend Engineer',
    company: 'MerchStack',
    type: 'Full-time',
    description:
      'Core member of the product team building an AI-powered merchandise customization platform with 2M+ monthly active users.',
    achievements: [
      'Built real-time product configurator with live preview & JSON state sync',
      'Implemented GSAP-powered animation system used across 40+ components',
      'Designed component library adopted by 3 cross-functional teams',
      'Achieved 98/100 Lighthouse performance score on key landing pages',
    ],
    stack: ['React', 'Next.js', 'GSAP', 'Tailwind CSS', 'Redux Toolkit', 'Storybook'],
  },
  {
    period: '2019 — 2020',
    role: 'Junior Frontend Developer',
    company: 'DataViz Co.',
    type: 'Full-time',
    description:
      'First engineering role — built interactive data visualization dashboards for financial analytics clients.',
    achievements: [
      'Created 15+ custom D3.js chart components for real-time financial data',
      'First exposure to WebGL & shader programming through data viz experiments',
      'Improved dashboard load performance by 60% via virtualized rendering',
    ],
    stack: ['JavaScript', 'D3.js', 'Vue.js', 'SCSS', 'Node.js'],
  },
  {
    period: '2018 — 2019',
    role: 'Frontend Intern',
    company: 'StartupLab',
    type: 'Internship',
    description:
      'Summer internship turned part-time role building prototypes and MVPs for early-stage startups in the accelerator program.',
    achievements: [
      'Shipped 3 MVP landing pages that helped startups secure seed funding',
      'Learned React ecosystem from scratch and mentored by senior engineers',
    ],
    stack: ['React', 'CSS', 'Firebase', 'Figma'],
  },
]

export function ExperienceTimeline() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('experience', sectionRef)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate timeline line drawing
      gsap.from('.timeline-line-fill', {
        scaleY: 0,
        transformOrigin: 'top',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1,
        },
      })

      // Stagger reveal each card
      gsap.utils.toArray<HTMLElement>('.exp-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          x: i % 2 === 0 ? -40 : 40,
          duration: 0.7,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
          },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <span className="label-mono">Career</span>
        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
          Experience
        </h2>
        <p className="text-white/40 text-base max-w-xl mb-16">
          A timeline of roles and impact — from first lines of code to leading
          frontend architecture at scale.
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/5">
            <div className="timeline-line-fill absolute inset-0 bg-gradient-to-b from-crimson-500/60 via-crimson-500/20 to-transparent" />
          </div>

          {/* Cards */}
          <div className="space-y-12 md:space-y-16">
            {EXPERIENCES.map((exp, i) => {
              const isLeft = i % 2 === 0

              return (
                <div
                  key={exp.company}
                  className={`exp-card relative flex flex-col md:flex-row ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-start gap-8 md:gap-0`}
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-crimson-500 border-2 border-[#0a0a1a] z-10 mt-6 shadow-[0_0_8px_rgba(181,26,43,0.5)]" />

                  {/* Content */}
                  <div
                    className={`ml-12 md:ml-0 md:w-1/2 ${
                      isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'
                    }`}
                  >
                    <div className="glass-card p-6 hover:translate-y-[-2px] transition-transform">
                      {/* Header */}
                      <div className={`flex items-start gap-3 mb-4 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        {/* Company logo placeholder */}
                        <div className="w-10 h-10 rounded-lg bg-crimson-500/10 border border-crimson-500/20 flex items-center justify-center shrink-0">
                          <span className="font-mono text-xs text-crimson-400 font-bold">
                            {exp.company.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base">{exp.role}</h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="font-mono text-xs text-crimson-400">{exp.company}</span>
                            <span className="text-white/15">·</span>
                            <span className="font-mono text-[10px] text-white/30">{exp.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Period badge */}
                      <div className={`mb-3 ${isLeft ? 'md:text-right' : ''}`}>
                        <span className="inline-block px-2 py-0.5 bg-white/5 rounded font-mono text-[10px] text-white/40 tracking-wider">
                          {exp.period}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-white/40 text-sm leading-relaxed mb-4 ${isLeft ? 'md:text-right' : ''}`}>
                        {exp.description}
                      </p>

                      {/* Achievements */}
                      <ul className="space-y-1.5 mb-4">
                        {exp.achievements.map((a, j) => (
                          <li key={j} className={`flex gap-2 text-xs text-white/50 ${isLeft ? 'md:flex-row-reverse md:text-right' : ''}`}>
                            <span className="text-crimson-500 shrink-0 mt-0.5">▸</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Tech stack */}
                      <div className={`flex flex-wrap gap-1.5 ${isLeft ? 'md:justify-end' : ''}`}>
                        {exp.stack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 text-[10px] font-mono text-white/30 bg-white/3 border border-white/5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
