import { useTranslation } from 'react-i18next'
import type { BentoProject } from './bento.data'

interface BentoProjectTileProps {
  project: BentoProject
  className?: string
}

export function BentoProjectTile({ project, className = '' }: BentoProjectTileProps) {
  const { t } = useTranslation('bento')

  const handleScrollTo = () => {
    document.getElementById(project.targetSectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`bento-tile glass-card overflow-hidden ${className}`}>
      {/* Gradient header */}
      <div className="h-2 bg-gradient-to-r from-crimson-500/40 via-crimson-600/20 to-transparent" />

      <div className="p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">
          {t(project.titleKey)}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed">
          {t(project.descriptionKey)}
        </p>

        {/* Tech stack badges */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-[10px] font-mono text-white/30 border border-white/8 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        <button
          onClick={handleScrollTo}
          aria-label={`${t(project.ctaKey)} - ${t(project.titleKey)}`}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono text-crimson-400 border border-crimson-500/20 rounded bg-crimson-500/5 hover:bg-crimson-500/10 hover:border-crimson-500/40 transition-all uppercase tracking-wider"
        >
          {t(project.ctaKey)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
