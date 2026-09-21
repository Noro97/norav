import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { CountUp } from '@/components/ui/effects/CountUp'
import type { SkillsContent, SkillsSettings } from '@norav/content-schema'

type SkillCategory = SkillsContent['categories'][number]
type Skill = SkillCategory['skills'][number]

/**
 * The case study a skill points at. A path stays in the app through the
 * router; anything else (a repo, a live product) is a plain link that leaves.
 */
function Proof({ label, href }: { label: string; href: string }) {
  const base = 'type-label inline-flex items-center gap-0.5 text-primary-400/80'
  if (!href) return <span className={base}>{label}</span>
  const className = `${base} hover:text-primary-400 transition-colors`
  const body = (
    <>
      {label}
      <ArrowUpRight className="w-3 h-3" strokeWidth={2} aria-hidden />
    </>
  )
  return href.startsWith('/') ? (
    <Link to={href} className={className}>{body}</Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{body}</a>
  )
}

function SkillBar({ skill, animate, showCounters }: { skill: Skill; animate: boolean; showCounters: boolean }) {
  // The gradient spans the whole track, and the fill uncovers the part of it
  // the skill reaches — so the colour carries the same meaning as the length:
  // a bar that stops early stops in the red, one that runs on ends green.
  const level = Math.min(100, Math.max(0, skill.level))
  const tip = level < 50 ? 'danger' : level < 80 ? 'warning' : 'success'
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-body-xs text-tertiary-ink/60 group-hover:text-tertiary-ink/80 transition-colors">
            {skill.name}
          </span>
          {skill.proof && <Proof label={skill.proof} href={skill.proofHref} />}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-body-xs text-tertiary-ink/40 opacity-0 group-hover:opacity-100 transition-opacity">
            {skill.years}y
          </span>
          <span className="font-mono text-body-xs text-tertiary-ink/45">
            {showCounters ? (
              <CountUp target={skill.level} run={animate} suffix="%" />
            ) : (
              `${skill.level}%`
            )}
          </span>
        </div>
      </div>
      <div className="h-1.5 bg-tertiary-ink/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${level}%` : '0%',
            backgroundImage:
              'linear-gradient(90deg, var(--color-danger), var(--color-warning) 55%, var(--color-success))',
            backgroundSize: level > 0 ? `${(100 / level) * 100}% 100%` : '100% 100%',
            opacity: 0.8,
            boxShadow: `0 0 8px color-mix(in srgb, var(--color-${tip}) 35%, transparent)`,
          }}
        />
      </div>
    </div>
  )
}

function RadarChart({ categories, animate }: { categories: SkillCategory[]; animate: boolean }) {
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
        <path key={i} d={path} fill="none" stroke="color-mix(in srgb, var(--color-tertiary-ink) 4%, transparent)" strokeWidth="0.5" />
      ))}
      {values.map((_, i) => {
        const p = getPoint(i, radius)
        return (
          <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="color-mix(in srgb, var(--color-tertiary-ink) 4%, transparent)" strokeWidth="0.5" />
        )
      })}
      <path
        d={dataPath}
        fill="color-mix(in_srgb,var(--color-primary-500)_15%,transparent)"
        stroke="var(--color-primary-500)"
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
            fill="var(--color-primary-500)"
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
            fill="color-mix(in srgb, var(--color-tertiary-ink) 50%, transparent)"
            fontSize="9"
            fontFamily="var(--font-mono)"
          >
            {cat.name.split(' ')[0]}
          </text>
        )
      })}
    </svg>
  )
}

/**
 * A category's dot colour, mixed from the palette.
 *
 * This was a hex typed into the CMS per category, seeded with the old brand
 * crimson and one violet — five values that survived every palette change, so
 * the panel showed four shades of a red the site had stopped using next to a
 * purple that was never in it. Nobody needs to hand-pick five colours that have
 * no meaning beyond telling five rows apart, and a field whose only correct
 * answer is "whatever the palette says" should not be a field.
 *
 * The ramp runs accent to secondary across however many categories there are.
 * color-mix interpolates in the browser, so it re-mixes on a publish with no
 * JavaScript watching the theme.
 */
function categoryColour(index: number, count: number): string {
  const ratio = count > 1 ? Math.round((index / (count - 1)) * 100) : 0
  return `color-mix(in srgb, var(--color-secondary-500) ${ratio}%, var(--color-primary-500))`
}

/** The same colour as a wash behind a card. */
function categoryGlow(index: number, count: number): string {
  return `color-mix(in srgb, ${categoryColour(index, count)} 8%, transparent)`
}

export function SkillsMatrix({ anchorId }: { anchorId?: string | null }) {
  const block = useBlock<SkillsContent, SkillsSettings>('skills')
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver(anchorId ?? 'skills', sectionRef)
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

  if (!block) return null
  const { content, settings } = block
  const categories = content.categories
  const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0)

  return (
    <section
      id={anchorId ?? 'skills'}
      ref={sectionRef}
      className="relative px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="skills-header">
          <span className="label-mono">{content.sectionLabel}</span>
          <div className="mt-3 mb-4">
            <h2 className="font-display text-display-lg font-black text-tertiary-ink">
              {content.title}
            </h2>
          </div>
          <p className="text-tertiary-ink/40 text-body-md max-w-xl mb-12">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          {/* Skill category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {categories.map((category, catIdx) => (
              <div
                key={category.name}
                className={`skill-card relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-5 transition-all duration-300 hover:border-primary-500/20 hover:shadow-[0_0_40px_-12px_color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] ${
                  activeCategory === catIdx ? 'border-primary-500/20' : ''
                }`}
                onMouseEnter={() => setActiveCategory(catIdx)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                {/* Subtle category glow */}
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ backgroundColor: categoryGlow(catIdx, categories.length) }}
                />

                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColour(catIdx, categories.length) }}
                    />
                    <h3 className="type-label text-tertiary-ink/50">
                      {category.name}
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-tertiary-ink/[0.06] to-transparent" />
                    <span className="font-mono text-body-xs text-tertiary-ink/40">
                      {Math.round(category.skills.reduce((s, sk) => s + sk.level, 0) / category.skills.length)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {category.skills.map((skill) => (
                      <SkillBar
                        key={skill.name}
                        skill={skill}
                        animate={animate}
                        showCounters={settings.showCounters}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Radar chart sidebar */}
          <div className="sticky top-24 rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl p-6">
            <h4 className="type-label text-tertiary-ink/45 mb-4 text-center">
              {content.proficiencyOverview}
            </h4>
            <RadarChart categories={categories} animate={animate} />

            {/* Legend */}
            <div className="mt-6 space-y-1.5">
              {categories.map((cat, i) => {
                const avg = Math.round(
                  cat.skills.reduce((s, sk) => s + sk.level, 0) / cat.skills.length
                )
                return (
                  <div
                    key={cat.name}
                    className={`flex items-center gap-2 px-2 py-1 rounded transition-all cursor-default ${
                      activeCategory === i ? 'bg-tertiary-ink/5' : ''
                    }`}
                    onMouseEnter={() => setActiveCategory(i)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColour(i, categories.length) }}
                    />
                    <span className="font-mono text-body-xs text-tertiary-ink/40 flex-1">{cat.name}</span>
                    <span className="font-mono text-body-xs text-tertiary-ink/40">{avg}%</span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-tertiary-ink/5 text-center">
              <span className="font-mono text-body-xs text-tertiary-ink/40">
                {content.skillsTracked.replace('{{count}}', String(totalSkills))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
