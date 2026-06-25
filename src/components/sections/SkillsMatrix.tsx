import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'

interface Skill {
  name: string
  level: number
  years: number
}

interface SkillCategory {
  nameKey: string
  color: string
  skills: Skill[]
}

const SKILL_DATA: SkillCategory[] = [
  {
    nameKey: 'categories.0.name',
    color: '#B51A2B',
    skills: [
      { name: 'React.js', level: 95, years: 7 },
      { name: 'TypeScript', level: 95, years: 6 },
      { name: 'Next.js (SSR/ISR)', level: 90, years: 5 },
      { name: 'Vue.js / Nuxt.js', level: 85, years: 4 },
      { name: 'HTML5 / CSS3', level: 95, years: 7 },
      { name: 'Micro-frontends', level: 75, years: 2 },
    ],
  },
  {
    nameKey: 'categories.1.name',
    color: '#d63040',
    skills: [
      { name: 'Redux Toolkit', level: 90, years: 5 },
      { name: 'Zustand / Pinia', level: 85, years: 3 },
      { name: 'TanStack Query/Table', level: 85, years: 3 },
      { name: 'Context API / MobX', level: 80, years: 4 },
      { name: 'GraphQL / REST API', level: 90, years: 6 },
    ],
  },
  {
    nameKey: 'categories.2.name',
    color: '#8c1523',
    skills: [
      { name: 'Tailwind CSS', level: 95, years: 5 },
      { name: 'Styled Components', level: 90, years: 4 },
      { name: 'Material UI', level: 80, years: 3 },
      { name: 'Sass / Bootstrap', level: 85, years: 6 },
      { name: 'Design Systems', level: 85, years: 3 },
    ],
  },
  {
    nameKey: 'categories.3.name',
    color: '#541A2E',
    skills: [
      { name: 'Vite / Webpack', level: 90, years: 5 },
      { name: 'Storybook', level: 85, years: 3 },
      { name: 'Vitest / Jest', level: 80, years: 4 },
      { name: 'Docker / CI/CD', level: 70, years: 3 },
      { name: 'Git / GitHub', level: 90, years: 7 },
    ],
  },
  {
    nameKey: 'categories.4.name',
    color: '#6C3AED',
    skills: [
      { name: 'Telegram Mini Apps', level: 85, years: 2 },
      { name: 'Supabase / PostgreSQL', level: 75, years: 3 },
      { name: 'Node.js / Vercel', level: 80, years: 5 },
      { name: 'Claude Code', level: 70, years: 1 },
      { name: 'Feature-Sliced Design', level: 80, years: 3 },
    ],
  },
]

function SkillBar({ skill, color, animate }: { skill: Skill; color: string; animate: boolean }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs text-white/60 group-hover:text-white/80 transition-colors">
          {skill.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {skill.years}y
          </span>
          <span className="font-mono text-xs text-white/45">
            {skill.level}%
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${skill.level}%` : '0%',
            backgroundColor: color,
            opacity: 0.7,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  )
}

function RadarChart({ categories, animate, t }: { categories: SkillCategory[]; animate: boolean; t: (key: string) => string }) {
  const size = 200
  const center = size / 2
  const radius = 80
  const rings = 4

  const values = categories.map(
    (cat) => cat.skills.reduce((sum, s) => sum + s.level, 0) / cat.skills.length / 100
  )
  const count = values.length
  const angleStep = (Math.PI * 2) / count

  const getPoint = (i: number, r: number) => {
    const angle = angleStep * i - Math.PI / 2
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    }
  }

  const ringPaths = Array.from({ length: rings }, (_, ring) => {
    const r = (radius / rings) * (ring + 1)
    return Array.from({ length: count }, (_, i) => {
      const p = getPoint(i, r)
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
    }).join(' ') + ' Z'
  })

  const dataPath = values
    .map((v, i) => {
      const r = animate ? v * radius : 0
      const p = getPoint(i, r)
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
    })
    .join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {ringPaths.map((path, i) => (
        <path key={i} d={path} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {values.map((_, i) => {
        const p = getPoint(i, radius)
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        )
      })}
      <path
        d={dataPath}
        fill="rgba(181, 26, 43, 0.15)"
        stroke="#B51A2B"
        strokeWidth="1.5"
        className="transition-all duration-1000 ease-out"
      />
      {values.map((v, i) => {
        const r = animate ? v * radius : 0
        const p = getPoint(i, r)
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#B51A2B"
            className="transition-all duration-1000 ease-out"
          />
        )
      })}
      {categories.map((cat, i) => {
        const p = getPoint(i, radius + 18)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="9"
            fontFamily="JetBrains Mono"
          >
            {t(cat.nameKey).split(' ')[0]}
          </text>
        )
      })}
    </svg>
  )
}

export function SkillsMatrix() {
  const { t } = useTranslation('skills')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('skills', sectionRef)
  const [animate, setAnimate] = useState(false)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  useGSAP(() => {
    const section = sectionRef.current!
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      onEnter: () => setAnimate(true),
    })

    const header = section.querySelector('.skills-header')
    if (header) {
      gsap.fromTo(header.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1,
          scrollTrigger: { trigger: section, start: 'top 85%' } }
      )
    }

    const cards = section.querySelectorAll('.skill-card')
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%' } }
      )
    }
  }, { scope: sectionRef })

  const totalSkills = SKILL_DATA.reduce((s, c) => s + c.skills.length, 0)

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="skills-header">
          <span className="label-mono">{t('sectionLabel')}</span>
          <div className="mt-3 mb-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {t('title')}
            </h2>
          </div>
          <p className="text-white/40 text-base max-w-xl mb-12">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          {/* Skill category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {SKILL_DATA.map((category, catIdx) => (
              <div
                key={category.nameKey}
                className={`skill-card relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-5 transition-all duration-300 hover:border-crimson-500/20 hover:shadow-[0_0_40px_-12px_rgba(181,26,43,0.1)] ${
                  activeCategory === catIdx ? 'border-crimson-500/20' : ''
                }`}
                onMouseEnter={() => setActiveCategory(catIdx)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                {/* Subtle category glow */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: `${category.color}15` }}
                />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-mono text-xs text-white/50 tracking-[0.15em] uppercase">
                      {t(category.nameKey)}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span className="font-mono text-xs text-white/40">
                      {Math.round(category.skills.reduce((s, sk) => s + sk.level, 0) / category.skills.length)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {category.skills.map((skill) => (
                      <SkillBar
                        key={skill.name}
                        skill={skill}
                        color={category.color}
                        animate={animate}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart sidebar */}
          <div className="sticky top-24 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl p-6">
            <h4 className="font-mono text-xs text-white/45 tracking-wider uppercase mb-4 text-center">
              {t('proficiencyOverview')}
            </h4>
            <RadarChart categories={SKILL_DATA} animate={animate} t={t} />

            {/* Legend */}
            <div className="mt-6 space-y-1.5">
              {SKILL_DATA.map((cat, i) => {
                const avg = Math.round(
                  cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length
                )
                return (
                  <div
                    key={cat.nameKey}
                    className={`flex items-center gap-2 px-2 py-1 rounded transition-all cursor-default ${
                      activeCategory === i ? 'bg-white/5' : ''
                    }`}
                    onMouseEnter={() => setActiveCategory(i)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-mono text-xs text-white/40 flex-1">{t(cat.nameKey)}</span>
                    <span className="font-mono text-xs text-white/40">{avg}%</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="font-mono text-xs text-white/40">
                {t('skillsTracked', { count: totalSkills })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
