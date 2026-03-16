import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSectionObserver } from '@/hooks/useScrollProgress'

gsap.registerPlugin(ScrollTrigger)

interface Skill {
  name: string
  level: number // 0-100
  years: number
}

interface SkillCategory {
  name: string
  color: string
  skills: Skill[]
}

const SKILL_DATA: SkillCategory[] = [
  {
    name: 'Frontend Core',
    color: '#B51A2B',
    skills: [
      { name: 'TypeScript', level: 95, years: 5 },
      { name: 'React', level: 95, years: 6 },
      { name: 'Next.js', level: 85, years: 4 },
      { name: 'Vue.js', level: 70, years: 2 },
      { name: 'HTML / CSS', level: 95, years: 7 },
    ],
  },
  {
    name: 'Animation & 3D',
    color: '#d63040',
    skills: [
      { name: 'GSAP', level: 90, years: 4 },
      { name: 'Framer Motion', level: 85, years: 3 },
      { name: 'Three.js / R3F', level: 75, years: 2 },
      { name: 'GLSL Shaders', level: 60, years: 1 },
      { name: 'Lenis / Scroll', level: 80, years: 3 },
    ],
  },
  {
    name: 'Tooling & Infra',
    color: '#8c1523',
    skills: [
      { name: 'Vite / Webpack', level: 90, years: 5 },
      { name: 'Tailwind CSS', level: 95, years: 4 },
      { name: 'Git / GitHub', level: 90, years: 6 },
      { name: 'CI/CD', level: 75, years: 3 },
      { name: 'Docker', level: 60, years: 2 },
    ],
  },
  {
    name: 'Backend & Data',
    color: '#541A2E',
    skills: [
      { name: 'Node.js', level: 75, years: 4 },
      { name: 'PostgreSQL', level: 65, years: 3 },
      { name: 'REST / GraphQL', level: 85, years: 5 },
      { name: 'Redis', level: 55, years: 2 },
      { name: 'Firebase', level: 70, years: 3 },
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
          <span className="font-mono text-[10px] text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
            {skill.years}y
          </span>
          <span className="font-mono text-[10px] text-white/30">
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

// Radar / Pentagon chart
function RadarChart({ categories, animate }: { categories: SkillCategory[]; animate: boolean }) {
  const size = 200
  const center = size / 2
  const radius = 80
  const rings = 4

  // Average skill level per category
  const values = categories.map(
    (cat) => cat.skills.reduce((sum, s) => sum + s.level, 0) / cat.skills.length / 100
  )
  const count = values.length
  const angleStep = (Math.PI * 2) / count

  // Point positions
  const getPoint = (i: number, r: number) => {
    const angle = angleStep * i - Math.PI / 2
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    }
  }

  // Ring paths
  const ringPaths = Array.from({ length: rings }, (_, ring) => {
    const r = (radius / rings) * (ring + 1)
    return Array.from({ length: count }, (_, i) => {
      const p = getPoint(i, r)
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
    }).join(' ') + ' Z'
  })

  // Data polygon
  const dataPath = values
    .map((v, i) => {
      const r = animate ? v * radius : 0
      const p = getPoint(i, r)
      return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`
    })
    .join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px] mx-auto">
      {/* Rings */}
      {ringPaths.map((path, i) => (
        <path key={i} d={path} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}

      {/* Axis lines */}
      {values.map((_, i) => {
        const p = getPoint(i, radius)
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        )
      })}

      {/* Data polygon */}
      <path
        d={dataPath}
        fill="rgba(181, 26, 43, 0.15)"
        stroke="#B51A2B"
        strokeWidth="1.5"
        className="transition-all duration-1000 ease-out"
      />

      {/* Data points */}
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

      {/* Labels */}
      {categories.map((cat, i) => {
        const p = getPoint(i, radius + 18)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="7"
            fontFamily="JetBrains Mono"
          >
            {cat.name.split(' ')[0]}
          </text>
        )
      })}
    </svg>
  )
}

export function SkillsMatrix() {
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('skills', sectionRef)
  const [animate, setAnimate] = useState(false)
  const [activeCategory, setActiveCategory] = useState<number | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 65%',
        onEnter: () => setAnimate(true),
      })

      gsap.from('.skills-header', {
        opacity: 0, y: 30, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="skills-header">
          <span className="label-mono">Expertise</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mt-3 mb-4">
            Skills & Tools
          </h2>
          <p className="text-white/40 text-base max-w-xl mb-12">
            Technical proficiency across the frontend spectrum — from core frameworks
            to GPU shaders and everything in between.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">
          {/* Skill bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SKILL_DATA.map((category, catIdx) => (
              <div
                key={category.name}
                className={`glass-card p-5 cursor-pointer transition-all ${
                  activeCategory === catIdx ? 'border-crimson-500/20' : ''
                }`}
                onMouseEnter={() => setActiveCategory(catIdx)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="font-mono text-xs text-white/50 tracking-wider uppercase">
                    {category.name}
                  </h3>
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
            ))}
          </div>

          {/* Radar chart */}
          <div className="glass-card p-6 sticky top-24">
            <h4 className="font-mono text-[10px] text-white/30 tracking-wider uppercase mb-4 text-center">
              Proficiency Overview
            </h4>
            <RadarChart categories={SKILL_DATA} animate={animate} />

            {/* Legend */}
            <div className="mt-6 space-y-1.5">
              {SKILL_DATA.map((cat, i) => {
                const avg = Math.round(
                  cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length
                )
                return (
                  <div
                    key={cat.name}
                    className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
                      activeCategory === i ? 'bg-white/5' : ''
                    }`}
                    onMouseEnter={() => setActiveCategory(i)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-mono text-[10px] text-white/40 flex-1">{cat.name}</span>
                    <span className="font-mono text-[10px] text-white/25">{avg}%</span>
                  </div>
                )
              })}
            </div>

            {/* Total count */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <span className="font-mono text-[10px] text-white/20">
                {SKILL_DATA.reduce((s, c) => s + c.skills.length, 0)} skills tracked
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
